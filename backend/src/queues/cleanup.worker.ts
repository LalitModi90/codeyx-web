import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { redisClient } from '../config/redis.config';
import { cleanupQueueName } from './cleanup.queue';
import { User } from '../models/user.model';
import { PlatformStats } from '../models/platformStats.model';
import cloudinary from '../config/cloudinary.config';

export const setupCleanupWorker = () => {
  const worker = new Worker(
    cleanupQueueName,
    async (job: Job) => {
      const { clerkUserId } = job.data;
      console.log(`[Cleanup Worker] Starting full cascade delete for user: ${clerkUserId}`);

      // 1. Cloudinary Asset Cleanup
      // Assuming assets uploaded by this user were tagged with their clerkUserId
      try {
        await cloudinary.api.delete_resources_by_tag(clerkUserId);
        console.log(`[Cleanup Worker] Cloudinary assets deleted for ${clerkUserId}`);
      } catch (cloudErr) {
        console.error(`[Cleanup Worker] Cloudinary deletion failed (might be empty):`, cloudErr);
      }

      // 2. MongoDB Transactional Cascade Delete
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Delete child documents safely
        await PlatformStats.deleteMany({ userId: clerkUserId }).session(session);
        // Note: Add other model deletions here (Profiles, Projects, etc.) as they are created
        
        // Delete main user record
        await User.findOneAndDelete({ clerkUserId }).session(session);

        await session.commitTransaction();
        session.endSession();
        console.log(`[Cleanup Worker] MongoDB Cascade delete SUCCESS for ${clerkUserId}`);
        
      } catch (dbErr) {
        await session.abortTransaction();
        session.endSession();
        console.error(`[Cleanup Worker] MongoDB Transaction FAILED for ${clerkUserId}:`, dbErr);
        throw dbErr; // Retry job
      }

      return { success: true, clerkUserId };
    },
    {
      connection: redisClient,
      concurrency: 1, // Safe sequential deletion
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Cleanup Worker] Job ${job?.id} completely failed:`, err);
    // Move to Dead Letter Queue or notify admin
  });

  console.log('👷 BullMQ Cleanup Worker initialized and listening...');
};
