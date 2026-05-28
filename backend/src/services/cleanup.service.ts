import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Profile } from '../models/profile.model';
import { Project } from '../models/project.model';
import { PlatformStats } from '../models/platformStats.model';
import { UserActivity } from '../models/UserActivity';
import { UserFavorite } from '../models/UserFavorite';
import { UserProgress } from '../models/UserProgress';
import { Reminder } from '../models/Reminder';
import { CustomSheet } from '../models/CustomSheet';
import { CustomSheetProblem } from '../models/CustomSheetProblem';
import { Follower } from '../models/follower.model';
import { Notification } from '../models/notification.model';
import { redisClient } from '../config/redis.config';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary in case it wasn't configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Perform complete cascade data deletion, cache invalidation, and media cleanup for a deleted Clerk user.
 * Supports transactional execution with standalone/single-node MongoDB grace fallback.
 */
export const executeCascadeCleanup = async (clerkUserId: string): Promise<boolean> => {
  console.log(`[Cleanup Service] Initializing full cascade delete for Clerk ID: ${clerkUserId}`);

  // 1. Cloudinary Asset Cleanup (Delete all screenshots uploaded by this user tagged with their clerkUserId)
  try {
    console.log(`[Cleanup Service] Deleting Cloudinary resources tagged with ${clerkUserId}...`);
    await cloudinary.api.delete_resources_by_tag(clerkUserId);
    console.log(`[Cleanup Service] Cloudinary resources successfully deleted for ${clerkUserId}`);
  } catch (cloudErr: any) {
    console.warn(`[Cleanup Service] Cloudinary deletion skipped or failed (likely empty tag):`, cloudErr.message || cloudErr);
  }

  // 2. Fetch follower/following connections to invalidate related user caches
  let followers: string[] = [];
  let followings: string[] = [];
  try {
    const followerDocs = await Follower.find({ followingId: clerkUserId }).lean();
    const followingDocs = await Follower.find({ followerId: clerkUserId }).lean();
    followers = followerDocs.map(f => f.followerId);
    followings = followingDocs.map(f => f.followingId);
  } catch (err: any) {
    console.error(`[Cleanup Service] Error retrieving follower links for cache invalidation:`, err.message);
  }

  // 3. Database Deletions (Attempts transaction, falls back to direct queries if replica set is missing)
  let useTransaction = true;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    console.log('[Cleanup Service] Attempting transactional DB cleanup...');

    // Delete custom sheet problems first
    const userSheets = await CustomSheet.find({ userId: clerkUserId }).session(session);
    const sheetIds = userSheets.map(s => s._id);
    if (sheetIds.length > 0) {
      await CustomSheetProblem.deleteMany({ customSheetId: { $in: sheetIds } }).session(session);
    }

    // Cascading delete across all user collections
    await Promise.all([
      CustomSheet.deleteMany({ userId: clerkUserId }).session(session),
      UserProgress.deleteMany({ userId: clerkUserId }).session(session),
      UserFavorite.deleteMany({ userId: clerkUserId }).session(session),
      UserActivity.deleteMany({ userId: clerkUserId }).session(session),
      Reminder.deleteMany({ userId: clerkUserId }).session(session),
      PlatformStats.deleteMany({ userId: clerkUserId }).session(session),
      Project.deleteMany({ userId: clerkUserId }).session(session),
      Profile.deleteMany({ userId: clerkUserId }).session(session),
      Follower.deleteMany({ $or: [{ followerId: clerkUserId }, { followingId: clerkUserId }] }).session(session),
      Notification.deleteMany({ $or: [{ userId: clerkUserId }, { actorId: clerkUserId }] }).session(session),
    ]);

    // Pull any ratings/reviews/comments left by this user on other users' projects
    await Project.updateMany(
      {},
      { $pull: { ratings: { userId: clerkUserId } } }
    ).session(session);

    // Delete the core User document last
    await User.deleteOne({ clerkUserId }).session(session);

    await session.commitTransaction();
    console.log('[Cleanup Service] Transactional DB cleanup succeeded.');
  } catch (err: any) {
    useTransaction = false;
    await session.abortTransaction();
    console.warn(`[Cleanup Service] Transaction failed or unsupported (e.g. Standalone MongoDB): ${err.message}. Falling back to direct queries...`);
  } finally {
    session.endSession();
  }

  // Standalone MongoDB Fallback (direct deletions without transaction)
  if (!useTransaction) {
    try {
      console.log('[Cleanup Service] Executing direct cascading delete fallback...');

      const userSheets = await CustomSheet.find({ userId: clerkUserId });
      const sheetIds = userSheets.map(s => s._id);
      if (sheetIds.length > 0) {
        await CustomSheetProblem.deleteMany({ customSheetId: { $in: sheetIds } });
      }

      await Promise.all([
        CustomSheet.deleteMany({ userId: clerkUserId }),
        UserProgress.deleteMany({ userId: clerkUserId }),
        UserFavorite.deleteMany({ userId: clerkUserId }),
        UserActivity.deleteMany({ userId: clerkUserId }),
        Reminder.deleteMany({ userId: clerkUserId }),
        PlatformStats.deleteMany({ userId: clerkUserId }),
        Project.deleteMany({ userId: clerkUserId }),
        Profile.deleteMany({ userId: clerkUserId }),
        Follower.deleteMany({ $or: [{ followerId: clerkUserId }, { followingId: clerkUserId }] }),
        Notification.deleteMany({ $or: [{ userId: clerkUserId }, { actorId: clerkUserId }] }),
      ]);

      await Project.updateMany(
        {},
        { $pull: { ratings: { userId: clerkUserId } } }
      );

      await User.deleteOne({ clerkUserId });
      console.log('[Cleanup Service] Direct cascading delete fallback succeeded.');
    } catch (fallbackErr: any) {
      console.error('[Cleanup Service] Direct cascading delete fallback FAILED:', fallbackErr.message);
      throw fallbackErr;
    }
  }

  // 4. Invalidate Redis Caches
  try {
    console.log('[Cleanup Service] Wiping user caches in Redis...');
    
    // Core keys
    const keysToDel = [
      `projects:${clerkUserId}`,
      `profile:${clerkUserId}`,
      `user:${clerkUserId}`,
      `followers:${clerkUserId}`,
      `following:${clerkUserId}`,
      `leaderboard:${clerkUserId}`,
      `portfolio:${clerkUserId}`,
      `analytics:${clerkUserId}`
    ];

    // Follower/Following associated caches
    followers.forEach(fid => {
      keysToDel.push(`following:${fid}`);
    });
    followings.forEach(fid => {
      keysToDel.push(`followers:${fid}`);
    });

    // Bulk delete keys
    if (redisClient && typeof redisClient.del === 'function') {
      await Promise.all(keysToDel.map(key => redisClient.del(key).catch(() => {})));
    }
    console.log('[Cleanup Service] Redis caches successfully invalidated.');
  } catch (cacheErr: any) {
    console.warn('[Cleanup Service] Redis cache invalidation skipped or failed:', cacheErr.message || cacheErr);
  }

  console.log(`[Cleanup Service] All cleanup operations for User ${clerkUserId} completed successfully!`);
  return true;
};
