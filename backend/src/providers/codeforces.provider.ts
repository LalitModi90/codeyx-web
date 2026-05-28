import { IProfileProvider } from './types';
import { axios } from '../utils/httpClient';
import * as cheerio from 'cheerio';

function getNextRankDetails(rating: number): { nextRank: string; nextMilestone: number } {
  if (rating < 1200) return { nextRank: 'Pupil', nextMilestone: 1200 };
  if (rating < 1400) return { nextRank: 'Specialist', nextMilestone: 1400 };
  if (rating < 1600) return { nextRank: 'Expert', nextMilestone: 1600 };
  if (rating < 1900) return { nextRank: 'Candidate Master', nextMilestone: 1900 };
  if (rating < 2100) return { nextRank: 'Master', nextMilestone: 2100 };
  if (rating < 2300) return { nextRank: 'International Master', nextMilestone: 2300 };
  if (rating < 2400) return { nextRank: 'Grandmaster', nextMilestone: 2400 };
  if (rating < 2600) return { nextRank: 'International Grandmaster', nextMilestone: 2600 };
  if (rating < 3000) return { nextRank: 'Legendary Grandmaster', nextMilestone: 3000 };
  return { nextRank: 'Legendary Grandmaster', nextMilestone: 4000 };
}

export class CodeforcesProvider implements IProfileProvider {
  public readonly platformName = 'Codeforces';

