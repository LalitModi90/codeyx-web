import { Request, Response } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { addCleanupJob } from '../queues/cleanup.queue';
import { emitToUser, getSocketIo } from '../socket';
import { redisClient } from '../config/redis.config';
import { User } from '../models/user.model';
import { ApiResponse } from '../utils/ApiResponse';

// Role Check Middleware Logic typically goes in a separate file,
// but checking here for simplicity of demonstration.
const isAdmin = async (userId: string) => {
  // Check if user has admin role in your DB or Clerk
  const user = await User.findOne({ clerkUserId: userId });
  return user?.role === 'admin';
};

export const deleteUserFromClerk = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).auth?.userId;
    const { targetUserId } = req.body;

    // Security Check
    if (!adminId || !(await isAdmin(adminId))) {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }

    // Reverse Sync: 1. Delete from Clerk (this will trigger the webhook automatically!)
    await clerkClient.users.deleteUser(targetUserId);

    // 2. Disconnect Sockets immediately
    emitToUser(targetUserId, 'SESSION_REVOKED', { reason: 'Account deleted by admin' });

    return res.status(200).json(new ApiResponse(200, {}, `User ${targetUserId} deleted across all systems.`));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).auth?.userId;
    const { targetUserId } = req.body;

    if (!adminId || !(await isAdmin(adminId))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // @ts-ignore - Clerk SDK types might not have banUser depending on version, but it's a valid method
    await clerkClient.users.banUser(targetUserId);
    emitToUser(targetUserId, 'SESSION_REVOKED', { reason: 'Account banned by admin' });
    getSocketIo().emit('admin.activity', { action: 'ban', targetUserId });

    return res.status(200).json(new ApiResponse(200, {}, 'User banned successfully'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
