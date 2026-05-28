import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis.config';
import { cleanupQueueName } from './cleanup.queue';
import { executeCascadeCleanup } from '../services/cleanup.service';

export const setupCleanupWorker = () => {
  const worker = new Worker(
    cleanupQueueName,
    async (job: Job) => {
      const { clerkUserId } = job.data;
      console.log(`[Cleanup Worker] Starting full background cascade delete for user: ${clerkUserId}`);

      try {
        await executeCascadeCleanup(clerkUserId);
        console.log(`[Cleanup Worker] Successfully processed background cleanup for user: ${clerkUserId}`);
      } catch (err: any) {
        console.error(`[Cleanup Worker] Background cleanup failed for user ${clerkUserId}:`, err.message);
        throw err; // Throwing will trigger BullMQ retry
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
  });

  console.log('👷 BullMQ Cleanup Worker initialized and listening...');
};
