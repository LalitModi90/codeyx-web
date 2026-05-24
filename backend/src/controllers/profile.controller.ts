import { Request, Response } from 'express';
import { Profile } from '../models/profile.model';
import { Friend } from '../models/friend.model';
import { FriendRequest } from '../models/friendRequest.model';
import { ApiResponse } from '../utils/ApiResponse';
import { getAuth, clerkClient } from '@clerk/express';
import { getSocketIo } from '../socket';
import { redisClient } from '../config/redis.config';
import { User } from '../models/user.model';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = getAuth(req).userId || req.body.userId; // Assuming Clerk middleware attaches auth
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
    const currentUserId = getAuth(req).userId;
    const isViewerSameUser = currentUserId && currentUserId === userId;
    
    let friendStatus = 'none'; // 'none' | 'pending_sent' | 'pending_received' | 'friends'
    if (currentUserId && !isViewerSameUser) {
      const isFriend = await Friend.exists({
        $or: [
          { user1Id: currentUserId, user2Id: userId },
          { user1Id: userId, user2Id: currentUserId }
        ]
      });
      if (isFriend) {
        friendStatus = 'friends';
      } else {
        const pendingRequest = await FriendRequest.findOne({
          $or: [
            { senderId: currentUserId, receiverId: userId, status: 'pending' },
            { senderId: userId, receiverId: currentUserId, status: 'pending' }
          ]
        });
        if (pendingRequest) {
          friendStatus = pendingRequest.senderId === currentUserId ? 'pending_sent' : 'pending_received';
        }
      }
    }

    // Check Cache First (unless refresh is requested)
    const bypassCache = true; // Temporary fix to clear stuck cache from previous crash
    const cached = await redisClient.get(`profile:${userId}`);
    if (cached && !bypassCache) {
      const cachedData = JSON.parse(cached);
      return res.status(200).json(new ApiResponse(200, { ...cachedData, friendStatus }, 'Fetched profile (cache)'));
    }

    const profile = await Profile.findOne({ userId });

    const connectionsCount = await Friend.countDocuments({
      $or: [{ user1Id: userId }, { user2Id: userId }]
    });

    const friendsList = await Friend.find({
      $or: [{ user1Id: userId }, { user2Id: userId }]
    }).limit(6).lean();

    const friendIds = friendsList.map(f => f.user1Id === userId ? f.user2Id : f.user1Id);
    
    console.log(`[DEBUG] getProfile for ${userId} - connectionsCount: ${connectionsCount}, friendsList:`, friendsList, `friendIds:`, friendIds);

    // Fetch users, but also map missing users so the connection block doesn't just disappear
    const usersInDb = await User.find(
      { clerkUserId: { $in: friendIds } },
      { clerkUserId: 1, firstName: 1, lastName: 1, avatarUrl: 1, _id: 0 }
    ).lean();

    const connections = await Promise.all(friendIds.map(async fId => {
      const found = usersInDb.find(u => u.clerkUserId === fId);
      if (found) return found;
      
      // Fallback: Fetch missing user details directly from Clerk
      try {
        const clerkUser = await clerkClient.users.getUser(fId);
        return { 
          clerkUserId: fId, 
          firstName: clerkUser.firstName || 'User', 
          lastName: clerkUser.lastName || fId.slice(-4), 
          avatarUrl: clerkUser.imageUrl || '' 
        };
      } catch (clerkErr) {
        return { clerkUserId: fId, firstName: `User`, lastName: fId.slice(-4), avatarUrl: '' };
      }
    }));

    const profileData = profile
      ? { ...profile.toObject(), connectionsCount, connections }
      : { userId, connectionsCount, connections };

    if (profile) {
      await redisClient.set(`profile:${userId}`, JSON.stringify(profileData), 'EX', 3600); // 1 hour TTL
    }

    // Temporary debug injection
    const allFriends = await Friend.find().lean();
    return res.status(200).json(new ApiResponse(200, { ...profileData, friendStatus, DEBUG_ALL_FRIENDS: allFriends }, 'Fetched profile'));
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
