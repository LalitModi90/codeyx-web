import * as cheerio from 'cheerio';

export const fetchCodeChefStats = async (username: string) => {
  try {
    const response = await fetch(`https://www.codechef.com/users/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodeyxBot',
      }
    });

    if (!response.ok) {
      throw new Error(`CodeChef scraping failed: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Scrape Rating
    const ratingStr = $('.rating-number').text().trim();
    const rating = parseInt(ratingStr) || 0;

    // Scrape Stars
    const starStr = $('.rating-star').text().trim();
    const stars = parseInt(starStr.replace(/[^0-9]/g, '')) || 0;

    // Scrape Global Rank
    const globalRankStr = $('.rating-ranks .inline-list li:first-child a strong').text().trim();
    const globalRank = parseInt(globalRankStr) || 0;

    return {
      rating,
      stars,
      globalRank,
      username,
    };

  } catch (error: any) {
    console.error(`CodeChef Fetch Error for ${username}:`, error.message);
    throw error;
  }
};
