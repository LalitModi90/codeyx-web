import { Redis as UpstashRedis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

// ===========================
// @upstash/redis REST client (for caching)
// ===========================
export const redisCache = new UpstashRedis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ===========================
// Dummy redisClient for BullMQ compatibility
// BullMQ workers are disabled locally - they use try/catch in server.ts
// In production, set REDIS_URL and use real ioredis connection
// ===========================
export const redisClient = {
  // Minimal mock - BullMQ workers will fail gracefully in try/catch
  on: () => {},
  disconnect: () => {},
  get: async (key: string) => {
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const val = await redisCache.get(key);
        return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
      }
    } catch (e) {
      console.error('Redis GET error:', e);
    }
    return null;
  },
  set: async (key: string, value: string, ...args: any[]) => {
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        let options: any = {};
        if (args.includes('EX')) {
          const exIdx = args.indexOf('EX');
          const ttl = args[exIdx + 1];
          options.ex = Number(ttl);
        }
        return await redisCache.set(key, value, options);
      }
    } catch (e) {
      console.error('Redis SET error:', e);
    }
    return null;
  },
  del: async (key: string) => {
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        return await redisCache.del(key);
      }
    } catch (e) {
      console.error('Redis DEL error:', e);
    }
    return null;
  }
} as any;

export const isRedisAvailable = false;
