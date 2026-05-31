import * as cheerio from 'cheerio';

export const fetchGFGStats = async (username: string) => {
  // Strategy 1: Direct Cheerio Scraper (Primary)
  try {
    console.log(`[GFG Sync] Trying Strategy 1 (Direct Scraper) for ${username}...`);
    const response = await fetch(`https://www.geeksforgeeks.org/profile/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeyxBot',
      }
    });

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);

      const codingScoreStr = $('.score_cards_container .score_card:contains("Coding Score") .score_card_value').text().trim() || '0';
      const problemsSolvedStr = $('.score_cards_container .score_card:contains("Problem Solved") .score_card_value').text().trim() || '0';
      const instituteRankStr = $('.score_cards_container .score_card:contains("Institute Rank") .score_card_value').text().trim() || '0';

      const easy = parseInt($('.problem_solved_list_item:contains("EASY") a').text().replace(/[^0-9]/g, '')) || 0;
      const medium = parseInt($('.problem_solved_list_item:contains("MEDIUM") a').text().replace(/[^0-9]/g, '')) || 0;
      const hard = parseInt($('.problem_solved_list_item:contains("HARD") a').text().replace(/[^0-9]/g, '')) || 0;
      const basic = parseInt($('.problem_solved_list_item:contains("BASIC") a').text().replace(/[^0-9]/g, '')) || 0;
      const school = parseInt($('.problem_solved_list_item:contains("SCHOOL") a').text().replace(/[^0-9]/g, '')) || 0;

      const totalSolved = parseInt(problemsSolvedStr);

      if (totalSolved > 0) {
        return {
          username,
          codingScore: parseInt(codingScoreStr) || 0,
          totalSolved,
          easy,
          medium,
          hard,
          basic,
          school,
          instituteRank: parseInt(instituteRankStr) || 0,
        };
      }
    }
  } catch (error: any) {
    console.warn(`[GFG Sync] Strategy 1 (Direct Scraper) failed:`, error.message);
  }

  // Strategy 2: Fallback API 1 (napiyo GFG API)
  try {
    console.log(`[GFG Sync] Trying Strategy 2 (napiyo GFG API) for ${username}...`);
    const response = await fetch(`https://geeks-for-geeks-stats-api.vercel.app/?raw=y&userName=${username}`);
    if (response.ok) {
      const data = await response.json();
      const info = data.info || {};
      const solved = data.solvedStats || {};

      const codingScore = info.codingScore || data.codingScore || 0;
      const totalSolved = info.totalProblemsSolved || data.totalProblemsSolved || data.totalSolved || 0;

      const easy = solved.easy?.count || solved.easy || data.easy || 0;
      const medium = solved.medium?.count || solved.medium || data.medium || 0;
      const hard = solved.hard?.count || solved.hard || data.hard || 0;
      const basic = solved.basic?.count || solved.basic || data.basic || 0;
      const school = solved.school?.count || solved.school || data.school || 0;
      const instituteRank = info.instituteRank || data.instituteRank || 0;

      if (Number(totalSolved) > 0) {
        return {
          username,
          codingScore: Number(codingScore),
          totalSolved: Number(totalSolved),
          easy: Number(easy),
          medium: Number(medium),
          hard: Number(hard),
          basic: Number(basic),
          school: Number(school),
          instituteRank: Number(instituteRank) || 0,
        };
      }
    }
  } catch (error: any) {
    console.warn(`[GFG Sync] Strategy 2 (napiyo GFG API) failed:`, error.message);
  }

  // Strategy 3: Fallback API 2 (nikhilpal GFG API)
  try {
    console.log(`[GFG Sync] Trying Strategy 3 (nikhilpal GFG API) for ${username}...`);
    const response = await fetch(`https://gfgstatscard.vercel.app/${username}?raw=true`);
    if (response.ok) {
      const data = await response.json();

      const codingScore = data.total_score || data.codingScore || data.score || 0;
      const totalSolved = data.total_problems_solved || data.totalProblemsSolved || data.totalSolved || data.solved || 0;

      const easy = data.Easy || data.easy || 0;
      const medium = data.Medium || data.medium || 0;
      const hard = data.Hard || data.hard || 0;
      const basic = data.Basic || data.basic || 0;
      const school = data.School || data.school || 0;

      // Gracefully scrape instituteRank dynamically in the background to ensure it is never #0
      let instituteRank = 0;
      try {
        const scrapeRes = await fetch(`https://www.geeksforgeeks.org/profile/${username}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeyxBot' }
        });
        if (scrapeRes.ok) {
          const html = await scrapeRes.text();
          const $ = cheerio.load(html);
          const rankStr = $('.score_cards_container .score_card:contains("Institute Rank") .score_card_value').text().trim();
          if (rankStr) {
            instituteRank = parseInt(rankStr) || 0;
          }
        }
      } catch (err: any) {
        console.warn(`[GFG Sync] Dynamic rank scrape failed in Strategy 3:`, err.message);
      }

      if (Number(totalSolved) > 0) {
        return {
          username,
          codingScore: Number(codingScore),
          totalSolved: Number(totalSolved),
          easy: Number(easy),
          medium: Number(medium),
          hard: Number(hard),
          basic: Number(basic),
          school: Number(school),
          instituteRank,
        };
      }
    }
  } catch (error: any) {
    console.warn(`[GFG Sync] Strategy 3 (nikhilpal GFG API) failed:`, error.message);
  }

  throw new Error(`[GFG Sync] All 3 fetching strategies failed for ${username}. GFG profile might be private or invalid.`);
};
