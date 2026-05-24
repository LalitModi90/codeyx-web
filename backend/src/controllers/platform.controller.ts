import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { PlatformStats } from '../models/platformStats.model';
import { fetchLeetCodeStats } from '../services/leetcode.service';
import { fetchCodeforcesStats } from '../services/codeforces.service';
import { fetchGitHubStats } from '../services/github.service';
import { fetchCodeChefStats } from '../services/codechef.service';
import { fetchHackerRankStats } from '../services/hackerrank.service';
import { fetchGFGStats } from '../services/gfg.service';
import { fetchAtCoderStats } from '../services/atcoder.service';

// Direct sync (bypasses BullMQ - works in development without Redis)
export const triggerPlatformSync = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || req.body.userId || 'demo-user-123';
    const { platform, platformUsername } = req.body;

    if (!platform) {
      return res.status(400).json({ success: false, message: 'Platform name is required' });
    }

    const username = platformUsername || userId;
    let fetchedStats: any = null;

    // Directly fetch from platform APIs (no queue needed)
    if (platform === 'leetcode') {
      fetchedStats = await fetchLeetCodeStats(username);
    } else if (platform === 'codeforces') {
      fetchedStats = await fetchCodeforcesStats(username);
    } else if (platform === 'github') {
      fetchedStats = await fetchGitHubStats(username);
    } else if (platform === 'codechef') {
      fetchedStats = await fetchCodeChefStats(username);
    } else if (platform === 'hackerrank') {
      fetchedStats = await fetchHackerRankStats(username);
    } else if (platform === 'gfg') {
      fetchedStats = await fetchGFGStats(username);
    } else if (platform === 'atcoder') {
      fetchedStats = await fetchAtCoderStats(username);
    } else {
      return res.status(400).json({ success: false, message: `Platform ${platform} not supported` });
    }

    // Save to MongoDB
    const saved = await PlatformStats.findOneAndUpdate(
      { userId, platform },
      {
        username,
        totalSolved: fetchedStats.totalSolved || 0,
        rating: fetchedStats.rating || 0,
        stats: fetchedStats,
        lastSyncedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log(`[Sync] ${platform} synced for ${userId}: ${fetchedStats.totalSolved || 0} solved`);

    return res.status(200).json(
      new ApiResponse(200, saved, `${platform} synced successfully`)
    );
  } catch (error: any) {
    console.error('[Sync Error]', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const { platform, userId } = req.query;
    if (!platform || !userId) {
      return res.status(400).json({ success: false, message: 'Platform and userId are required' });
    }

    const stats = await PlatformStats.findOne({ 
      userId: userId as string, 
      platform: platform as any
    });
    
    return res.status(200).json(
      new ApiResponse(200, stats, `Fetched stats for ${platform}`)
    );
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPlatformStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const stats = await PlatformStats.find({ userId: userId as string });
    
    return res.status(200).json(
      new ApiResponse(200, stats, `Fetched all platforms for user`)
    );
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
