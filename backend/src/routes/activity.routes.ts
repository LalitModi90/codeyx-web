import { Router } from 'express';
import { protectRoute } from '../middlewares/clerk.middleware';
import { UserActivity } from '../models/UserActivity';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

// GET /api/activity
// Fetch recent activity feed for the logged-in user
router.get('/', protectRoute, async (req: any, res: any) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Fetch the 50 most recent activities for this user
    const activities = await UserActivity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json(new ApiResponse(200, activities));
  } catch (error: any) {
    console.error('[getActivity] Error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
