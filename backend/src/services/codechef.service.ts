import * as cheerio from 'cheerio';
import { fetchWithRetry, fetchWithCache } from '../utils/api.utils';
import { IUnifiedProfile } from '../types/profile.types';

export const fetchCodeChefStats = async (username: string): Promise<IUnifiedProfile & any> => {
  return fetchWithCache(
    `platform:codechef:profile:${username.toLowerCase()}`,
    7200,
    async () => {
      try {
        const response = await fetchWithRetry(`https://www.codechef.com/users/${username}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeyxBot',
          }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const ratingStr = $('.rating-number').text().trim();
        const rating = parseInt(ratingStr) || 0;

        const starStr = $('.rating-star').text().trim();
        const stars = parseInt(starStr.replace(/[^0-9]/g, '')) || 0;

        const globalRankStr = $('.rating-ranks .inline-list li:first-child a strong').text().trim();
        const globalRank = parseInt(globalRankStr) || 0;

        return {
          username,
          platform: 'codechef',
          avatar: $('.user-profile-container img').attr('src') || '',
          rating,
          solvedProblems: 0,
          rank: globalRank || 'Unrated',
          contests: [],

          stars,
          globalRank,
        };
      } catch (error: any) {
        console.error(`CodeChef Fetch Error for ${username}:`, error.message);
        throw error;
      }
    }
  );
};
