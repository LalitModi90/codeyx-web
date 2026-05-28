import { IProfileProvider } from './types';
import { axios } from '../utils/httpClient';
import * as cheerio from 'cheerio';
import { CacheService } from '../cache/redis.cache';

/**
 * Helper to fetch and cache AtCoder Problems estimated rating models to avoid
 * massive download overhead on every single sync request.
 */
async function getProblemModels(): Promise<Record<string, any>> {
  const cacheKey = 'atcoder:problem-models';
  try {
    const cached = await CacheService.get<Record<string, any>>(cacheKey);
    if (cached) return cached;
  } catch (e) {
    // Redis offline fallback
  }
  
  try {
    const res = await axios.get('https://kenkoooo.com/atcoder/resources/problem-models.json', { timeout: 15000 });
    if (res.data) {
      try {
        await CacheService.set(cacheKey, res.data, 86400); // cache for 24 hours
      } catch (e) {}
      return res.data;
    }
  } catch (err: any) {
    console.warn('[AtCoder Provider] Failed to fetch problem models:', err.message);
  }
  return {};
}

export class AtCoderProvider implements IProfileProvider {
  public readonly platformName = 'AtCoder';

  /**
   * Primary API: Kenkoooo API v3 + Direct AtCoder Rated History
   */
  async fetchPrimary(username: string): Promise<any> {
    const infoUrl = `https://kenkoooo.com/atcoder/atcoder-api/v3/user/info?user=${username}`;
    const subUrl = `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${username}`;
    const historyUrl = `https://atcoder.jp/users/${username}/history/json`;

    const [infoRes, subRes, historyRes] = await Promise.all([
      axios.get(infoUrl).catch(() => ({ data: null })),
      axios.get(subUrl).catch(() => ({ data: [] })),
      axios.get(historyUrl).catch(() => ({ data: [] })),
    ]);

    const info = infoRes.data;
    const submissions = Array.isArray(subRes.data) ? subRes.data : [];
    const history = Array.isArray(historyRes.data) ? historyRes.data : [];

    // If both Kenkoooo info and submissions are missing, throw error to trigger fallback
    if (!info && submissions.length === 0) {
      throw new Error(`User ${username} not found on AtCoder Kenkoooo API`);
    }

    // 1. Solved Problems Set
    const solvedSet = new Set<string>();
    submissions.forEach((sub: any) => {
      if (sub.result === 'AC') {
        solvedSet.add(sub.problem_id);
      }
    });

    // 2. Rating Progression & Contest Analytics
    const contestsHistory = history.map((h: any) => ({
      contestName: h.ContestNameEn || h.ContestName || 'AtCoder Contest',
      rating: Number(h.NewRating) || 0,
      rank: Number(h.Place) || 0,
      performance: Number(h.Performance) || 0,
      ratingChange: Number(h.NewRating) - Number(h.OldRating),
      date: h.EndTime ? new Date(h.EndTime).toISOString().split('T')[0] : ''
    }));

    const currentRating = contestsHistory.length > 0 ? contestsHistory[contestsHistory.length - 1].rating : 0;
    const highestRating = history.reduce((max: number, curr: any) => Math.max(max, Number(curr.NewRating) || 0), 0);

    // 3. Submission History Logs
    const mappedSubmissions = submissions.slice(0, 50).map((s: any) => ({
      name: s.problem_id,
      date: new Date(s.epoch_second * 1000).toLocaleString(),
      diff: 'N/A',
      status: s.result || 'WA',
      language: s.language || 'Unknown',
      success: s.result === 'AC',
      executionTime: s.execution_time ? `${s.execution_time}ms` : 'N/A',
      memory: s.length ? `${Math.round(s.length / 1024)}KB` : 'N/A'
    }));

    // 4. Activity Heatmap
    const heatmapObj: Record<string, number> = {};
    submissions.forEach((sub: any) => {
      if (sub.epoch_second) {
        const dateStr = new Date(sub.epoch_second * 1000).toISOString().split('T')[0];
        heatmapObj[dateStr] = (heatmapObj[dateStr] || 0) + 1;
      }
    });
    const heatmap = Object.entries(heatmapObj).map(([date, count]) => ({
      date,
      count
    }));

    // Calculate active days & streak
    const sortedDates = Object.keys(heatmapObj).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    let streak = 0;
    if (sortedDates.length > 0) {
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (sortedDates[sortedDates.length - 1] === today || sortedDates[sortedDates.length - 1] === yesterday) {
        currentStreak = 1;
        for (let i = sortedDates.length - 2; i >= 0; i--) {
          const d1 = new Date(sortedDates[i + 1]);
          const d2 = new Date(sortedDates[i]);
          const diffDays = Math.round((d1.getTime() - d2.getTime()) / 86400000);
          if (diffDays === 1) {
            currentStreak++;
          } else if (diffDays > 1) {
            break;
          }
        }
      }
      streak = currentStreak;
    }

    // 5. Language Analytics
    const languageCounts: Record<string, number> = { 'C++': 0, 'Python': 0, 'Rust': 0, 'Java': 0, 'Other': 0 };
    submissions.forEach((sub: any) => {
      const lang = (sub.language || '').toLowerCase();
      if (lang.includes('c++')) languageCounts['C++']++;
      else if (lang.includes('python')) languageCounts['Python']++;
      else if (lang.includes('rust')) languageCounts['Rust']++;
      else if (lang.includes('java')) languageCounts['Java']++;
      else languageCounts['Other']++;
    });

    const languages = Object.entries(languageCounts)
      .filter(([_, count]) => count > 0)
      .map(([language, count]) => ({
        language,
        count
      }));

    // 6. Accuracy Analytics
    const totalSubmissions = submissions.length;
    const acSubmissions = submissions.filter((s: any) => s.result === 'AC').length;
    const accuracy = totalSubmissions > 0 ? parseFloat(((acSubmissions / totalSubmissions) * 100).toFixed(2)) : 0.0;

    // 7. Topic Mastery based on Estimated Rating
    const topicsObj: Record<string, { subject: string; solved: number; category: string }> = {};
    const problemModels = await getProblemModels();
    submissions.forEach((sub: any) => {
      if (sub.result === 'AC') {
        const model = problemModels[sub.problem_id] || {};
        const diff = model.difficulty || 0;
        let category = 'Fundamental';
        let subject = 'Basic Coding';
        
        if (diff >= 1600) {
          category = 'Advanced';
          subject = 'Advanced DSA';
        } else if (diff >= 800) {
          category = 'Intermediate';
          subject = 'Intermediate Algorithms';
        } else {
          category = 'Fundamental';
          subject = 'Fundamentals';
        }
        
        const contestPrefix = String(sub.problem_id).substring(0, 3).toUpperCase();
        const finalSubject = ['ABC', 'ARC', 'AGC'].includes(contestPrefix) ? `${contestPrefix} Challenges` : subject;
        
        if (!topicsObj[finalSubject]) {
          topicsObj[finalSubject] = { subject: finalSubject, solved: 0, category };
        }
        topicsObj[finalSubject].solved++;
      }
    });
    const topics = Object.values(topicsObj);

    return {
      username: info?.user_id || username,
      followers: 0,
      solved: solvedSet.size,
      rating: currentRating,
      rank: info?.accepted_count_rank ? `Global Rank: ${info.accepted_count_rank}` : 'Member',
      stars: 0,
      contests: contestsHistory.length,
      metadata: {
        highestRating,
        streak,
        topics,
        submissions: mappedSubmissions,
        languages,
        extra: {
          contests: contestsHistory,
          heatmap,
          languages,
          accuracy,
          totalSubmissions,
          acSubmissions,
          easy: submissions.filter((s: any) => s.result === 'AC' && (problemModels[s.problem_id]?.difficulty || 0) < 800).length,
          medium: submissions.filter((s: any) => s.result === 'AC' && (problemModels[s.problem_id]?.difficulty || 0) >= 800 && (problemModels[s.problem_id]?.difficulty || 0) < 1600).length,
          hard: submissions.filter((s: any) => s.result === 'AC' && (problemModels[s.problem_id]?.difficulty || 0) >= 1600).length,
        }
      }
    };
  }

