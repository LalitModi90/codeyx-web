import { Request, Response } from 'express';
import { UserFavorite } from '../models/UserFavorite';
import { ApiResponse } from '../utils/ApiResponse';

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { problemId, sourceSlug } = req.body;

    if (problemId === undefined || !sourceSlug) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existing = await UserFavorite.findOne({ userId, problemId, sourceSlug });

    if (existing) {
      await UserFavorite.deleteOne({ _id: existing._id });
      return res.status(200).json(new ApiResponse(200, { problemId, sourceSlug, favorited: false }));
    }

    await UserFavorite.create({ userId, problemId, sourceSlug });
    return res.status(200).json(new ApiResponse(200, { problemId, sourceSlug, favorited: true }));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const favorites = await UserFavorite.find({ userId })
      .select('problemId sourceSlug createdAt -_id')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(new ApiResponse(200, favorites));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
