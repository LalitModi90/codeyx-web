import cron from 'node-cron';
import { fetchAndStoreContests } from './services/contest.service';
import { redis } from './utils/redis';
import { Reminder } from './models/Reminder';
import { emitToUser } from './socket';

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
                    
                    // Mark as notified so we don't trigger it again
                    reminder.notified = true;
                    await reminder.save();
                }
            }
        } catch (err: any) {
            console.error('[Reminder Cron] Error executing reminders scheduler:', err.message);
        }
    });

    console.log('[Cron] Cron jobs initialized. Background workers running.');
};
