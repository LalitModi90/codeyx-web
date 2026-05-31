import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserProgress } from '../models/UserProgress';
import { MasterProblem } from '../models/MasterProblem';
import { SheetProblem } from '../models/SheetProblem';
import { PlatformStats } from '../models/platformStats.model';
import { UserActivity } from '../models/UserActivity';
import { DsaSheet } from '../models/DsaSheet';
import { DsaStep } from '../models/DsaStep';
import { ApiResponse } from '../utils/ApiResponse';

// ---------------------------------------------------------------------------
// Helper: get solved counts per stepId in a SINGLE aggregation (no N+1)
// ---------------------------------------------------------------------------
const getSolvedCountsByStep = async (
  userId: string,
  stepIds: mongoose.Types.ObjectId[],
  sheetProblems: any[]
): Promise<Map<string, number>> => {
  const sheetProblemIds = sheetProblems.map((p) => p.masterProblemId);
  const solvedDocs = await UserProgress.find(
    { userId, problemId: { $in: sheetProblemIds }, solved: true },
    { problemId: 1, _id: 0 }
  ).lean();

  const solvedSet = new Set(solvedDocs.map((doc) => doc.problemId));
  const map = new Map<string, number>();

  for (const sp of sheetProblems) {
    if (solvedSet.has(sp.masterProblemId)) {
      const stepIdStr = sp.stepId.toString();
      map.set(stepIdStr, (map.get(stepIdStr) || 0) + 1);
    }
  }

  return map;
};

