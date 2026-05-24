import { fetchWithRetry, fetchWithCache } from '../utils/api.utils';
import { IUnifiedProfile } from '../types/profile.types';

export const fetchHackerRankStats = async (username: string): Promise<IUnifiedProfile & any> => {
  return fetchWithCache(
    `platform:hackerrank:profile:${username.toLowerCase()}`,
    7200,
    async () => {
      try {
        const response = await fetchWithRetry(`https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`, {
          headers: {
            'User-Agent': 'Codeyx-Analytics/1.0',
          }
        });

        const data = await response.json();
        if (!data.model) {
          throw new Error('HackerRank profile not found');
        }
        const profile = data.model;

        const badgesResponse = await fetchWithRetry(`https://www.hackerrank.com/rest/contests/master/hackers/${username}/badges`);
        let totalBadges = 0;
        if (badgesResponse.ok) {
          const badgesData = await badgesResponse.json();
          totalBadges = badgesData.models ? badgesData.models.length : 0;
        }

        return {
          username: profile.username,
          platform: 'hackerrank',
          avatar: profile.avatar || '',
          rating: profile.level * 100 || 0, // Mock rating
          solvedProblems: totalBadges * 10, // Mock solved
          rank: profile.level || 'Unrated',
          contests: [],

          // Legacy
          country: profile.country,
          level: profile.level,
          followers: profile.followers_count,
          totalBadges,
          raw: profile,
        };
      } catch (error: any) {
        console.error(`HackerRank Fetch Error for ${username}:`, error.message);
        throw error;
      }
    }
  );
};
