import { Request, Response } from 'express';
import { PatternCategory } from '../models/PatternCategory';
import { Pattern } from '../models/Pattern';
import { PatternProblem } from '../models/PatternProblem';
import { MasterProblem } from '../models/MasterProblem';
import { UserProgress } from '../models/UserProgress';
import { ApiResponse } from '../utils/ApiResponse';

// ---------------------------------------------------------------------------
// GET /api/patterns/categories
// Returns all categories with their patterns (no progress)
// ---------------------------------------------------------------------------
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await PatternCategory.find({ active: true })
      .sort({ order: 1 })
      .lean();

    const data = [];
    for (const cat of categories) {
      const patterns = await Pattern.find({ categoryId: cat._id, active: true })
        .sort({ order: 1 })
        .lean();

      const patternsWithCounts = [];
      let categoryTotal = 0;

      for (const pat of patterns) {
        const count = await PatternProblem.countDocuments({ patternId: pat._id });
        categoryTotal += count;
        patternsWithCounts.push({
          _id: pat._id,
          title: pat.title,
          description: pat.description,
          difficulty: pat.difficulty,
          order: pat.order,
          totalProblems: count,
        });
      }

      data.push({
        _id: cat._id,
        title: cat.title,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        totalProblems: categoryTotal,
        patterns: patternsWithCounts,
      });
    }

    return res.status(200).json(new ApiResponse(200, data));
  } catch (error: any) {
    console.error('[patterns:categories] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/patterns/categories/progress
// Returns categories with patterns + per-user solved/total counts
// ---------------------------------------------------------------------------
export const getCategoriesWithProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const categories = await PatternCategory.find({ active: true })
      .sort({ order: 1 })
      .lean();

    const data = [];
    for (const cat of categories) {
      const patterns = await Pattern.find({ categoryId: cat._id, active: true })
        .sort({ order: 1 })
        .lean();

      const patternsWithProgress = [];
      let categorySolved = 0;
      let categoryTotal = 0;

      for (const pat of patterns) {
        const patternProblems = await PatternProblem.find({ patternId: pat._id }).lean();
        const mpIds = patternProblems.map(pp => pp.masterProblemId);
        const total = mpIds.length;

        let solved = 0;
        if (total > 0) {
          const solvedCount = await UserProgress.countDocuments({
            userId,
            problemId: { $in: mpIds },
            solved: true,
          });
          solved = solvedCount;
        }

        categorySolved += solved;
        categoryTotal += total;

        patternsWithProgress.push({
          _id: pat._id,
          title: pat.title,
          description: pat.description,
          difficulty: pat.difficulty,
          order: pat.order,
          totalProblems: total,
          solvedProblems: solved,
          progressPercentage: total > 0 ? Math.round((solved / total) * 100) : 0,
        });
      }

      data.push({
        _id: cat._id,
        title: cat.title,
        description: cat.description,
        icon: cat.icon,
        order: cat.order,
        totalProblems: categoryTotal,
        solvedProblems: categorySolved,
        progressPercentage: categoryTotal > 0 ? Math.round((categorySolved / categoryTotal) * 100) : 0,
        patterns: patternsWithProgress,
      });
    }

    return res.status(200).json(new ApiResponse(200, data));
  } catch (error: any) {
    console.error('[patterns:categories:progress] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/patterns/:patternId
// Returns a single pattern with ALL its problems (full details)
// ---------------------------------------------------------------------------
export const getPatternDetail = async (req: Request, res: Response) => {
  try {
    const { patternId } = req.params;
    const userId = (req as any).auth?.userId;

    const pattern = await Pattern.findById(patternId).lean();
    if (!pattern) {
      return res.status(404).json({ success: false, message: 'Pattern not found' });
    }

    const category = await PatternCategory.findById(pattern.categoryId).lean();

    const patternProblems = await PatternProblem.find({ patternId })
      .sort({ order: 1 })
      .lean();

    const mpIds = patternProblems.map(pp => pp.masterProblemId);
    const masterProblems = await MasterProblem.find({ problemId: { $in: mpIds }, active: true }).lean();

    const mpMap = new Map<number, typeof masterProblems[0]>();
    for (const mp of masterProblems) {
      mpMap.set(mp.problemId, mp);
    }

    let userProgressMap = new Map<number, boolean>();
    if (userId) {
      const progressEntries = await UserProgress.find({
        userId,
        problemId: { $in: mpIds },
        solved: true,
      }).lean();
      for (const entry of progressEntries) {
        userProgressMap.set(entry.problemId, true);
      }
    }

    const problems = patternProblems.map(pp => {
      const mp = mpMap.get(pp.masterProblemId);
      if (!mp) return null;
      return {
        problemId: mp.problemId,
        name: mp.title,
        difficulty: mp.difficulty,
        platform: mp.platform,
        link: mp.link,
        links: mp.links || {},
        youtubeUrl: mp.youtubeUrl || '',
        articleUrl: mp.articleUrl || '',
        videos: mp.videos || [],
        editorials: mp.editorials || [],
        tags: mp.tags || [],
        solved: userProgressMap.has(mp.problemId) || false,
      };
    }).filter((p): p is NonNullable<typeof p> => p !== null);

    const totalProblems = problems.length;
    const solvedProblems = problems.filter(p => p.solved).length;

    return res.status(200).json(
      new ApiResponse(200, {
        pattern: {
          _id: pattern._id,
          title: pattern.title,
          description: pattern.description,
          difficulty: pattern.difficulty,
          order: pattern.order,
        },
        category: category ? {
          _id: category._id,
          title: category.title,
          icon: category.icon,
        } : null,
        totalProblems,
        solvedProblems,
        progressPercentage: totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0,
        problems,
      })
    );
  } catch (error: any) {
    console.error('[patterns:detail] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/patterns/stats
// Returns aggregated analytics: solved by category, by difficulty, weak patterns
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// GET /api/patterns/progress/:patternId
// Returns per-user progress for a single pattern (lightweight, no problems)
// ---------------------------------------------------------------------------
export const getPatternProgress = async (req: Request, res: Response) => {
  try {
    const { patternId } = req.params;
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const pattern = await Pattern.findById(patternId).lean();
    if (!pattern) {
      return res.status(404).json({ success: false, message: 'Pattern not found' });
    }

    const category = await PatternCategory.findById(pattern.categoryId).select('title icon').lean();
    const patternProblems = await PatternProblem.find({ patternId }).lean();
    const mpIds = patternProblems.map(pp => pp.masterProblemId);
    const total = mpIds.length;

    let solved = 0;
    if (total > 0) {
      solved = await UserProgress.countDocuments({
        userId,
        problemId: { $in: mpIds },
        solved: true,
      });
    }

    return res.status(200).json(
      new ApiResponse(200, {
        patternId: pattern._id,
        patternTitle: pattern.title,
        category: category ? { title: category.title, icon: category.icon } : null,
        difficulty: pattern.difficulty,
        totalProblems: total,
        solvedProblems: solved,
        progressPercentage: total > 0 ? Math.round((solved / total) * 100) : 0,
      })
    );
  } catch (error: any) {
    console.error('[patterns:progress] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/patterns/stats
// Returns aggregated analytics: solved by category, by difficulty, weak patterns
// ---------------------------------------------------------------------------
export const getPatternStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const categories = await PatternCategory.find({ active: true }).sort({ order: 1 }).lean();

    const categoryStats = [];
    let totalSolved = 0;
    let totalProblems = 0;
    const difficultyBreakdown: Record<string, { total: number; solved: number }> = {};
    const weakPatterns: Array<{ title: string; solved: number; total: number; percentage: number }> = [];

    for (const cat of categories) {
      const patterns = await Pattern.find({ categoryId: cat._id, active: true }).lean();
      let catSolved = 0;
      let catTotal = 0;

      for (const pat of patterns) {
        const patternProblems = await PatternProblem.find({ patternId: pat._id }).lean();
        const mpIds = patternProblems.map(pp => pp.masterProblemId);
        const total = mpIds.length;
        catTotal += total;

        if (!difficultyBreakdown[pat.difficulty]) {
          difficultyBreakdown[pat.difficulty] = { total: 0, solved: 0 };
        }
        difficultyBreakdown[pat.difficulty].total += total;

        let solved = 0;
        if (total > 0) {
          solved = await UserProgress.countDocuments({
            userId,
            problemId: { $in: mpIds },
            solved: true,
          });
          difficultyBreakdown[pat.difficulty].solved += solved;
        }
        catSolved += solved;

        const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
        if (pct < 50 && total > 0) {
          weakPatterns.push({ title: pat.title, solved, total, percentage: pct });
        }
      }

      totalSolved += catSolved;
      totalProblems += catTotal;
      categoryStats.push({
        title: cat.title,
        icon: cat.icon,
        solved: catSolved,
        total: catTotal,
        percentage: catTotal > 0 ? Math.round((catSolved / catTotal) * 100) : 0,
      });
    }

    weakPatterns.sort((a, b) => a.percentage - b.percentage);

    return res.status(200).json(
      new ApiResponse(200, {
        overallProgress: {
          solved: totalSolved,
          total: totalProblems,
          percentage: totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0,
        },
        byCategory: categoryStats,
        byDifficulty: difficultyBreakdown,
        weakPatterns,
      })
    );
  } catch (error: any) {
    console.error('[patterns:stats] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/patterns/analytics
// Returns FULL pattern analytics: stats, streaks, charts, heatmap, patterns
// ---------------------------------------------------------------------------
export const getPatternAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const [
      categories,
      allPatterns,
      allPatternProblems,
      userProgress,
      masterProblems,
    ] = await Promise.all([
      PatternCategory.find({ active: true }).sort({ order: 1 }).lean(),
      Pattern.find({ active: true }).sort({ order: 1 }).lean(),
      PatternProblem.find({}).lean(),
      UserProgress.find({ userId, solved: true }).select('problemId solvedAt').lean(),
      MasterProblem.find({ active: true }).lean(),
    ]);

    const mpMap = new Map<number, typeof masterProblems[0]>();
    for (const mp of masterProblems) mpMap.set(mp.problemId, mp);

    const solvedSet = new Set<number>();
    const solvedEntries: Array<{ problemId: number; solvedAt: Date | null }> = [];
    for (const up of userProgress) {
      solvedSet.add(up.problemId);
      solvedEntries.push({ problemId: up.problemId, solvedAt: up.solvedAt });
    }

    const patternProblemsMap = new Map<string, number[]>();
    for (const pp of allPatternProblems) {
      const id = pp.patternId.toString();
      if (!patternProblemsMap.has(id)) patternProblemsMap.set(id, []);
      patternProblemsMap.get(id)!.push(pp.masterProblemId);
    }

    const categoryMap = new Map<string, string>();
    for (const cat of categories) {
      for (const pat of allPatterns) {
        if (pat.categoryId.toString() === cat._id.toString()) {
          categoryMap.set(pat._id.toString(), cat.title);
        }
      }
    }

    const patternStats: any[] = [];
    let totalProblems = 0;
    let totalSolved = 0;
    const difficultySolved: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    const difficultyTotal: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    const weakPatterns: any[] = [];
    const strongPatterns: any[] = [];

    for (const pat of allPatterns) {
      const patId = pat._id.toString();
      const mpIds = patternProblemsMap.get(patId) || [];
      const total = mpIds.length;
      const solved = mpIds.filter(id => solvedSet.has(id)).length;
      const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

      totalProblems += total;
      totalSolved += solved;

      const easyS = mpIds.filter(id => mpMap.get(id)?.difficulty === 'Easy' && solvedSet.has(id)).length;
      const medS = mpIds.filter(id => mpMap.get(id)?.difficulty === 'Medium' && solvedSet.has(id)).length;
      const hardS = mpIds.filter(id => mpMap.get(id)?.difficulty === 'Hard' && solvedSet.has(id)).length;
      const easyT = mpIds.filter(id => mpMap.get(id)?.difficulty === 'Easy').length;
      const medT = mpIds.filter(id => mpMap.get(id)?.difficulty === 'Medium').length;
      const hardT = mpIds.filter(id => mpMap.get(id)?.difficulty === 'Hard').length;

      difficultySolved.Easy += easyS;
      difficultySolved.Medium += medS;
      difficultySolved.Hard += hardS;
      difficultyTotal.Easy += easyT;
      difficultyTotal.Medium += medT;
      difficultyTotal.Hard += hardT;

      const patternSolvedEntries = solvedEntries
        .filter(e => mpIds.includes(e.problemId))
        .sort((a, b) => new Date(b.solvedAt || 0).getTime() - new Date(a.solvedAt || 0).getTime());

      patternStats.push({
        patternId: pat._id,
        patternTitle: pat.title,
        categoryTitle: categoryMap.get(patId) || '',
        difficulty: pat.difficulty,
        totalProblems: total,
        solvedProblems: solved,
        remainingProblems: total - solved,
        completionPercentage: pct,
        easySolved: easyS,
        mediumSolved: medS,
        hardSolved: hardS,
        easyTotal: easyT,
        mediumTotal: medT,
        hardTotal: hardT,
        lastSolved: patternSolvedEntries.length > 0 ? patternSolvedEntries[0].solvedAt : null,
      });

      if (pct < 30 && total > 0) weakPatterns.push({ patternId: pat._id, title: pat.title, solved, total, percentage: pct });
      if (pct > 80 && total > 0) strongPatterns.push({ patternId: pat._id, title: pat.title, solved, total, percentage: pct });
    }

    const dates = solvedEntries
      .filter(e => e.solvedAt)
      .map(e => { const d = new Date(e.solvedAt!); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); })
      .sort((a, b) => b - a);

    const uniqueDates = [...new Set(dates)];
    let currentStreak = 0;
    let longestStreak = 0;

    if (uniqueDates.length > 0) {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayTime = todayStart.getTime();
      const latestDate = uniqueDates[0];
      const gap = Math.round((todayTime - latestDate) / (1000 * 60 * 60 * 24));

      if (gap <= 1) {
        currentStreak = 1;
        let idx = 0;
        for (let i = 1; i < uniqueDates.length; i++) {
          if (Math.round((uniqueDates[idx] - uniqueDates[i]) / (1000 * 60 * 60 * 24)) === 1) {
            currentStreak++; idx = i;
          } else break;
        }
      }

      longestStreak = 1; let tmp = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        if (Math.round((uniqueDates[i] - uniqueDates[i + 1]) / (1000 * 60 * 60 * 24)) === 1) {
          tmp++; longestStreak = Math.max(longestStreak, tmp);
        } else tmp = 1;
      }
    }

    const now = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(now); d.setDate(d.getDate() - n);
      return d;
    };
    const countForDay = (d: Date) => {
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 86400000;
      return solvedEntries.filter(e => {
        if (!e.solvedAt) return false;
        const t = new Date(e.solvedAt).getTime();
        return t >= start && t < end;
      }).length;
    };

    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      weeklyProgress.push({ date: d.toISOString().split('T')[0], solved: countForDay(d) });
    }

    const monthlyProgress = [];
    for (let i = 29; i >= 0; i--) {
      const d = daysAgo(i);
      monthlyProgress.push({ date: d.toISOString().split('T')[0], solved: countForDay(d) });
    }

    const heatmapData = [];
    for (let i = 364; i >= 0; i--) {
      const d = daysAgo(i);
      heatmapData.push({ date: d.toISOString().split('T')[0], count: countForDay(d) });
    }

    const recentSolved = await UserProgress.aggregate([
      { $match: { userId, solved: true, solvedAt: { $ne: null } } },
      { $sort: { solvedAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'masterproblems',
          localField: 'problemId',
          foreignField: 'problemId',
          as: 'problem',
        },
      },
      { $unwind: { path: '$problem', preserveNullAndEmptyArrays: true } },
      { $project: { problemId: 1, solvedAt: 1, title: '$problem.title', difficulty: '$problem.difficulty', _id: 0 } },
    ]);

    const earliest = dates.length > 0 ? Math.min(...dates) : Date.now();
    const daysSince = Math.max(1, Math.round((Date.now() - earliest) / (1000 * 60 * 60 * 24)));
    const avgProblemsPerDay = Math.round((totalSolved / daysSince) * 10) / 10;

    const patternsCompleted = patternStats.filter(p => p.completionPercentage >= 100).length;
    const totalPatterns = allPatterns.length;

    return res.status(200).json(
      new ApiResponse(200, {
        totalSolved,
        totalProblems,
        completionPercentage: totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0,
        patternsCompleted,
        totalPatterns,
        difficultySolved,
        difficultyTotal,
        currentStreak,
        longestStreak,
        avgProblemsPerDay,
        weeklyProgress,
        monthlyProgress,
        patternStats,
        weakPatterns,
        strongPatterns,
        recentSolved,
        heatmapData,
      })
    );
  } catch (error: any) {
    console.error('[patterns:analytics] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
