import cron from 'node-cron';
import { fetchAndStoreContests } from './services/contest.service';
import { redis } from './utils/redis';
import { Reminder } from './models/Reminder';
import { emitToUser } from './socket';
import { profileQueue, connection } from './queues/queue.config';
import { PlatformStats } from './models/platformStats.model';
import { User } from './models/user.model';
import { FriendRequest } from './models/friendRequest.model';
import { sendContestEmail } from './services/email.service';

// Utility to process synchronously if BullMQ is offline (no REDIS_URL)
const syncProfilesSync = async () => {
  const users = await PlatformStats.find({});
  for (const account of users) {
    console.log(`[Cron Fallback] Syncing ${account.username} on ${account.platform}...`);
  }
};

export const startCronJobs = () => {
    const runRefresh = async () => {
        console.log('[Cron] Fetching fresh contest data...');
        const contests = await fetchAndStoreContests();
        if (contests) {
            // Update Redis cache explicitly after DB update
            await redis.set('contests_upcoming', JSON.stringify(contests));
            // Set 2 hours expiry + 5 mins buffer
            await redis.expire('contests_upcoming', 2 * 60 * 60 + 300);
        }
    };

    // Run every 2 hours
    cron.schedule('0 */2 * * *', runRefresh);

    // Trigger immediate background sync on startup to populate CodeChef & AtCoder
    runRefresh().catch(err => console.error('[Cron] Initial startup fetch failed:', err.message));

    // Run every minute to check upcoming contest reminders
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            // Fetch reminders that haven't been notified yet
            const pendingReminders = await Reminder.find({ notified: false }).populate('contestId');
            
            for (const reminder of pendingReminders) {
                const contest = reminder.contestId as any;
                if (!contest) continue; // Skip if contest is deleted or not populated
                
                // Calculate when this reminder should trigger
                const triggerTime = new Date(contest.startTime.getTime() - reminder.reminderBefore * 60 * 1000);
                
                if (now >= triggerTime) {
                    console.log(`[Reminder Cron] Sending notification to User ${reminder.userId} for contest: ${contest.name}`);
                    
                    // Trigger real-time WebSocket reminder event
                    emitToUser(reminder.userId, 'CONTEST_REMINDER', {
                        id: reminder._id,
                        contestName: contest.name,
                        platform: contest.site,
                        startTime: contest.startTime,
                        url: contest.url,
                        reminderBefore: reminder.reminderBefore,
                        message: `Reminder: "${contest.name}" starts in ${reminder.reminderBefore} minutes!`
                    });
                    
                    // Fetch user email and send email notification
                    const user = await User.findOne({ clerkUserId: reminder.userId });
                    if (user && user.email) {
                        await sendContestEmail(
                            user.email,
                            contest.name,
                            contest.site,
                            reminder.reminderBefore,
                            contest.url
                        );
                    }
                    
                    // Mark as notified so we don't trigger it again
                    reminder.notified = true;
                    await reminder.save();
                }
            }
        } catch (err: any) {
            console.error('[Reminder Cron] Error executing reminders scheduler:', err.message);
        }
    });

    // Run every 2 hours to sync Active Users Profiles to MongoDB via BullMQ
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

    // Run every 24 hours to Sync Inactive Users (e.g., midnight)
    cron.schedule('0 0 * * *', async () => {
        console.log('[Cron] Running Inactive Users Sync...');
    });

    // Run every 24 hours (midnight) to auto-revoke pending friend requests older than 2 days
    cron.schedule('0 0 * * *', async () => {
        try {
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
            const result = await FriendRequest.deleteMany({ 
                status: 'pending', 
                createdAt: { $lt: twoDaysAgo } 
            });
            if (result.deletedCount > 0) {
                console.log(`[Cron] Auto-revoked ${result.deletedCount} pending friend requests older than 2 days.`);
            }
        } catch (error: any) {
            console.error('[Cron] Error auto-revoking friend requests:', error.message);
        }
    });

    console.log('[Cron] Cron jobs initialized. Background workers running.');
};