  /**
   * Primary API: user.info + user.rating + user.status
   */
  async fetchPrimary(username: string): Promise<any> {
    const infoUrl = `https://codeforces.com/api/user.info?handles=${username}`;
    const ratingUrl = `https://codeforces.com/api/user.rating?handle=${username}`;
    const statusUrl = `https://codeforces.com/api/user.status?handle=${username}`;

    const [infoRes, ratingRes, statusRes] = await Promise.all([
      axios.get(infoUrl),
      axios.get(ratingUrl).catch(() => ({ data: { status: 'FAILED', result: [] } })),
      axios.get(statusUrl).catch(() => ({ data: { status: 'FAILED', result: [] } })),
    ]);

    if (infoRes.data.status !== 'OK') {
      throw new Error(`Codeforces API returned status ${infoRes.data.status}`);
    }

    const user = infoRes.data.result[0];
    if (!user) throw new Error('User not found on Codeforces API');

    // 1. Filter unique accepted problems solved from status submission logs
    const solvedSet = new Set<string>();
    const submissions = statusRes.data.status === 'OK' ? statusRes.data.result : [];
    
    // 2. Submission History Logs (last 50)
    const mappedSubmissions = submissions.slice(0, 50).map((s: any) => ({
      name: s.problem ? `${s.problem.contestId}-${s.problem.index}: ${s.problem.name}` : 'N/A',
      date: s.creationTimeSeconds ? new Date(s.creationTimeSeconds * 1000).toLocaleString() : 'N/A',
      diff: s.problem?.rating ? String(s.problem.rating) : 'N/A',
      status: s.verdict === 'OK' ? 'Accepted' : (s.verdict || 'WA'),
      language: s.programmingLanguage || 'Unknown',
      success: s.verdict === 'OK',
      executionTime: s.timeConsumedMillis ? `${s.timeConsumedMillis}ms` : 'N/A',
      memory: s.memoryConsumedBytes ? `${Math.round(s.memoryConsumedBytes / 1024)}KB` : 'N/A',
      tags: s.problem?.tags || []
    }));

    submissions.forEach((sub: any) => {
      if (sub.verdict === 'OK' && sub.problem) {
        solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
      }
    });

    const ratingList = ratingRes.data.status === 'OK' ? ratingRes.data.result : [];

    // 3. Contest History and Rating Progression
    const contestsHistory = ratingList.map((c: any) => ({
      contestName: c.contestName || 'Codeforces Contest',
      rating: Number(c.newRating) || 0,
      rank: Number(c.rank) || 0,
      performance: Number(c.newRating) + 100, // Codeforces performance proxy
      ratingChange: Number(c.newRating) - Number(c.oldRating),
      date: c.ratingUpdateTimeSeconds ? new Date(c.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0] : ''
    }));

    // 4. Activity Heatmap
    const heatmapObj: Record<string, number> = {};
    submissions.forEach((sub: any) => {
      if (sub.creationTimeSeconds) {
        const dateStr = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
        heatmapObj[dateStr] = (heatmapObj[dateStr] || 0) + 1;
      }
    });
    const heatmap = Object.entries(heatmapObj).map(([date, count]) => ({
      date,
      count
    }));

    // Calculate active continuous streak
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

    // 5. Language Analytics (GNU C++, Python, Java, Kotlin)
    const languageCounts: Record<string, number> = { 'GNU C++': 0, 'Python': 0, 'Java': 0, 'Kotlin': 0, 'Other': 0 };
    submissions.forEach((sub: any) => {
      const lang = (sub.programmingLanguage || '').toLowerCase();
      if (lang.includes('c++') || lang.includes('g++')) languageCounts['GNU C++']++;
      else if (lang.includes('python') || lang.includes('pypy')) languageCounts['Python']++;
      else if (lang.includes('java')) languageCounts['Java']++;
      else if (lang.includes('kotlin')) languageCounts['Kotlin']++;
      else languageCounts['Other']++;
    });
    const languages = Object.entries(languageCounts)
      .filter(([_, count]) => count > 0)
      .map(([language, count]) => ({
        language,
        count
      }));

    // 6. Problem Tags Mastery (Greedy, DP, Graph, Binary Search, Math, Trees)
    const tagCounts: Record<string, number> = { 'Greedy': 0, 'DP': 0, 'Graph': 0, 'Binary Search': 0, 'Math': 0, 'Trees': 0 };
    submissions.forEach((sub: any) => {
      if (sub.verdict === 'OK' && sub.problem && Array.isArray(sub.problem.tags)) {
        sub.problem.tags.forEach((tag: string) => {
          const t = tag.toLowerCase();
          if (t.includes('greedy')) tagCounts['Greedy']++;
          else if (t.includes('dp') || t.includes('dynamic programming')) tagCounts['DP']++;
          else if (t.includes('graph') || t.includes('dfs') || t.includes('bfs') || t.includes('shortest paths')) tagCounts['Graph']++;
          else if (t.includes('binary search')) tagCounts['Binary Search']++;
          else if (t.includes('math') || t.includes('number theory')) tagCounts['Math']++;
          else if (t.includes('trees') || t.includes('tree')) tagCounts['Trees']++;
        });
      }
    });
    const tags = Object.entries(tagCounts).map(([subject, solved]) => ({
      subject,
      solved,
      category: solved >= 15 ? 'Advanced' : solved >= 5 ? 'Intermediate' : 'Fundamental'
    }));

    // 7. Rank Progression details
    const currentRating = user.rating || 0;
    const { nextRank, nextMilestone } = getNextRankDetails(currentRating);

    return {
      username: user.handle,
      followers: user.friendOfCount || 0,
      solved: solvedSet.size,
      rating: currentRating,
      rank: user.rank || 'Unrated',
      stars: 0,
      contests: ratingList.length,
      avatar: user.avatar || user.titlePhoto || '',
      metadata: {
        highestRating: user.maxRating || 0,
        streak,
        topics: tags,
        submissions: mappedSubmissions,
        languages,
        extra: {
          maxRank: user.maxRank || 'Unrated',
          organization: user.organization || null,
          contribution: user.contribution || 0,
          friendCount: user.friendOfCount || 0,
          contests: contestsHistory,
          heatmap,
          languages,
          rankProgression: {
            currentRank: user.rank || 'Unrated',
            nextRank,
            nextMilestone,
            maxRating: user.maxRating || 0,
            maxRank: user.maxRank || 'Unrated'
          }
        }
      }
    };
  }

  /**
   * Backup API
   */
  async fetchBackup(username: string): Promise<any> {
    return this.fetchPrimary(username);
  }

  /**
   * Scraper Fallback
   */
  async fetchScraper(username: string): Promise<any> {
    const url = `https://codeforces.com/profile/${username}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // Scrape Rating & Rank
    const infoCard = $('.info');
    const rank = infoCard.find('.user-rank').text().trim() || 'Unrated';
    
    const ratingText = infoCard.find('span[style*="font-weight: bold;"]').first().text().trim();
    const rating = parseInt(ratingText) || 0;

    // Scrape solved count
    const solvedText = $('div._UserActivityFrame_footer').find('h3').first().text().replace(/[^0-9]/g, '').trim();
    const solved = parseInt(solvedText) || 0;

    const { nextRank, nextMilestone } = getNextRankDetails(rating);

    return {
      username,
      followers: 0,
      solved,
      rating,
      rank,
      stars: 0,
      contests: 0,
      metadata: {
        highestRating: rating,
        streak: 0,
        topics: [],
        submissions: [],
        languages: [],
        extra: {
          scraped: true,
          contests: [],
          heatmap: [],
          languages: [],
          rankProgression: {
            currentRank: rank,
            nextRank,
            nextMilestone,
            maxRating: rating,
            maxRank: rank
          }
        }
      }
    };
  }
}