// ---------------------------------------------------------------------------
// POST /api/progress/toggle
// Stable toggle: if solved exists → remove, else → create
// ---------------------------------------------------------------------------
export const toggleProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { problemId, sheetId, stepId } = req.body;

    if (problemId === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existing = await UserProgress.findOne({ userId, problemId });

    if (existing && existing.solved) {
      // If revision or notes remain, keep row but mark unsolved
      if (existing.revisionPending || existing.notes) {
        await UserProgress.updateOne(
          { userId, problemId },
          { $set: { solved: false, solvedAt: null } }
        );
      } else {
        await UserProgress.deleteOne({ userId, problemId });
      }
      
      // Update PlatformStats for Codeyx
      await PlatformStats.findOneAndUpdate(
        { userId, platform: 'codeyx' },
        { 
          $inc: { totalSolved: -1 },
          $setOnInsert: { username: userId, stats: {}, rating: 0 }
        },
        { upsert: true }
      );

      return res.status(200).json(new ApiResponse(200, { problemId, solved: false }));
    } else {
      const setFields: Record<string, any> = {
        userId,
        problemId,
        solved: true,
        solvedAt: new Date(),
      };
      if (sheetId) setFields.sheetId = sheetId;
      if (stepId) setFields.stepId = stepId;
      if (existing) {
        await UserProgress.updateOne({ userId, problemId }, { $set: setFields });
      } else {
        setFields.revisionPending = false;
        setFields.notes = '';
        await UserProgress.create(setFields);
      }
      
      // Update PlatformStats for Codeyx
      await PlatformStats.findOneAndUpdate(
        { userId, platform: 'codeyx' },
        { 
          $inc: { totalSolved: 1 },
          $setOnInsert: { username: userId, stats: {}, rating: 0 }
        },
        { upsert: true }
      );

      // Log Activity
      const problemDoc = await MasterProblem.findOne({ problemId });
      const title = problemDoc ? `Solved ${problemDoc.title}` : `Solved Problem #${problemId}`;
      await UserActivity.create({
        userId,
        type: 'solved_problem',
        title,
        problemId,
        sheetId
      });

      return res.status(200).json(new ApiResponse(200, { problemId, solved: true }));
    }
  } catch (error: any) {
    console.error('[toggleProgress] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/progress/update
// Sparse upsert: create only when solved/noted, delete when unsolved
// ---------------------------------------------------------------------------
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { sheetId, stepId, problemId, solved, revisionPending, notes } = req.body;

    if (problemId === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existing = await UserProgress.findOne({ userId, problemId });
    // console.log("Force nodemon restart");

    if (solved) {
      const setFields: Record<string, any> = {
        userId,
        problemId,
        solved: true,
        revisionPending: revisionPending || false,
        solvedAt: new Date(),
      };
      if (sheetId) setFields.sheetId = sheetId;
      if (stepId) setFields.stepId = stepId;
      if (notes !== undefined) setFields.notes = notes;

      await UserProgress.updateOne(
        { userId, problemId },
        { $set: setFields },
        { upsert: true }
      );
      // Update PlatformStats for Codeyx
      const isNewSolve = !existing || !existing.solved;
      if (isNewSolve) {
        await PlatformStats.findOneAndUpdate(
          { userId, platform: 'codeyx' },
          { 
            $inc: { totalSolved: 1 },
            $setOnInsert: { username: userId, stats: {}, rating: 0 }
          },
          { upsert: true }
        );

        // Log Activity
        const problemDoc = await MasterProblem.findOne({ problemId });
        const title = problemDoc ? `Solved ${problemDoc.title}` : `Solved Problem #${problemId}`;
        await UserActivity.create({
          userId,
          type: 'solved_problem',
          title,
          problemId,
          sheetId
        });
      }
    } else {
      // Remove sparse row to keep DB footprint minimal
      const wasSolved = existing && existing.solved;
      await UserProgress.deleteOne({ userId, problemId });
      
      if (wasSolved) {
        await PlatformStats.findOneAndUpdate(
          { userId, platform: 'codeyx' },
          { 
            $inc: { totalSolved: -1 },
            $setOnInsert: { username: userId, stats: {}, rating: 0 }
          },
          { upsert: true }
        );
      }
    }

    return res.status(200).json(new ApiResponse(200, { problemId, solved: solved || false }));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/progress/revision
// Toggle revisionPending without changing solved state
// ---------------------------------------------------------------------------
export const updateRevision = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { problemId, revisionPending, sheetId, stepId } = req.body;

    if (problemId === undefined || revisionPending === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Only create/update a row if we are marking for revision
    // If un-marking AND problem is not solved, clean up the sparse row entirely
    const existing = await UserProgress.findOne({ userId, problemId });

    if (!existing) {
      if (revisionPending) {
        // Create a sparse row just to track revision intent
        await UserProgress.create({
          userId,
          problemId,
          sheetId: sheetId || undefined,
          stepId: stepId || undefined,
          solved: false,
          revisionPending: true,
          solvedAt: null,
        });
      }
      // If !revisionPending and no doc exists, nothing to do
    } else {
      if (!revisionPending && !existing.solved && !existing.notes) {
        // Row has no meaningful data left — delete it
        await UserProgress.deleteOne({ userId, problemId });
      } else {
        await UserProgress.updateOne({ userId, problemId }, { $set: { revisionPending } });
      }
    }

    return res.status(200).json(new ApiResponse(200, { problemId, revisionPending }));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/progress/note
// Save or clear a note on a problem (creates sparse row if needed)
// ---------------------------------------------------------------------------
export const updateNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { problemId, notes, sheetId, stepId } = req.body;

    if (problemId === undefined || notes === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const trimmedNotes = notes.trim();
    const existing = await UserProgress.findOne({ userId, problemId });

    if (!existing) {
      if (trimmedNotes) {
        await UserProgress.create({
          userId,
          problemId,
          sheetId: sheetId || undefined,
          stepId: stepId || undefined,
          solved: false,
          revisionPending: false,
          notes: trimmedNotes,
          solvedAt: null,
        });
      }
    } else {
      if (!trimmedNotes && !existing.solved && !existing.revisionPending) {
        // Row has no meaningful data — remove it
        await UserProgress.deleteOne({ userId, problemId });
      } else {
        await UserProgress.updateOne({ userId, problemId }, { $set: { notes: trimmedNotes } });
      }
    }

    return res.status(200).json(new ApiResponse(200, { problemId, notes: trimmedNotes }));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/progress/:sheetId
// N+1 fixed: per-step counts via a single grouped aggregation
// ---------------------------------------------------------------------------
export const getSheetProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const sheetId = req.params.sheetId as string;

    const sheet = await DsaSheet.findById(sheetId).lean();
    if (!sheet) return res.status(404).json({ success: false, message: 'Sheet not found' });

    const steps = await DsaStep.find({ sheetId }).lean();
    const stepIds = steps.map((s) => s._id as mongoose.Types.ObjectId);
    const sheetProblems = await SheetProblem.find({ stepId: { $in: stepIds } })
      .select('masterProblemId stepId')
      .lean();
    const sheetProblemIds = sheetProblems.map((p) => p.masterProblemId);
    const totalProblems = sheetProblems.length;

    // --- Single aggregation for overall solved stats ---
    const solvedAgg = await UserProgress.aggregate([
      { $match: { userId, problemId: { $in: sheetProblemIds }, solved: true } },
      {
        $group: {
          _id: null,
          solvedCount: { $sum: 1 },
          lastSolved: { $max: '$solvedAt' },
        },
      },
    ]);

    const solvedCount = solvedAgg[0]?.solvedCount || 0;
    const lastSolvedOverall = solvedAgg[0]?.lastSolved || null;

    // --- Single aggregation for revision count ---
    const revisionAgg = await UserProgress.aggregate([
      { $match: { userId, problemId: { $in: sheetProblemIds }, revisionPending: true } },
      { $count: 'revisionCount' },
    ]);
    const revisionCount = revisionAgg[0]?.revisionCount || 0;

    // --- Single aggregation for per-step solved counts (N+1 fix) ---
    const solvedByStepMap = await getSolvedCountsByStep(userId, stepIds, sheetProblems);

    const stepsWithProgress = steps.map((step) => {
      const solvedInStep = solvedByStepMap.get(step._id.toString()) || 0;
      return {
        stepId: step._id,
        stepNumber: step.stepNumber,
        title: step.title,
        totalProblems: step.totalProblems,
        solvedProblems: solvedInStep,
        progressPercentage:
          step.totalProblems > 0 ? Math.round((solvedInStep / step.totalProblems) * 100) : 0,
      };
    });

    // --- Last solved problem details ---
    const lastSolvedProblem = await UserProgress.aggregate([
      { $match: { userId, problemId: { $in: sheetProblemIds }, solved: true, solvedAt: { $ne: null } } },
      { $sort: { solvedAt: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'masterproblems',
          localField: 'problemId',
          foreignField: 'problemId',
          as: 'problem',
        },
      },
      { $unwind: { path: '$problem', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          problemId: 1,
          name: { $ifNull: ['$problem.title', 'Unknown'] },
          difficulty: { $ifNull: ['$problem.difficulty', ''] },
          solvedAt: 1,
        },
      },
    ]);

    // --- Solved problem IDs list ---
    const solvedProblemDocs = await UserProgress.find(
      { userId, problemId: { $in: sheetProblemIds }, solved: true },
      { problemId: 1, _id: 0 }
    ).lean();
    const solvedProblemIds = solvedProblemDocs.map((p) => p.problemId);

    const progressPercentage =
      totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    return res.status(200).json(
      new ApiResponse(200, {
        sheetId: sheet._id,
        slug: sheet.slug,
        title: sheet.title,
        totalProblems,
        solvedProblems: solvedCount,
        remainingProblems: totalProblems - solvedCount,
        revisionPending: revisionCount,
        progressPercentage,
        lastSolvedOverall,
        lastSolved: lastSolvedProblem[0] || null,
        steps: stepsWithProgress,
        solvedProblemIds,
      })
    );
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/progress/slug/:slug
// N+1 fixed: same grouped aggregation strategy as getSheetProgress
// ---------------------------------------------------------------------------
export const getSheetBySlug = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const slug = req.params.slug as string;

    const sheet = await DsaSheet.findOne({ slug, active: true }).lean();
    if (!sheet) return res.status(404).json({ success: false, message: 'Sheet not found' });

    const steps = await DsaStep.find({ sheetId: sheet._id }).sort({ stepNumber: 1 }).lean();
    const stepIds = steps.map((s) => s._id as mongoose.Types.ObjectId);
    const sheetProblems = await SheetProblem.find({ stepId: { $in: stepIds } })
      .select('masterProblemId stepId')
      .lean();
    const sheetProblemIds = sheetProblems.map((p) => p.masterProblemId);
    const totalProblems = sheetProblems.length;

    // --- Overall solved stats ---
    const solvedAgg = await UserProgress.aggregate([
      { $match: { userId, problemId: { $in: sheetProblemIds }, solved: true } },
      { $group: { _id: null, solvedCount: { $sum: 1 }, lastSolved: { $max: '$solvedAt' } } },
    ]);
    const solvedCount = solvedAgg[0]?.solvedCount || 0;
    const lastSolvedOverall = solvedAgg[0]?.lastSolved || null;

    // --- Revision count ---
    const revisionAgg = await UserProgress.aggregate([
      { $match: { userId, problemId: { $in: sheetProblemIds }, revisionPending: true } },
      { $count: 'revisionCount' },
    ]);
    const revisionCount = revisionAgg[0]?.revisionCount || 0;

    // --- Per-step solved counts — single aggregation (N+1 fix) ---
    const solvedByStepMap = await getSolvedCountsByStep(userId, stepIds, sheetProblems);

    const stepsWithProgress = steps.map((step) => {
      const solvedInStep = solvedByStepMap.get(step._id.toString()) || 0;
      return {
        stepId: step._id,
        stepNumber: step.stepNumber,
        title: step.title,
        totalProblems: step.totalProblems,
        solvedProblems: solvedInStep,
        progressPercentage:
          step.totalProblems > 0 ? Math.round((solvedInStep / step.totalProblems) * 100) : 0,
      };
    });

    // --- Last solved problem ---
    const lastSolvedProblem = await UserProgress.aggregate([
      { $match: { userId, problemId: { $in: sheetProblemIds }, solved: true, solvedAt: { $ne: null } } },
      { $sort: { solvedAt: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'masterproblems',
          localField: 'problemId',
          foreignField: 'problemId',
          as: 'problem',
        },
      },
      { $unwind: { path: '$problem', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          problemId: 1,
          name: { $ifNull: ['$problem.title', 'Unknown'] },
          difficulty: { $ifNull: ['$problem.difficulty', ''] },
          solvedAt: 1,
        },
      },
    ]);

    // --- Solved problem IDs ---
    const solvedProblemDocs = await UserProgress.find(
      { userId, problemId: { $in: sheetProblemIds }, solved: true },
      { problemId: 1, _id: 0 }
    ).lean();
    const solvedProblemIds = solvedProblemDocs.map((p) => p.problemId);

    const progressPercentage =
      totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    return res.status(200).json(
      new ApiResponse(200, {
        sheetId: sheet._id,
        slug: sheet.slug,
        title: sheet.title,
        description: sheet.description,
        totalProblems,
        solvedProblems: solvedCount,
        remainingProblems: totalProblems - solvedCount,
        revisionPending: revisionCount,
        progressPercentage,
        lastSolvedOverall,
        lastSolved: lastSolvedProblem[0] || null,
        steps: stepsWithProgress,
        solvedProblemIds,
      })
    );
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/progress/all
// ---------------------------------------------------------------------------
export const getAllProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const sheets = await DsaSheet.find({ active: true }).lean();
    const steps = await DsaStep.find().lean();
    const allProblems = await SheetProblem.find().select('masterProblemId stepId').lean();

    const userSolved = await UserProgress.find({ userId, solved: true })
      .select('problemId solvedAt')
      .lean();
    const userSolvedMap = new Map(userSolved.map((p) => [p.problemId, p]));
    const userRevision = await UserProgress.find({ userId, revisionPending: true })
      .select('problemId')
      .lean();
    const userRevisionSet = new Set(userRevision.map((p) => p.problemId));

    const sheetStepMap = new Map<string, typeof steps>();
    for (const step of steps) {
      const key = step.sheetId.toString();
      if (!sheetStepMap.has(key)) sheetStepMap.set(key, []);
      sheetStepMap.get(key)!.push(step);
    }

    const sheetsProgress = sheets.map((sheet) => {
      const sid = sheet._id.toString();
      const sheetSteps = sheetStepMap.get(sid) || [];
      const stepIds = sheetSteps.map((s) => s._id.toString());
      const sheetProblems = allProblems.filter((p) => stepIds.includes(p.stepId.toString()));
      const totalProblems = sheetProblems.length;
      const solvedProblems = sheetProblems.filter((p) => userSolvedMap.has(p.masterProblemId)).length;
      const revisionCount = sheetProblems.filter((p) => userRevisionSet.has(p.masterProblemId)).length;

      const lastSolvedDates = sheetProblems
        .map((p) => userSolvedMap.get(p.masterProblemId)?.solvedAt || null)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime());
      const lastSolved = lastSolvedDates[0] || null;

      const progressPercentage =
        totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

      return {
        sheetId: sheet._id,
        slug: sheet.slug,
        title: sheet.title,
        description: sheet.description,
        icon: sheet.icon,
        color: sheet.color,
        tags: sheet.tags,
        totalProblems,
        solvedProblems,
        remainingProblems: totalProblems - solvedProblems,
        revisionPending: revisionCount,
        progressPercentage,
        lastSolved,
      };
    });

    return res.status(200).json(new ApiResponse(200, sheetsProgress));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/progress/step/:stepId
// ---------------------------------------------------------------------------
export const getStepProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const stepId = req.params.stepId as string;

    const step = await DsaStep.findById(stepId).lean();
    if (!step) return res.status(404).json({ success: false, message: 'Step not found' });

    const sheetProblems = await SheetProblem.find({ stepId }).sort({ orderInStep: 1 }).lean();
    const problemIds = sheetProblems.map(sp => sp.masterProblemId);
    
    const masterProblems = await MasterProblem.find(
      { problemId: { $in: problemIds }, active: true }
    ).lean();
    
    // Map master problems back to ordered array
    const problems = sheetProblems.map(sp => {
      const mp = masterProblems.find(m => m.problemId === sp.masterProblemId);
      if (!mp) return null;
      return {
        problemId: mp.problemId,
        name: mp.title,
        difficulty: mp.difficulty,
        platform: mp.platform,
        link: mp.link,
        links: mp.links || {},
        youtubeUrl: mp.youtubeUrl,
        articleUrl: mp.articleUrl,
        videos: mp.videos || [],
        editorials: mp.editorials || [],
      };
    }).filter(p => p !== null) as any[];

    const progressDocs = await UserProgress.find({
      userId,
      problemId: { $in: problemIds },
    })
      .select('problemId solved revisionPending solvedAt notes')
      .lean();

    const progressMap = new Map(progressDocs.map((p) => [p.problemId, p]));
    const solvedCount = progressDocs.filter((p) => p.solved).length;
    const progressPercentage =
      step.totalProblems > 0 ? Math.round((solvedCount / step.totalProblems) * 100) : 0;

    const problemsWithStatus = problems.map((p) => {
      const up = progressMap.get(p.problemId);
      return {
        problemId: p.problemId,
        name: p.name,
        difficulty: p.difficulty,
        platform: p.platform,
        link: p.link,
        links: p.links || {},
        videos: p.videos || [],
        editorials: p.editorials || [],
        youtubeUrl: p.youtubeUrl || '',
        articleUrl: p.articleUrl || '',
        solved: up?.solved || false,
        revisionPending: up?.revisionPending || false,
        notes: up?.notes || '',
        solvedAt: up?.solvedAt || null,
      };
    });

    return res.status(200).json(
      new ApiResponse(200, {
        stepId: step._id,
        stepNumber: step.stepNumber,
        title: step.title,
        totalProblems: step.totalProblems,
        solvedProblems: solvedCount,
        progressPercentage,
        problems: problemsWithStatus,
      })
    );
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/progress/stats
// Returns global progress stats across ALL problems
// ---------------------------------------------------------------------------
export const getProgressStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const totalAgg = await MasterProblem.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    let easyTotal = 0, mediumTotal = 0, hardTotal = 0, total = 0;
    totalAgg.forEach(doc => {
      const d = doc._id?.toLowerCase();
      if (d === 'easy') easyTotal = doc.count;
      else if (d === 'medium') mediumTotal = doc.count;
      else if (d === 'hard') hardTotal = doc.count;
      total += doc.count;
    });

    const solvedAgg = await UserProgress.aggregate([
      { $match: { userId, solved: true } },
      { $lookup: { from: 'masterproblems', localField: 'problemId', foreignField: 'problemId', as: 'problemDoc' } },
      { $unwind: { path: '$problemDoc', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$problemDoc.difficulty', count: { $sum: 1 } } }
    ]);

    let easySolved = 0, mediumSolved = 0, hardSolved = 0, solved = 0;
    solvedAgg.forEach(doc => {
      const d = doc._id?.toLowerCase();
      if (d === 'easy') easySolved = doc.count;
      else if (d === 'medium') mediumSolved = doc.count;
      else if (d === 'hard') hardSolved = doc.count;
      solved += doc.count;
    });

    const remaining = total - solved;
    const completedPercentage = total > 0 ? Math.round((solved / total) * 100 * 100) / 100 : 0;

    return res.status(200).json(
      new ApiResponse(200, {
        solved, total, remaining, completedPercentage,
        easy: { solved: easySolved, total: easyTotal },
        medium: { solved: mediumSolved, total: mediumTotal },
        hard: { solved: hardSolved, total: hardTotal }
      })
    );
  } catch (error: any) {
    console.error('[progress/stats] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/progress/sheet/:slug
// ---------------------------------------------------------------------------
export const deleteSheetProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const slug = req.params.slug as string;
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Missing sheet slug' });
    }

    const sheet = await DsaSheet.findOne({ slug }).lean();
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Sheet not found' });
    }

    const steps = await DsaStep.find({ sheetId: sheet._id }).select('_id').lean();
    const stepIds = steps.map((s) => s._id);

    const problems = await SheetProblem.find({ stepId: { $in: stepIds } }).select('masterProblemId').lean();
    const problemIds = problems.map((p) => p.masterProblemId);

    const deleteResult = await UserProgress.deleteMany({
      userId,
      $or: [{ sheetId: sheet._id }, { problemId: { $in: problemIds } }],
    });

    return res.status(200).json(
      new ApiResponse(200, {
        message: 'Sheet progress successfully deleted',
        deletedCount: deleteResult.deletedCount,
      })
    );
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/progress/extension-sync
// External webhook for Chrome Extension
// ---------------------------------------------------------------------------
export const extensionSync = async (req: Request, res: Response) => {
  try {
    const { userId, slug, platform } = req.body;
    
    if (!userId || !slug) {
      return res.status(400).json({ success: false, message: 'Missing userId or slug' });
    }

    // Make search extremely robust for DSA sheets (handle hyphens vs spaces, GeeksForGeeks links, etc)
    const titleSlug = slug.replace(/-/g, ' '); // e.g. "fruit into baskets"
    const regexTitle = new RegExp(titleSlug, 'i');
    
    const masterProblem = await MasterProblem.findOne({
      $or: [
        { titleKey: slug },
        { titleKey: { $regex: slug, $options: 'i' } },
        { title: { $regex: regexTitle } },
        { link: { $regex: slug, $options: 'i' } },
        { 'links.leetcode': { $regex: slug, $options: 'i' } },
        { 'links.geeksforgeeks': { $regex: slug, $options: 'i' } },
        { 'links.gfg': { $regex: slug, $options: 'i' } },
        { 'links.codingninjas': { $regex: slug, $options: 'i' } },
        { 'links.codeforces': { $regex: slug, $options: 'i' } },
        { 'links.codechef': { $regex: slug, $options: 'i' } },
        { 'links.hackerrank': { $regex: slug, $options: 'i' } },
        { 'links.interviewbit': { $regex: slug, $options: 'i' } }
      ]
    });
    
    // 1. Check if they have ever solved this specific problem on THIS specific platform
    const activityTitle = masterProblem 
        ? `Solved ${masterProblem.title} on ${platform} via Extension`
        : `Solved ${slug} on ${platform} via Extension`;

    const existingPlatformActivity = await UserActivity.findOne({ 
        userId, 
        type: 'solved_problem', 
        title: activityTitle 
    });
    
    const isPlatformSolveNew = !existingPlatformActivity;

    if (isPlatformSolveNew) {
        await UserActivity.create({
            userId,
            type: 'solved_problem',
            title: activityTitle,
            problemId: masterProblem ? masterProblem.problemId : undefined
        });
    }

    // 2. If it's a Codeyx Sheet problem, update the global sheet progress
    if (masterProblem) {
        const existingProgress = await UserProgress.findOne({ userId, problemId: masterProblem.problemId });
        const isSheetProgressNew = !existingProgress || !existingProgress.solved;

        if (isSheetProgressNew) {
            await UserProgress.updateOne(
              { userId, problemId: masterProblem.problemId },
              { $set: { solved: true, solvedAt: new Date() } },
              { upsert: true }
            );
        }
    }

    // --- AUTO-HEAL PLATFORM STATS ---
    // Instead of relying on manual fixes, we auto-recalculate total solved based on UserActivity
    const trueSolvedCount = await UserActivity.countDocuments({ userId, type: 'solved_problem' });
    
    await PlatformStats.findOneAndUpdate(
        { userId, platform: 'codeyx' },
        { $set: { username: userId, totalSolved: trueSolvedCount }, $setOnInsert: { stats: {}, rating: 0 } },
        { upsert: true }
    );
    await PlatformStats.findOneAndUpdate(
        { userId, platform: platform },
        { $set: { username: userId, totalSolved: trueSolvedCount }, $setOnInsert: { stats: {}, rating: 0 } },
        { upsert: true }
    );

    return res.status(200).json({ success: true, message: 'Synced successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const manualSyncFix = async (req: Request, res: Response) => {
  try {
    const userIdRaw = req.query.userId;
    if (!userIdRaw) return res.status(400).json({ success: false, message: 'Missing userId query param' });
    const userId = userIdRaw as string;

    const activities = await UserActivity.find({ userId, type: 'solved_problem' });
    const codeyxActivityCount = activities.length;
    
    await PlatformStats.findOneAndUpdate(
        { userId, platform: 'codeyx' },
        { $set: { totalSolved: codeyxActivityCount, username: userId } },
        { upsert: true }
    );
    await PlatformStats.findOneAndUpdate(
        { userId, platform: 'leetcode' },
        { $set: { totalSolved: codeyxActivityCount, username: userId } },
        { upsert: true }
    );
    
    // Auto-heal UserProgress
    let healedCount = 0;
    for (const act of activities) {
        const match = act.title.match(/Solved ([\w-]+) on leetcode via Extension/);
        if (match && match[1]) {
            const slug = match[1];
            const titleSlug = slug.replace(/-/g, ' ');
            const regexTitle = new RegExp(titleSlug, 'i');
            
            const masterProblem = await MasterProblem.findOne({
                $or: [
                    { titleKey: slug },
                    { titleKey: { $regex: slug, $options: 'i' } },
                    { title: { $regex: regexTitle } },
                    { link: { $regex: slug, $options: 'i' } }
                ]
            });
            
            if (masterProblem) {
                await UserProgress.updateOne(
                    { userId, problemId: masterProblem.problemId },
                    { $set: { solved: true, solvedAt: act.createdAt } },
                    { upsert: true }
                );
                healedCount++;
            }
        }
    }

    return res.status(200).json({ success: true, count: codeyxActivityCount, healedProgress: healedCount });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const debugMasterProblem = async (req: Request, res: Response) => {
  try {
    const title = req.query.title as string;
    if (!title) return res.status(400).json({ success: false, message: 'Missing title' });
    const mp = await MasterProblem.find({ title: { $regex: new RegExp(title, 'i') } });
    return res.json({ success: true, count: mp.length, data: mp });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const debugActivities = async (req: Request, res: Response) => {
  try {
    const acts = await UserActivity.find({ type: 'solved_problem' }).lean();
    return res.json({ success: true, count: acts.length, data: acts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
