import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CustomSheet } from '../models/CustomSheet';
import { CustomSheetProblem } from '../models/CustomSheetProblem';
import { UserProgress } from '../models/UserProgress';
import { ApiResponse } from '../utils/ApiResponse';

export const createSheet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { title, description, visibility } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const sheet = await CustomSheet.create({
      userId,
      title: title.trim(),
      description: description || '',
      visibility: visibility || 'private',
    });

    return res.status(201).json(new ApiResponse(201, sheet));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSheets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const sheets = await CustomSheet.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const sheetsWithProblems = await Promise.all(
      sheets.map(async (sheet) => {
        const problemCount = await CustomSheetProblem.countDocuments({ customSheetId: sheet._id });

        const solvedCountResult = await CustomSheetProblem.aggregate([
          { $match: { customSheetId: sheet._id } },
          {
            $lookup: {
              from: 'userprogresses',
              let: { pid: '$problemId' },
              pipeline: [
                { $match: { userId, solved: true, $expr: { $eq: ['$problemId', '$$pid'] } } },
                { $limit: 1 },
              ],
              as: 'progress',
            },
          },
          { $addFields: { isSolved: { $gt: [{ $size: '$progress' }, 0] } } },
          { $group: { _id: null, solvedCount: { $sum: { $cond: ['$isSolved', 1, 0] } } } },
        ]);

        const solvedCount = solvedCountResult[0]?.solvedCount || 0;
        const progressPercentage = problemCount > 0 ? Math.round((solvedCount / problemCount) * 100) : 0;

        return {
          _id: sheet._id,
          title: sheet.title,
          description: sheet.description,
          visibility: sheet.visibility,
          totalProblems: problemCount,
          solvedProblems: solvedCount,
          progressPercentage,
          createdAt: sheet.createdAt,
        };
      })
    );

    return res.status(200).json(new ApiResponse(200, sheetsWithProblems));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSheet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const sheetId = req.params.id as string;

    const sheet = await CustomSheet.findOne({ _id: sheetId, userId });
    if (!sheet) return res.status(404).json({ success: false, message: 'Sheet not found' });

    await CustomSheetProblem.deleteMany({ customSheetId: sheet._id });
    await CustomSheet.deleteOne({ _id: sheet._id });

    return res.status(200).json(new ApiResponse(200, { deleted: true }));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addProblem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { sheetId, problemId, sourceSlug } = req.body;

    if (!sheetId || problemId === undefined || !sourceSlug) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const sheet = await CustomSheet.findOne({ _id: sheetId, userId });
    if (!sheet) return res.status(404).json({ success: false, message: 'Sheet not found' });

    const existing = await CustomSheetProblem.findOne({ customSheetId: sheet._id, problemId, sourceSlug });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Problem already in sheet' });
    }

    await CustomSheetProblem.create({ customSheetId: sheet._id, problemId, sourceSlug });

    return res.status(201).json(new ApiResponse(201, { problemId, sourceSlug, added: true }));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeProblem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { sheetId, problemId, sourceSlug } = req.body;

    if (!sheetId || problemId === undefined || !sourceSlug) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const sheet = await CustomSheet.findOne({ _id: sheetId, userId });
    if (!sheet) return res.status(404).json({ success: false, message: 'Sheet not found' });

    await CustomSheetProblem.deleteOne({ customSheetId: sheet._id, problemId, sourceSlug });

    return res.status(200).json(new ApiResponse(200, { problemId, sourceSlug, removed: true }));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSheetProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const sheetId = req.params.id as string;

    const sheet = await CustomSheet.findOne({ _id: sheetId, userId }).lean();
    if (!sheet) return res.status(404).json({ success: false, message: 'Sheet not found' });

    const problems = await CustomSheetProblem.find({ customSheetId: sheet._id })
      .sort({ addedAt: -1 })
      .lean();

    const problemIds = problems.map((p) => p.problemId);

    const solvedProgress = await UserProgress.find({
      userId,
      problemId: { $in: problemIds },
      solved: true,
    })
      .select('problemId solvedAt -_id')
      .lean();

    const solvedMap = new Map(solvedProgress.map((p) => [p.problemId, p]));

    const problemsWithStatus = problems.map((p) => {
      const up = solvedMap.get(p.problemId);
      return {
        problemId: p.problemId,
        sourceSlug: p.sourceSlug,
        solved: up?.solved || false,
        solvedAt: up?.solvedAt || null,
        addedAt: p.addedAt,
      };
    });

    const solvedCount = solvedProgress.length;
    const totalProblems = problems.length;
    const progressPercentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    const lastSolved = solvedProgress.sort(
      (a, b) => new Date(b.solvedAt || 0).getTime() - new Date(a.solvedAt || 0).getTime()
    )[0] || null;

    return res.status(200).json(
      new ApiResponse(200, {
        sheetId: sheet._id,
        title: sheet.title,
        description: sheet.description,
        visibility: sheet.visibility,
        totalProblems,
        solvedProblems: solvedCount,
        remainingProblems: totalProblems - solvedCount,
        progressPercentage,
        lastSolved: lastSolved ? { problemId: lastSolved.problemId, solvedAt: lastSolved.solvedAt } : null,
        problems: problemsWithStatus,
      })
    );
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
