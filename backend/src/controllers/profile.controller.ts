import { Request, Response } from 'express';
import { Profile } from '../models/profile.model';
import { ApiResponse } from '../utils/ApiResponse';
import { getSocketIo } from '../socket';
import { redisClient } from '../config/redis.config';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId || req.body.userId; // Assuming Clerk middleware attaches auth
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const updatedData = req.body;
    
    // Enforce username uniqueness if username is being updated
    if (updatedData.username) {
      const existing = await Profile.findOne({ 
        username: { $regex: new RegExp(`^${updatedData.username}$`, 'i') }, 
        userId: { $ne: userId } 
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updatedData },
      { new: true, upsert: true }
    );

    // Invalidate Caches
    await redisClient.del(`profile:${userId}`);
    await redisClient.del('codeyx:leaderboard');

    // Emit Realtime Update to Viewer Rooms and the User
    const io = getSocketIo();
    io.to(userId).emit('profile.updated', profile);
    io.emit(`public.profile.updated.${userId}`, profile); // Broadcast to public viewers

    return res.status(200).json(new ApiResponse(200, profile, 'Profile updated successfully'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Check Cache First
    const cached = await redisClient.get(`profile:${userId}`);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, JSON.parse(cached), 'Fetched profile (cache)'));
    }

    const profile = await Profile.findOne({ userId });
    
    if (profile) {
      await redisClient.set(`profile:${userId}`, JSON.stringify(profile), 'EX', 3600); // 1 hour TTL
    }

    return res.status(200).json(new ApiResponse(200, profile || {}, 'Fetched profile'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ available: false, error: 'Invalid username' });
    }

    const existing = await Profile.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).lean();
    
    if (existing) {
      // Generate suggestion candidates
      const random3 = Math.floor(Math.random() * 900) + 100;
      const random2 = Math.floor(Math.random() * 90) + 10;
      
      const candidates = [
        `${username}_${random3}`,
        `${username}2026`,
        `${username}_official`,
        `real_${username}`,
        `${username}_${random2}`
      ];

      // Check all candidates against DB to guarantee uniqueness
      const existingProfiles = await Profile.find({
        username: { $in: candidates.map(c => new RegExp(`^${c}$`, 'i')) }
      }).select('username').lean();

      const takenUsernames = new Set(existingProfiles.map(p => p.username?.toLowerCase()));
      
      const verifiedSuggestions = candidates.filter(c => !takenUsernames.has(c.toLowerCase()));

      return res.json({ 
        available: false, 
        suggestions: verifiedSuggestions, 
        error: verifiedSuggestions.length > 0 
          ? 'This username is already taken. Try one of these available usernames:' 
          : 'This username is already taken. Please choose a different username.' 
      });
    }

    return res.json({ available: true });
  } catch (error: any) {
    return res.status(500).json({ available: false, error: 'Server error' });
  }
};
