import { IProfileProvider, UnifiedResponse } from '../providers/types';
import { GitHubProvider } from '../providers/github.provider';
import { LeetCodeProvider } from '../providers/leetcode.provider';
import { CodeforcesProvider } from '../providers/codeforces.provider';
import { CodeChefProvider } from '../providers/codechef.provider';
import { HackerRankProvider } from '../providers/hackerrank.provider';
import { AtCoderProvider } from '../providers/atcoder.provider';
import { normalizeProfile } from '../adapters/normalizer';
import { getCircuitBreaker } from '../utils/circuitBreaker';
import { withRetry } from '../utils/retry';
import { CacheService } from '../cache/redis.cache';

export class FallbackManager {
  private readonly providers: Record<string, IProfileProvider> = {};
  private static instance: FallbackManager;

  private constructor() {
    // Initialize platform providers
    this.providers['github'] = new GitHubProvider();
    this.providers['leetcode'] = new LeetCodeProvider();
    this.providers['codeforces'] = new CodeforcesProvider();
    this.providers['codechef'] = new CodeChefProvider();
    this.providers['hackerrank'] = new HackerRankProvider();
    this.providers['atcoder'] = new AtCoderProvider();
  }

  public static getInstance(): FallbackManager {
    if (!FallbackManager.instance) {
      FallbackManager.instance = new FallbackManager();
    }
    return FallbackManager.instance;
  }

  /**
   * Resolves developer profile with fallback logic, retries, timeout, and caching.
   */
  public async resolveProfile(
    platform: string,
    username: string,
    forceRefresh = false
  ): Promise<UnifiedResponse> {
    const cleanPlatform = platform.toLowerCase();
    const provider = this.providers[cleanPlatform];

    if (!provider) {
      throw new Error(`Platform "${platform}" is not supported.`);
    }

    const cacheKey = `profile:${cleanPlatform}:${username}`;

    // 1. Read from Cache (unless force refresh requested)
    if (!forceRefresh) {
      const cached = await CacheService.get<UnifiedResponse>(cacheKey);
      if (cached) {
        console.log(`[Cache Hit] Serving ${cleanPlatform} profile for ${username} from Redis.`);
        return cached;
      }
    }

    // Get the Circuit Breaker for this platform
    const breaker = getCircuitBreaker(cleanPlatform);
    let resolvedData: any = null;
    let selectedStrategy = 'primary';

    // 2. Cascading Fallback Strategy
    try {
      resolvedData = await breaker.execute(async () => {
        // A. Try Primary API
        try {
          console.log(`[FallbackManager] Attempting Primary API for ${cleanPlatform}:${username}...`);
          return await withRetry(() => provider.fetchPrimary(username), {
            retries: 2,
            timeoutMs: 10000, // 10s timeout to allow slow pages (like CodeChef) to load
          });
        } catch (primaryErr: any) {
          console.warn(`[FallbackManager] Primary API failed: ${primaryErr.message}. Cascading to Backup API...`);
          
          // B. Try Backup API
          selectedStrategy = 'backup';
          try {
            return await withRetry(() => provider.fetchBackup(username), {
              retries: 1, // Reduced retries so it doesn't take forever
              timeoutMs: 40000, // 40s to allow multiple sequential Render requests
            });
          } catch (backupErr: any) {
            console.warn(`[FallbackManager] Backup API failed: ${backupErr.message}. Cascading to Scraper...`);
            
            // C. Try Scraper Fallback
            selectedStrategy = 'scraper';
            return await withRetry(() => provider.fetchScraper(username), {
              retries: 1,
              timeoutMs: 12000,
            });
          }
        }
      });
    } catch (strategyErr: any) {
      console.error(`[FallbackManager] All live fetching failed for ${cleanPlatform}:${username}: ${strategyErr.message}`);

      // D. Try Stale Cache Fallback if all fetch options failed (stale-while-revalidate fallback)
      const staleCached = await CacheService.get<UnifiedResponse>(cacheKey);
      if (staleCached) {
        console.warn(`[FallbackManager] Serving STALE cached data for ${cleanPlatform}:${username} as ultimate fallback.`);
        return staleCached;
      }

      throw new Error(`Unable to fetch profile for ${username} on ${platform}. All APIs and scraping options failed.`);
    }

    // 3. Normalize Response
    const normalized = normalizeProfile(cleanPlatform, username, resolvedData);

    // Save success rate and strategy choice in metadata
    normalized.metadata = {
      ...normalized.metadata,
      resolutionDetails: {
        strategyUsed: selectedStrategy,
        timestamp: new Date().toISOString(),
      }
    };

    // 4. Cache successful result (cache for 10 minutes)
    await CacheService.set(cacheKey, normalized, 600);
    console.log(`[FallbackManager] Successfully resolved and cached ${cleanPlatform} profile for ${username}.`);

    return normalized;
  }
}
