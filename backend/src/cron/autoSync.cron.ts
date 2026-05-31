import cron from 'node-cron';
import { User } from '../models/user.model';
import { PlatformStats } from '../models/platformStats.model';
import { addSyncJob } from '../queues/sync.queue';

// This cron job runs every 30 minutes
export const initCronJobs = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('⏳ [CRON] Starting Auto-Sync for all users...');

    try {
      // 1. Fetch all users who have linked platforms
      // In a real scenario, we might only fetch active users to save API calls
      const activeStats = await PlatformStats.find({});
      
      let queuedCount = 0;
      const staggerDelayMs = 5000; // Stagger each task by 5 seconds

      for (const stat of activeStats) {
        // Push each sync task to BullMQ with an incremental stagger delay
        // This ensures they execute separated in time and respect rate limits
        const currentDelay = queuedCount * staggerDelayMs;
        await addSyncJob(stat.userId.toString(), stat.platform, stat.username, currentDelay);
        queuedCount++;
      }

      console.log(`✅ [CRON] Queued ${queuedCount} platform syncs for background processing.`);
    } catch (error) {
      console.error('❌ [CRON] Failed to run nightly sync:', error);
    }
  });

  console.log('⏰ Auto-Sync Cron Jobs Initialized.');
};
