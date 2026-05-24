import cron from 'node-cron';
import { User } from '../models/user.model';
import { PlatformStats } from '../models/platformStats.model';
import { addSyncJob } from '../queues/sync.queue';

// This cron job runs every night at 2:00 AM
export const initCronJobs = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('⏳ [CRON] Starting Nightly Auto-Sync for all users...');

    try {
      // 1. Fetch all users who have linked platforms
      // In a real scenario, we might only fetch active users to save API calls
      const activeStats = await PlatformStats.find({});
      
      let queuedCount = 0;

      for (const stat of activeStats) {
        // Push each sync task to BullMQ
        // This ensures we don't crash our server and respect rate limits
        await addSyncJob(stat.userId.toString(), stat.platform, stat.username);
        queuedCount++;
      }

      console.log(`✅ [CRON] Queued ${queuedCount} platform syncs for background processing.`);
    } catch (error) {
      console.error('❌ [CRON] Failed to run nightly sync:', error);
    }
  });

  console.log('⏰ Auto-Sync Cron Jobs Initialized.');
};
