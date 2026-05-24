import { Request, Response } from 'express';
import { Follower } from '../models/follower.model';
import { Notification } from '../models/notification.model';
import { getSocketIo } from '../socket';
import { redisClient } from '../config/redis.config';
import { ApiResponse } from '../utils/ApiResponse';

export const followUser = async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).auth?.userId || req.body.userId;
    const { followingId } = req.body;

    if (!followerId || !followingId) return res.status(400).json({ success: false, message: 'Missing IDs' });

    await Follower.create({ followerId, followingId });

    // Invalidate Cache
    await redisClient.del(`followers:${followingId}`);
    await redisClient.del(`following:${followerId}`);

    // Create Notification
    const notif = await Notification.create({
      userId: followingId,
      actorId: followerId,
      type: 'follow'
    });

    // Realtime Events
    const io = getSocketIo();
    io.to(followingId).emit('notification.new', notif);
    io.to(followingId).emit('profile.followed', { followerId });
    io.emit(`public.profile.updated.${followingId}`);

    return res.status(200).json(new ApiResponse(200, {}, 'Successfully followed'));
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already following' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
