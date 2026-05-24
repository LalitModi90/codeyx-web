import * as cheerio from 'cheerio';
import { fetchWithRetry, fetchWithCache } from '../utils/api.utils';
import { IUnifiedProfile } from '../types/profile.types';

export const fetchGFGStats = async (username: string): Promise<IUnifiedProfile & any> => {
  return fetchWithCache(
    `platform:gfg:profile:${username.toLowerCase()}`,
    7200,
    async () => {
      try {
        const response = await fetchWithRetry(`https://www.geeksforgeeks.org/profile/${username}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeyxBot',
          }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const codingScoreStr = $('.score_cards_container .score_card:contains("Coding Score") .score_card_value').text().trim() || '0';
        const problemsSolvedStr = $('.score_cards_container .score_card:contains("Problem Solved") .score_card_value').text().trim() || '0';

        const easy = parseInt($('.problem_solved_list_item:contains("EASY") a').text().replace(/[^0-9]/g, '')) || 0;
        const medium = parseInt($('.problem_solved_list_item:contains("MEDIUM") a').text().replace(/[^0-9]/g, '')) || 0;
        const hard = parseInt($('.problem_solved_list_item:contains("HARD") a').text().replace(/[^0-9]/g, '')) || 0;

        const totalSolved = parseInt(problemsSolvedStr) || 0;
        const codingScore = parseInt(codingScoreStr) || 0;

        return {
          username,
          platform: 'gfg',
          avatar: $('.profile_pic img').attr('src') || '',
          rating: codingScore,
          solvedProblems: totalSolved,
          rank: 'Unrated',
          contests: [],

          // Legacy
          codingScore,
          totalSolved,
          easy,
          medium,
          hard,
        };
      } catch (error: any) {
        console.error(`GeeksforGeeks Fetch Error for ${username}:`, error.message);
        throw error;
      }
    }
  );
};
