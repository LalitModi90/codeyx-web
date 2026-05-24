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
    
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updatedData },
      { new: true, upsert: true }
    );

    // Invalidate Cache
    await redisClient.del(`profile:${userId}`);

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
