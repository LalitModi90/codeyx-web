import { redisClient } from '../config/redis.config';

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

/**
 * Standardized fetch wrapper with Retries and Timeout
 */
export const fetchWithRetry = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  const { timeoutMs = 5000, retries = 2, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return response;
    } catch (error: any) {
      lastError = error;
      console.warn(`[Fetch Retry] Attempt ${attempt + 1} failed for ${url}: ${error.message}`);
      if (attempt < retries) {
        // Exponential backoff: 500ms, 1000ms
        await new Promise(res => setTimeout(res, 500 * Math.pow(2, attempt)));
      }
    }
  }

  throw new Error(`Fetch failed after ${retries} retries: ${lastError?.message}`);
};

/**
 * Standardized Fetch with Redis Caching
 */
export const fetchWithCache = async <T>(
  cacheKey: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> => {
  try {
    // 1. Try to get from Cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }

    // 2. Fetch fresh data
    const freshData = await fetchFn();

    // 3. Save to Cache
    await redisClient.set(cacheKey, JSON.stringify(freshData), 'EX', ttlSeconds);

    return freshData;
  } catch (error: any) {
    // 4. Fallback: If fetch fails but we have stale data (this requires a different caching strategy in the future, 
    // but for now we just throw if cache missed and fetch failed).
    console.error(`[Cache/Fetch Error] for ${cacheKey}:`, error.message);
    throw error;
  }
};
