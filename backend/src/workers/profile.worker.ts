import { Worker, Job } from 'bullmq';
import { connection } from '../queues/queue.config';
import { PlatformStats } from '../models/platformStats.model';
import { fetchLeetCodeStats } from '../services/leetcode.service';
import { fetchCodeforcesStats } from '../services/codeforces.service';
import { fetchGitHubStats } from '../services/github.service';
import { fetchCodeChefStats } from '../services/codechef.service';
import { fetchHackerRankStats } from '../services/hackerrank.service';
import { fetchGFGStats } from '../services/gfg.service';
import { fetchAtCoderStats } from '../services/atcoder.service';

const processProfileSync = async (job: Job) => {
  const { userId, platform, platformUsername } = job.data;
  const username = platformUsername || userId;

  let fetchedStats: any = null;

  try {
    if (platform === 'leetcode') fetchedStats = await fetchLeetCodeStats(username);
    else if (platform === 'codeforces') fetchedStats = await fetchCodeforcesStats(username);
    else if (platform === 'github') fetchedStats = await fetchGitHubStats(username);
    else if (platform === 'codechef') fetchedStats = await fetchCodeChefStats(username);
    else if (platform === 'hackerrank') fetchedStats = await fetchHackerRankStats(username);
    else if (platform === 'gfg') fetchedStats = await fetchGFGStats(username);
    else if (platform === 'atcoder') fetchedStats = await fetchAtCoderStats(username);
    else throw new Error(`Platform ${platform} not supported`);

    // Sync into MongoDB
    await PlatformStats.findOneAndUpdate(
      { userId, platform },
      {
        username,
        totalSolved: fetchedStats.solvedProblems || fetchedStats.totalSolved || 0,
        rating: fetchedStats.rating || 0,
        stats: fetchedStats,
        lastSyncedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log(`[BullMQ Worker] Profile synced for ${platformUsername} on ${platform}`);
  } catch (error: any) {
    console.error(`[BullMQ Worker] Profile sync failed for ${platformUsername} on ${platform}:`, error.message);
    throw error;
  }
};

export const profileWorker = connection 
  ? new Worker('profileQueue', processProfileSync, { connection })
  : null;

if (profileWorker) {
  profileWorker.on('completed', job => {
    console.log(`[BullMQ Worker] Job ${job.id} completed successfully`);
  });

  profileWorker.on('failed', (job, err) => {
    console.error(`[BullMQ Worker] Job ${job?.id} failed with ${err.message}`);
  });
}
