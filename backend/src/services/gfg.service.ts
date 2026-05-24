import * as cheerio from 'cheerio';

export const fetchGFGStats = async (username: string) => {
  try {
    const response = await fetch(`https://www.geeksforgeeks.org/profile/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeyxBot',
      }
    });

    if (!response.ok) {
      throw new Error(`GFG scraping failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // GFG profile DOM structure scraping
    const codingScoreStr = $('.score_cards_container .score_card:contains("Coding Score") .score_card_value').text().trim() || '0';
    const problemsSolvedStr = $('.score_cards_container .score_card:contains("Problem Solved") .score_card_value').text().trim() || '0';

    // Difficulty breakdown
    const easy = parseInt($('.problem_solved_list_item:contains("EASY") a').text().replace(/[^0-9]/g, '')) || 0;
    const medium = parseInt($('.problem_solved_list_item:contains("MEDIUM") a').text().replace(/[^0-9]/g, '')) || 0;
    const hard = parseInt($('.problem_solved_list_item:contains("HARD") a').text().replace(/[^0-9]/g, '')) || 0;

    return {
      username,
      codingScore: parseInt(codingScoreStr),
      totalSolved: parseInt(problemsSolvedStr),
      easy,
      medium,
      hard,
    };

  } catch (error: any) {
    console.error(`GeeksforGeeks Fetch Error for ${username}:`, error.message);
    throw error;
  }
};
