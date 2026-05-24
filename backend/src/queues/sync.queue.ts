import { Queue } from 'bullmq';
import { redisClient, isRedisAvailable } from '../config/redis.config';

export const syncQueueName = 'platform-sync-queue';

export const syncQueue = isRedisAvailable
  ? new Queue(syncQueueName, { connection: redisClient })
  : {
      add: async (name: string, data: any) => {
        console.log(`[Queue Mock] Redis unavailable. Skipping queue, direct execution or bypass for job: ${name}`);
        return {} as any;
      }
    } as any;

// Helper to add a sync job
export const addSyncJob = async (userId: string, platform: string, data?: any) => {
  await syncQueue.add(
    'sync-platform',
    { userId, platform, data },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // 5s, 25s, 125s
      },
      removeOnComplete: true, // Keep redis memory clean
    }
  );
  console.log(`Job added to queue: Sync ${platform} for User ${userId}`);
};
