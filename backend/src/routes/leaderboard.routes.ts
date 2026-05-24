import { Router } from 'express';
import { getLeaderboard, getUserLeaderboardProfile, debugLeaderboard } from '../controllers/leaderboard.controller';

const router = Router();

router.get('/', getLeaderboard);
router.get('/debug', debugLeaderboard);
router.get('/user/:userId', getUserLeaderboardProfile);

export default router;
