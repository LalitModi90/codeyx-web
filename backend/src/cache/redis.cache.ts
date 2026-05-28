import { redisCache } from '../config/redis.config';

export class CacheService {
  private static readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  /**
   * Retrieves data from Redis by key.
   */
  public static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisCache.get(key);
      if (!data) return null;
      
      // Upstash Redis SDK can return the object directly if it parsed it,
      // otherwise, parse it manually.
      if (typeof data === 'string') {
        return JSON.parse(data) as T;
      }
      return data as T;
    } catch (error) {
      console.error(`[Cache Error] Failed to GET key "${key}":`, error);
      return null;
    }
  }

  /**
   * Sets data in Redis with a TTL (Time-To-Live).
   */
  public static async set<T>(key: string, value: T, ttlSeconds = CacheService.DEFAULT_TTL): Promise<void> {
    try {
      const stringified = JSON.stringify(value);
      await redisCache.set(key, stringified, { ex: ttlSeconds });
    } catch (error) {
      console.error(`[Cache Error] Failed to SET key "${key}":`, error);
    }
  }

  /**
   * Deletes a key from Redis.
   */
  public static async del(key: string): Promise<void> {
    try {
      await redisCache.del(key);
    } catch (error) {
      console.error(`[Cache Error] Failed to DEL key "${key}":`, error);
    }
  }
}
