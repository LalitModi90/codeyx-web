import cron from 'node-cron';
import { Contest } from '../models/Contest';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { sendContestNotificationEmail } from '../services/mail.service';

// Store already notified contests to prevent duplicate emails
// Key: "contestId_timeRemaining" (e.g., "64a2b_30m")
const notifiedMap = new Set<string>();

export const startNotificationCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Fetch upcoming contests
      const upcomingContests = await Contest.find({
        status: 'Upcoming',
        startTime: { $gt: now }, // starts in the future
      });

      if (upcomingContests.length === 0) return;

      let allUsers: any[] = [];
      let fetchedUsers = false;

      for (const contest of upcomingContests) {
        const start = new Date(contest.startTime);
        const diffMs = start.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 1000 / 60);

        let timeRemainingLabel = '';
        let triggerAlert = false;

        // Check for 60m, 30m, and 5m milestones
        if (diffMins === 60) {
          timeRemainingLabel = '1 Hour';
          triggerAlert = true;
        } else if (diffMins === 30) {
          timeRemainingLabel = '30 Minutes';
          triggerAlert = true;
        } else if (diffMins === 5) {
          timeRemainingLabel = '5 Minutes';
          triggerAlert = true;
        }

        if (triggerAlert) {
          const cacheKey = `${contest._id}_${timeRemainingLabel}`;
          if (notifiedMap.has(cacheKey)) continue; // Already sent
          notifiedMap.add(cacheKey);

          console.log(`[Notification Cron] Triggering ${timeRemainingLabel} alert for: ${contest.name}`);

          // Fetch users only if we need to send an alert (to save Clerk API limits)
          if (!fetchedUsers) {
            const clerkResponse = await clerkClient.users.getUserList({ limit: 500 });
            allUsers = Array.isArray(clerkResponse) ? clerkResponse : (clerkResponse as any).data ?? clerkResponse;
            fetchedUsers = true;
          }

          // Broadcast email to all users
          for (const user of allUsers) {
            const email = user.emailAddresses?.[0]?.emailAddress;
            if (email) {
              await sendContestNotificationEmail(
                email,
                contest.name,
                contest.site || 'Platform',
                timeRemainingLabel,
                contest.url
              );
            }
          }
        }
      }
    } catch (err) {
      console.error('[Notification Cron] Error running job:', err);
    }
  });

  console.log('⏰ Notification Email Cron Job started. Checking every minute.');
};
