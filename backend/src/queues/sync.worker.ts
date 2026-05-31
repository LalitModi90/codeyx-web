import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis.config';
import { syncQueueName } from './sync.queue';
import { emitToUser } from '../socket';
import { PlatformStats } from '../models/platformStats.model';
import { fetchLeetCodeStats } from '../services/leetcode.service';
import { fetchCodeforcesStats } from '../services/codeforces.service';
import { fetchGitHubStats } from '../services/github.service';
import { fetchCodeChefStats } from '../services/codechef.service';
import { fetchHackerRankStats } from '../services/hackerrank.service';
import { fetchGFGStats } from '../services/gfg.service';

// Platform locks to prevent hitting the exact same platform APIs/scrapers concurrently
const platformLocks: Record<string, Promise<void>> = {};

const acquireLock = async (platform: string): Promise<() => void> => {
  const cleanPlatform = platform.toLowerCase() === 'gfg' ? 'geeksforgeeks' : platform.toLowerCase();
  
  // Wait if this platform is currently locked
  while (platformLocks[cleanPlatform]) {
    await platformLocks[cleanPlatform];
  }

  let releaseLock: () => void = () => {};
  platformLocks[cleanPlatform] = new Promise<void>((resolve) => {
    releaseLock = () => {
      delete platformLocks[cleanPlatform];
      resolve();
    };
  });

  return releaseLock;
};

export const setupWorkers = () => {
  const worker = new Worker(
    syncQueueName,
    async (job: Job) => {
      const { userId, platform, platformUsername } = job.data;
      const cleanPlatform = platform.toLowerCase() === 'gfg' ? 'geeksforgeeks' : platform.toLowerCase();
      
      console.log(`[Worker] Queue lock waiting for ${cleanPlatform} - user ${platformUsername || userId}`);
      const release = await acquireLock(cleanPlatform);
      
      try {
        console.log(`[Worker] LIVE fetching ${platform} for ${platformUsername || userId}`);
        
        let fetchedStats: any = null;

        // 1. Fetch from specific platform APIs
        if (platform === 'leetcode') {
          fetchedStats = await fetchLeetCodeStats(platformUsername || userId);
        } else if (platform === 'codeforces') {
          fetchedStats = await fetchCodeforcesStats(platformUsername || userId);
        } else if (platform === 'github') {
          const manager = require('../services/fallbackManager').FallbackManager.getInstance();
          const profile = await manager.resolveProfile('github', platformUsername || userId, true);
          fetchedStats = {
            totalSolved: profile.solved,
            rating: profile.rating,
            metadata: profile.metadata,
            stats: profile
          };
        } else if (platform === 'codechef') {
          fetchedStats = await fetchCodeChefStats(platformUsername || userId);
        } else if (platform === 'hackerrank') {
          fetchedStats = await fetchHackerRankStats(platformUsername || userId);
        } else if (platform === 'gfg' || platform === 'geeksforgeeks') {
          fetchedStats = await fetchGFGStats(platformUsername || userId);
        } else {
          throw new Error(`Platform ${platform} fetcher not implemented yet`);
        }

        // 2. Upsert into MongoDB
        await PlatformStats.findOneAndUpdate(
          { userId, platform: cleanPlatform },
          {
            username: platformUsername || userId,
            totalSolved: fetchedStats.totalSolved || 0,
            rating: fetchedStats.rating || 0,
            stats: fetchedStats,
            lastSyncedAt: new Date(),
          },
          { upsert: true, new: true }
        );
        
        // 3. Emit success via WebSockets
        emitToUser(userId, 'SYNC_COMPLETE', {
          platform,
          status: 'success',
          stats: {
            totalSolved: fetchedStats.totalSolved,
            rating: fetchedStats.rating
          }
        });

        return { success: true, platform };
      } finally {
        // Release platform lock
        release();
      }
    },
    {
      connection: redisClient,
      concurrency: 5, // Process 5 syncs concurrently across different platforms
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err);
    // Optionally emit failure to user
    if (job?.data?.userId) {
      emitToUser(job.data.userId, 'SYNC_FAILED', {
        platform: job.data.platform,
        error: err.message,
      });
    }
  });

  console.log('👷 BullMQ Workers initialized and listening...');
};
