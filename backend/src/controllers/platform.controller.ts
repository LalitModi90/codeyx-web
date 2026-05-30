import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { PlatformStats } from '../models/platformStats.model';
import { FallbackManager } from '../services/fallbackManager';
import * as fs from 'fs';

// Direct sync using the high-resilience FallbackManager (bypasses Cloudflare & implements multi-tier fallback)
export const triggerPlatformSync = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || req.body.userId || 'demo-user-123';
    const { platform, platformUsername } = req.body;

    if (!platform) {
      return res.status(400).json({ success: false, message: 'Platform name is required' });
    }

    let username = platformUsername;
    if (!username) {
      const existingStats = await PlatformStats.findOne({ userId, platform });
      if (existingStats && existingStats.username) {
        username = existingStats.username;
      } else {
        username = userId;
      }
    }

    // Use FallbackManager for resilient, multi-tiered live profile resolution!
    const manager = FallbackManager.getInstance();
    const profile = await manager.resolveProfile(platform, username, true);

    // Fetch existing stats to preserve topics and submissions if new payload doesn't contain them
    const existingStats = await PlatformStats.findOne({ userId, platform });
    const existingTopics = existingStats?.stats?.topics || [];
    const existingSubmissions = existingStats?.stats?.submissions || [];
    const existingBadges = existingStats?.stats?.badges || [];

    // Map fetched stats to save format — preserve ALL CodeChef-specific rich fields
    const metadata = (profile.metadata || {}) as any;
    const extra    = metadata.extra || {};

    let avatarUrl = extra.avatar || metadata.extra?.avatar || (profile as any).avatar || '';

    // Automatically upload live remote avatar to Cloudinary to prevent S3 CORS/Referrer blocks
    if (avatarUrl && avatarUrl.startsWith('http')) {
      try {
        const cloudinary = require('../config/cloudinary.config').default;
        console.log(`[Cloudinary] Uploading remote ${platform} avatar to Cloudinary...`);
        const uploadRes = await cloudinary.uploader.upload(avatarUrl, {
          folder: 'codeyx_avatars',
          public_id: `${platform}_${username}`,
          overwrite: true
        });
        avatarUrl = uploadRes.secure_url;
        console.log(`[Cloudinary] Secure avatar uploaded successfully: ${avatarUrl}`);
      } catch (err: any) {
        console.warn(`[Cloudinary Warning] Upload failed for ${platform}:`, err.message);
      }
    }

    const fetchedStats = {
      username:        profile.username,
      totalSolved:     profile.solved,
      rating:          profile.rating,
      highestRating:   metadata.highestRating  || 0,
      stars:           profile.rank            || profile.stars,
      starsNum:        profile.stars           || 0,
      globalRank:      extra.globalRank        || 0,
      countryRank:     extra.countryRank       || 0,
      country:         extra.country           || '',
      name:            extra.name              || profile.username,
      avatar:          avatarUrl,
      contests:        profile.contests        || 0,         // count
      contestsHistory: Array.isArray(metadata.contests) ? metadata.contests : (Array.isArray(extra.contests) ? extra.contests : []),  // full array
      heatmap:         Array.isArray(metadata.heatmap) ? metadata.heatmap : (Array.isArray(extra.heatmap)  ? extra.heatmap  : []),
      partiallySolved: extra.partiallySolved   || 0,
      fullySolved:     extra.fullySolved       || 0,
      followers:       profile.followers       || 0,
      easySolved:      extra.easy              || 0,
      mediumSolved:    extra.medium            || 0,
      hardSolved:      extra.hard              || 0,
      // Preserve existing topics/submissions/badges/languages that come from other sources
      topics:     (metadata.topics      && metadata.topics.length      > 0) ? metadata.topics      : existingTopics,
      submissions:(metadata.submissions && metadata.submissions.length  > 0) ? metadata.submissions : existingSubmissions,
      badges:     (metadata.badges      && metadata.badges.length       > 0) ? metadata.badges      : existingBadges,
      languages:  (metadata.languages   && metadata.languages.length   > 0) ? metadata.languages   : (existingStats?.stats?.languages || []),
      metadata: {
        ...metadata,
        extra: {
          ...extra
        }
      }
    };

    // Save to MongoDB
    const saved = await PlatformStats.findOneAndUpdate(
      { userId, platform },
      {
        username,
        totalSolved: fetchedStats.totalSolved || 0,
        rating:      fetchedStats.rating      || 0,
        stats:       fetchedStats,
        lastSyncedAt: new Date(),
      },
      { upsert: true, new: true }
    );


    console.log(`[Sync] ${platform} successfully synced for ${userId}: ${fetchedStats.totalSolved || 0} solved (via ${profile.metadata?.resolutionDetails?.strategyUsed || 'aggregator'})`);

    // If platform is github, auto sync repos as projects
    if (platform === 'github') {
      const repos = fetchedStats.metadata?.extra?.repositories || [];
      const { syncGithubReposAsProjects } = require('./project.controller');
      // Run in background so sync returns immediately
      syncGithubReposAsProjects(userId, username, repos).catch((err: any) => {
        console.error('[Sync Project Auto Import Background Error]', err.message);
      });
    }

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
    
    // DEBUG: Write stats to disk so I can read it
    try {
      fs.writeFileSync('f:/Codeyx/backend/stats_debug.json', JSON.stringify(stats, null, 2));
    } catch (e) {}

    return res.status(200).json(
      new ApiResponse(200, stats, `Fetched all platforms for user`)
    );
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const disconnectPlatform = async (req: Request, res: Response) => {
  try {
    const { platform, userId } = req.body;
    if (!platform || !userId) {
      return res.status(400).json({ success: false, message: 'Platform and userId are required' });
    }

    await PlatformStats.findOneAndDelete({ userId, platform });

    return res.status(200).json(
      new ApiResponse(200, null, `${platform} disconnected successfully`)
    );
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
