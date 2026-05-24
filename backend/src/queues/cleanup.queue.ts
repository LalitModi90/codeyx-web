import { Queue } from 'bullmq';
import { redisClient, isRedisAvailable } from '../config/redis.config';

export const cleanupQueueName = 'cleanup-queue';

export const cleanupQueue = isRedisAvailable
  ? new Queue(cleanupQueueName, { connection: redisClient })
  : {
      add: async (name: string, data: any) => {
        console.log(`[Queue Mock] Redis unavailable. Skipping queue, direct execution or bypass for job: ${name}`);
        return {} as any;
      }
    } as any;

// Helper to add a cleanup job
export const addCleanupJob = async (clerkUserId: string) => {
  await cleanupQueue.add(
    'cleanup-user-data',
    { clerkUserId },
    {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000, 
      },
      removeOnComplete: true,
    }
  );
  console.log(`[Queue] Added Cleanup Job for User ${clerkUserId}`);
};
