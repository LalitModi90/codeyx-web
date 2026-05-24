import { Request, Response } from 'express';
import { FriendRequest } from '../models/friendRequest.model';
import { Friend } from '../models/friend.model';
import { getSocketIo } from '../socket';
import { User } from '../models/user.model';
import { clerkClient, getAuth } from '@clerk/express';
import { redisClient } from '../config/redis.config';

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const senderId = getAuth(req).userId;
    const { receiverId } = req.body;
    
    console.log(`[Social API] sendFriendRequest called. senderId: ${senderId}, receiverId: ${receiverId}`);

    if (!senderId || !receiverId) return res.status(400).json({ success: false, message: `Missing IDs. senderId: ${senderId}, receiverId: ${receiverId}` });
    if (senderId === receiverId) return res.status(400).json({ success: false, message: 'Cannot friend yourself' });

    // Check if already friends
    const existingFriend = await Friend.findOne({
      $or: [
        { user1Id: senderId, user2Id: receiverId },
        { user1Id: receiverId, user2Id: senderId }
      ]
    });
    if (existingFriend) return res.status(400).json({ success: false, message: 'Already friends' });

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { senderId, receiverId, status: 'pending' },
        { senderId: receiverId, receiverId: senderId, status: 'pending' }
      ]
    });
    
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Pending request already exists between these users' });
    }

    const request = await FriendRequest.findOneAndUpdate(
      { senderId, receiverId },
      { $set: { status: 'pending', createdAt: new Date(), updatedAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const senderDetails = await User.findOne({ clerkUserId: senderId }).lean();
    const senderName = senderDetails && senderDetails.firstName ? `${senderDetails.firstName} ${senderDetails.lastName || ''}`.trim() : senderId.slice(-4);

    const io = getSocketIo();
    io.to(receiverId).emit('friend.request.received', { senderId, senderName, requestId: request?._id });

    return res.status(200).json({ success: true, message: 'Friend request sent' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const receiverId = getAuth(req).userId;
    const { requestId } = req.body;

    if (!receiverId || !requestId) return res.status(400).json({ success: false, message: 'Missing Data' });

    const request = await FriendRequest.findOne({ _id: requestId, receiverId, status: 'pending' });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found or already processed' });

    request.status = 'accepted';
    await request.save();

    await Friend.create({
      user1Id: request.senderId,
      user2Id: request.receiverId
    });

    const io = getSocketIo();
    io.to(request.senderId).emit('friend.request.accepted', { receiverId });
    // Tell both clients to refresh their friend lists
    io.to(request.senderId).emit('friend.list.updated');
    io.to(receiverId).emit('friend.list.updated');

    // Invalidate profile cache for both users
    await redisClient.del(`profile:${request.senderId}`);
    await redisClient.del(`profile:${receiverId}`);

    return res.status(200).json({ success: true, message: 'Friend request accepted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    const receiverId = getAuth(req).userId;
    const { requestId } = req.body;

    if (!receiverId || !requestId) return res.status(400).json({ success: false, message: 'Missing Data' });

    const request = await FriendRequest.findOne({ _id: requestId, receiverId, status: 'pending' });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = 'rejected';
    await request.save();

    const receiverDetails = await User.findOne({ clerkUserId: receiverId }).lean();
    const receiverName = receiverDetails && receiverDetails.firstName ? `${receiverDetails.firstName} ${receiverDetails.lastName || ''}`.trim() : receiverId.slice(-4);

    const io = getSocketIo();
    io.to(request.senderId).emit('friend.request.rejected', { receiverName, receiverId });

    return res.status(200).json({ success: true, message: 'Friend request rejected' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const revokeFriendRequest = async (req: Request, res: Response) => {
  try {
    const senderId = getAuth(req).userId;
    const { receiverId } = req.body;

    if (!senderId || !receiverId) return res.status(400).json({ success: false, message: 'Missing Data' });

    const existingReq = await FriendRequest.findOne({ senderId, receiverId });
    if (!existingReq) return res.status(404).json({ success: false, message: 'Pending request not found or already deleted' });
    if (existingReq.status !== 'pending') return res.status(400).json({ success: false, message: `Too late! Request is already ${existingReq.status}` });

    // Delete the pending request instead of just marking it rejected so it doesn't clutter DB
    await FriendRequest.findOneAndDelete({ senderId, receiverId, status: 'pending' });

    const io = getSocketIo();
    io.to(receiverId).emit('friend.request.revoked', { senderId });

    return res.status(200).json({ success: true, message: 'Friend request revoked' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFriend = async (req: Request, res: Response) => {
  try {
    const userId = getAuth(req).userId;
    const { friendId } = req.body;

    if (!userId || !friendId) return res.status(400).json({ success: false, message: 'Missing Data' });

    await Friend.findOneAndDelete({
      $or: [
        { user1Id: userId, user2Id: friendId },
        { user1Id: friendId, user2Id: userId }
      ]
    });

    const io = getSocketIo();
    io.to(userId).emit('friend.list.updated');
    io.to(friendId).emit('friend.list.updated');

    await redisClient.del(`profile:${userId}`);
    await redisClient.del(`profile:${friendId}`);

    return res.status(200).json({ success: true, message: 'Friend removed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFriendsList = async (req: Request, res: Response) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const friends = await Friend.find({
      $or: [{ user1Id: userId }, { user2Id: userId }]
    }).lean();

    const friendIds = friends.map(f => f.user1Id === userId ? f.user2Id : f.user1Id);

    return res.status(200).json({ success: true, data: { friendIds }, message: 'Fetched friends list' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const incoming = await FriendRequest.find({ receiverId: userId, status: 'pending' }).lean();
    
    // Attach sender details
    const incomingWithDetails = await Promise.all(incoming.map(async (req) => {
      const user = await User.findOne({ clerkUserId: req.senderId }).lean();
      return {
        ...req,
        senderName: user && user.firstName ? `${user.firstName} ${user.lastName}`.trim() : req.senderId.slice(-4)
      };
    }));

    const outgoing = await FriendRequest.find({ senderId: userId, status: 'pending' }).lean();

    return res.status(200).json({ 
      success: true, 
      data: { incoming: incomingWithDetails, outgoing }, 
      message: 'Fetched pending requests' 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
