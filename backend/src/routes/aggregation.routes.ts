import { Router, Request, Response } from 'express';
import { FallbackManager } from '../services/fallbackManager';

const router = Router();
const manager = FallbackManager.getInstance();

/**
 * Helper to handle aggregation requests uniformly.
 */
const handleAggregation = async (req: Request, res: Response, platform: string) => {
  const username = req.params.username as string;
  const forceRefresh = req.query.refresh === 'true';

  if (!username || typeof username !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Username is required and must be a string',
    });
  }

  try {
    const profile = await manager.resolveProfile(platform, username, forceRefresh);
    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error(`[Aggregation Route Error] ${platform} for ${username}:`, error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error during profile resolution',
    });
  }
};

// Platform aggregation endpoints
router.get('/github/:username', (req, res) => handleAggregation(req, res, 'github'));
router.get('/leetcode/:username', (req, res) => handleAggregation(req, res, 'leetcode'));
router.get('/codeforces/:username', (req, res) => handleAggregation(req, res, 'codeforces'));
router.get('/codechef/:username', (req, res) => handleAggregation(req, res, 'codechef'));
router.get('/hackerrank/:username', (req, res) => handleAggregation(req, res, 'hackerrank'));
router.get('/atcoder/:username', (req, res) => handleAggregation(req, res, 'atcoder'));
router.get('/geeksforgeeks/:username', (req, res) => handleAggregation(req, res, 'geeksforgeeks'));
router.get('/gfg/:username', (req, res) => handleAggregation(req, res, 'gfg'));

export default router;
