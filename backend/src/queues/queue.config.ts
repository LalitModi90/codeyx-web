import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const connection: any = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Connection failed. Stopping retries for local dev.');
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      }
    })
  : undefined;

// If no valid REDIS_URL, we export Mock Queues to prevent crashing and connection retries
const createQueue = (name: string) => {
  if (connection) {
    return new Queue(name, { connection });
  }
  // Mock queue object for local dev without Redis
  return {
    add: async (jobName: string, data: any, opts: any) => {
      console.log(`[Mock Queue] ${name}: add ${jobName} bypassed (No Redis)`);
    }
  } as unknown as Queue;
};

// Queues
export const profileQueue = createQueue('profileQueue');
export const contestQueue = createQueue('contestQueue');
export const reminderQueue = createQueue('reminderQueue');
export const notificationQueue = createQueue('notificationQueue');
