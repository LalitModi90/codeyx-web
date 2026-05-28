import { Request, Response } from 'express';
import { MasterProblem } from '../models/MasterProblem';
import { PatternProblem } from '../models/PatternProblem';
import { Pattern } from '../models/Pattern';
import { SheetProblem } from '../models/SheetProblem';
import { ApiResponse } from '../utils/ApiResponse';

export const getProblemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const problemId = parseInt(String(id), 10);
    if (isNaN(problemId)) {
      return res.status(400).json({ success: false, message: 'Invalid problem ID' });
    }

    const problem = await MasterProblem.findOne({ problemId, active: true }).lean();
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Find which patterns this problem belongs to
    const patternProblems = await PatternProblem.find({
      masterProblemId: problemId,
    }).lean();
    const patternIds = patternProblems.map(pp => pp.patternId);
    const patterns = await Pattern.find({ _id: { $in: patternIds }, active: true })
      .select('title difficulty order categoryId')
      .populate('categoryId', 'title')
      .lean();

    // Populate may not type-cast, so cast safely
    const patternList = patterns.map((p: any) => ({
      patternId: p._id,
      title: p.title,
      difficulty: p.difficulty,
      category: p.categoryId?.title || '',
    }));

    // Find which sheets this problem belongs to
    const sheetProblems = await SheetProblem.find({
      masterProblemId: problemId,
    }).lean();

    return res.status(200).json(
      new ApiResponse(200, {
        problemId: problem.problemId,
        title: problem.title,
        difficulty: problem.difficulty,
        platform: problem.platform,
        link: problem.link,
        links: problem.links || {},
        youtubeUrl: problem.youtubeUrl || '',
        articleUrl: problem.articleUrl || '',
        videos: problem.videos || [],
        editorials: problem.editorials || [],
        tags: problem.tags || [],
        companies: problem.companies || [],
        patterns: patternList,
        sheetCount: sheetProblems.length,
      })
    );
  } catch (error: any) {
    console.error('[problems:getById] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
