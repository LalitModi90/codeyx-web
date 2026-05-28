import { Router } from 'express';
import { protectRoute } from '../middlewares/clerk.middleware';
import {
  getAllCategories,
  getCategoriesWithProgress,
  getPatternDetail,
  getPatternProgress,
  getPatternStats,
  getPatternAnalytics,
} from '../controllers/patterns.controller';

const router = Router();

// Unprotected — anyone can see the category/pattern structure
router.get('/categories', getAllCategories);

// Protected — requires auth for progress-aware data
router.get('/categories/progress', protectRoute, getCategoriesWithProgress);
router.get('/stats', protectRoute, getPatternStats);
router.get('/analytics', protectRoute, getPatternAnalytics);
router.get('/progress/:patternId', protectRoute, getPatternProgress);
router.get('/:patternId', getPatternDetail);

export default router;
