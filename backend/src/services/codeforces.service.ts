import { fetchWithRetry, fetchWithCache } from '../utils/api.utils';
import { IUnifiedProfile } from '../types/profile.types';

export const fetchCodeforcesStats = async (username: string): Promise<IUnifiedProfile & any> => {
  return fetchWithCache(
    `platform:codeforces:profile:${username.toLowerCase()}`,
    7200, // 2 hours
    async () => {
      try {
        const response = await fetchWithRetry(`https://codeforces.com/api/user.info?handles=${username}`);
        const result = await response.json();

        if (result.status !== 'OK') {
          throw new Error(result.comment || 'Codeforces API Error');
        }

        const user = result.result[0];

        return {
          // Unified
          username: user.handle,
          platform: 'codeforces',
          avatar: user.titlePhoto || user.avatar || '',
          rating: user.rating || 0,
          solvedProblems: 0,
          rank: user.rank || 'Unrated',
          contests: [],

          // Legacy
          rating_legacy: user.rating || 0,
          maxRating: user.maxRating || 0,
          rank_legacy: user.rank || 'Unrated',
          totalSolved: 0,
          raw: user,
        };
      } catch (error: any) {
        console.error(`Codeforces Fetch Error for ${username}:`, error.message);
        throw error;
      }
    }
  );
};
