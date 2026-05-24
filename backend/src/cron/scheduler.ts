import cron from 'node-cron';
import { profileQueue, connection } from '../queues/queue.config';
import { PlatformStats } from '../models/platformStats.model';

// Utility to process synchronously if BullMQ is offline (no REDIS_URL)
const syncProfilesSync = async () => {
  const users = await PlatformStats.find({});
  for (const account of users) {
    console.log(`[Cron Fallback] Syncing ${account.username} on ${account.platform}...`);
    // Here we'd import and call controllers directly, but for now we just log
    // as the main controller triggers sync on load anyway.
  }
};

export const startCronJobs = () => {
  console.log('[Cron] Starting background scheduler...');

  // 1. Sync Active Users (Every 2 hours)
  cron.schedule('0 */2 * * *', async () => {
    console.log('[Cron] Running Active Users Sync...');
    
    // Find users synced more than 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const staleAccounts = await PlatformStats.find({ lastSyncedAt: { $lt: twoHoursAgo } });

    if (connection) {
      // Push to BullMQ
      for (const account of staleAccounts) {
        await profileQueue.add('syncProfile', {
          userId: account.userId,
          platform: account.platform,
          platformUsername: account.username
        }, {
          removeOnComplete: true,
          removeOnFail: 100, // Keep last 100 failed jobs for debugging
        });
      }
      console.log(`[Cron] Queued ${staleAccounts.length} profiles for syncing.`);
    } else {
      // Fallback
      await syncProfilesSync();
    }
  });

  // 2. Sync Inactive Users (Every 24 hours - e.g., midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running Inactive Users Sync...');
    // Implementation would find accounts not logged in for 30 days
  });

  // 3. Sync Contests (Every 1 hour)
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running Contest Sync...');
    // Implement global contest sync
  });
};