  /**
   * Backup/Scraper: Direct HTML Scraping
   */
  async fetchBackup(username: string): Promise<any> {
    return this.fetchScraper(username);
  }

  /**
   * Scraper: Direct HTML parsing using cheerio
   */
  async fetchScraper(username: string): Promise<any> {
    const url = `https://atcoder.jp/users/${username}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    let rating = 0;
    let highestRating = 0;
    let rank = 'Member';
    let contests = 0;

    $('table.dl-table, table.table-default').find('tr').each((_, el) => {
      const label = $(el).find('th').text().trim().toLowerCase();
      const value = $(el).find('td').text().trim();
      
      if (label.includes('rating')) {
        const num = parseInt(value.replace(/[^0-9]/g, '')) || 0;
        rating = num;
      }
      if (label.includes('highest rating') || label.includes('highest')) {
        highestRating = parseInt(value.replace(/[^0-9]/g, '')) || highestRating;
      }
      if (label.includes('rank')) {
        rank = value;
      }
      if (label.includes('rated matches') || label.includes('matches') || label.includes('contests')) {
        contests = parseInt(value.replace(/[^0-9]/g, '')) || 0;
      }
    });

    const coloredRating = $('span.user-red, span.user-orange, span.user-yellow, span.user-blue, span.user-cyan, span.user-green, span.user-brown, span.user-gray').first().text().trim();
    if (coloredRating && /^\d+$/.test(coloredRating)) {
      rating = parseInt(coloredRating) || rating;
    }

    return {
      username,
      followers: 0,
      solved: 0,
      rating,
      rank,
      stars: 0,
      contests,
      metadata: {
        highestRating: highestRating || rating,
        streak: 0,
        topics: [],
        submissions: [],
        languages: [],
        extra: {
          scraped: true,
          heatmap: [],
          languages: [],
        }
      }
    };
  }
}
