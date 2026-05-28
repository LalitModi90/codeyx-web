import { IProfileProvider } from './types';
import { axios, graphqlRequest } from '../utils/httpClient';
import * as cheerio from 'cheerio';

export class LeetCodeProvider implements IProfileProvider {
  public readonly platformName = 'LeetCode';

  /**
   * Primary GraphQL API
   */
  async fetchPrimary(username: string): Promise<any> {
    const url = 'https://leetcode.com/graphql';
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
          profile { 
            ranking 
            reputation
            userAvatar
          }
          badges {
            displayName
          }
          tagProblemCounts {
            advanced { tagName problemsSolved }
            intermediate { tagName problemsSolved }
            fundamental { tagName problemsSolved }
          }
          userCalendar {
            submissionCalendar
            activeYears
            streak
            totalActiveDays
          }
          languageList {
            languageName
            problemsSolved
          }
        }
        userContestRanking(username: $username) {
          rating
          globalRanking
          topPercentage
        }
        userContestRankingHistory(username: $username) {
          attended
          rating
          ranking
          contest {
            title
            startTime
          }
        }
        recentSubmissionList(username: $username, limit: 15) {
          title
          timestamp
          statusDisplay
          lang
        }
      }
    `;

    const data = await graphqlRequest(url, query, { username });
    if (!data.matchedUser) throw new Error('User not found on LeetCode GraphQL');

    const acStats = data.matchedUser.submitStats.acSubmissionNum || [];
    const solved = acStats.find((s: any) => s.difficulty === 'All')?.count || 0;
    const rating = Math.round(data.userContestRanking?.rating || 0);

    const history = (data.userContestRankingHistory || [])
      .filter((h: any) => h.attended)
      .map((h: any) => ({
        contestName: h.contest?.title || 'Unknown Contest',
        rating: Math.round(h.rating || 0),
        rank: h.ranking || 0,
        ratingChange: 0
      }));

    const streak = data.matchedUser.userCalendar?.streak || 0;
    const badges = data.matchedUser.badges?.map((b: any) => b.displayName) || [];

    const advanced = (data.matchedUser.tagProblemCounts?.advanced || []).map((t: any) => ({
      tagName: t.tagName,
      problemsSolved: t.problemsSolved,
      count: t.problemsSolved,
      name: t.tagName,
      category: 'Advanced'
    }));

    const intermediate = (data.matchedUser.tagProblemCounts?.intermediate || []).map((t: any) => ({
      tagName: t.tagName,
      problemsSolved: t.problemsSolved,
      count: t.problemsSolved,
      name: t.tagName,
      category: 'Intermediate'
    }));

    const fundamental = (data.matchedUser.tagProblemCounts?.fundamental || []).map((t: any) => ({
      tagName: t.tagName,
      problemsSolved: t.problemsSolved,
      count: t.problemsSolved,
      name: t.tagName,
      category: 'Fundamental'
    }));

    const topics = [...advanced, ...intermediate, ...fundamental];

    const submissions = (data.recentSubmissionList || []).map((s: any) => {
      const displayLang = s.lang ? (s.lang.charAt(0).toUpperCase() + s.lang.slice(1)) : 'Java';
      return {
        name: s.title,
        date: new Date(s.timestamp * 1000).toLocaleString(),
        diff: 'N/A',
        status: s.statusDisplay || 'Accepted',
        language: displayLang,
        success: s.statusDisplay === 'Accepted'
      };
    });

    let heatmap: any[] = [];
    try {
      const calendarStr = data.matchedUser.userCalendar?.submissionCalendar || '{}';
      const calendarObj = JSON.parse(calendarStr);
      heatmap = Object.entries(calendarObj).map(([timestamp, count]) => ({
        date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
        count: Number(count) || 0
      }));
    } catch (e: any) {
      console.warn('[LeetCode Primary Heatmap Parsing Error]', e.message);
    }

    const languages = (data.matchedUser.languageList || []).map((l: any) => ({
      language: l.languageName,
      count: l.problemsSolved
    }));

    return {
      username: data.matchedUser.username || username,
      followers: 0,
      solved,
      rating,
      rank: data.matchedUser.profile?.ranking ? `Global Rank: ${data.matchedUser.profile.ranking}` : 'Coder',
      stars: 0,
      contests: history.length,
      avatar: data.matchedUser.profile?.userAvatar || '',
      metadata: {
        contests: history,
        reputation: data.matchedUser.profile?.reputation || 0,
        badges,
        topics,
        submissions,
        languages,
        streak,
        extra: {
          easy: acStats.find((s: any) => s.difficulty === 'Easy')?.count || 0,
          medium: acStats.find((s: any) => s.difficulty === 'Medium')?.count || 0,
          hard: acStats.find((s: any) => s.difficulty === 'Hard')?.count || 0,
          topPercentage: data.userContestRanking?.topPercentage || 0,
          globalRanking: data.userContestRanking?.globalRanking || 0,
          avatar: data.matchedUser.profile?.userAvatar || '',
          heatmap,
          languages,
        }
      }
    };
  }

  /**
   * Backup REST API (alfa-leetcode-api)
   */
  /**
   * Backup REST API (alfa-leetcode-api with high-speed Vercel mirror cascade)
   */
  async fetchBackup(username: string): Promise<any> {
    const mirrors = [
      `https://leetcode-api-faisal.vercel.app/${username}`,
      `https://leetcode-stats-api.herokuapp.com/${username}`,
      `https://alfa-leetcode-api.onrender.com/${username}`
    ];

    let user: any = null;
    let successMirror = '';

    for (const url of mirrors) {
      try {
        console.log(`[LeetCode Backup] Querying mirror: ${url}...`);
        const response = await axios.get(url, { timeout: 6000 });
        if (response.data && !response.data.errors && !response.data.error && response.data.status !== 'error') {
          user = response.data;
          successMirror = url;
          break;
        }
      } catch (err: any) {
        console.warn(`[LeetCode Mirror Failed] ${url}: ${err.message}`);
      }
    }

    if (!user) {
      throw new Error('User data fetching failed on all LeetCode Backup API mirrors');
    }

    // Standardize data from different mirrors
    const solved = user.totalSolved || user.solved || 0;
    const easy = user.easySolved || user.easy || 0;
    const medium = user.mediumSolved || user.medium || 0;
    const hard = user.hardSolved || user.hard || 0;
    const ranking = user.ranking || user.globalRanking || 0;
    const reputation = user.reputation || user.contributionPoints || 0;
    const rating = Math.round(user.contestRating || 0);

    let topics: any[] = [];
    if (successMirror.includes('onrender.com')) {
      try {
        const skillUrl = `https://alfa-leetcode-api.onrender.com/${username}/skill`;
        const skillRes = await axios.get(skillUrl, { timeout: 5000 });
        const tagProblemCounts = skillRes.data?.tagProblemCounts || skillRes.data?.data?.tagProblemCounts;
        if (tagProblemCounts) {
          const advanced = (tagProblemCounts.advanced || []).map((t: any) => ({
            tagName: t.tagName,
            problemsSolved: t.problemsSolved,
            count: t.problemsSolved,
            name: t.tagName,
            category: 'Advanced'
          }));
          const intermediate = (tagProblemCounts.intermediate || []).map((t: any) => ({
            tagName: t.tagName,
            problemsSolved: t.problemsSolved,
            count: t.problemsSolved,
            name: t.tagName,
            category: 'Intermediate'
          }));
          const fundamental = (tagProblemCounts.fundamental || []).map((t: any) => ({
            tagName: t.tagName,
            problemsSolved: t.problemsSolved,
            count: t.problemsSolved,
            name: t.tagName,
            category: 'Fundamental'
          }));
          topics = [...advanced, ...intermediate, ...fundamental];
        }
      } catch (err: any) {
        console.warn('[LeetCode Backup Skills Error]', err.message);
      }
    }

    let submissions: any[] = [];
    if (successMirror.includes('onrender.com')) {
      try {
        const subUrl = `https://alfa-leetcode-api.onrender.com/${username}/submission?limit=15`;
        const subRes = await axios.get(subUrl, { timeout: 5000 });
        const subList = subRes.data?.submission || subRes.data?.data?.submission || [];
        submissions = subList.map((s: any) => ({
          name: s.title,
          date: s.timestamp ? new Date(parseInt(s.timestamp) * 1000).toLocaleString() : 'Just now',
          diff: 'N/A',
          status: s.statusDisplay || 'Accepted',
          language: s.lang ? (s.lang.charAt(0).toUpperCase() + s.lang.slice(1)) : 'Java',
          success: s.statusDisplay === 'Accepted'
        }));
      } catch (err: any) {
        console.warn('[LeetCode Backup Submissions Error]', err.message);
      }
    }

    let heatmap: any[] = [];
    let languages: any[] = [];
    let streak = user.streak || 0;

    const calData = user.submissionCalendar || {};
    if (calData && typeof calData === 'object') {
      try {
        heatmap = Object.entries(calData).map(([timestamp, count]) => ({
          date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
          count: Number(count) || 0
        }));
      } catch (e: any) {
        console.warn('[LeetCode Mirror Heatmap Parsing Error]', e.message);
      }
    }

    let contestHistory: any[] = [];
    try {
      const contestUrl = successMirror.includes('onrender.com') 
        ? `https://alfa-leetcode-api.onrender.com/${username}/contest`
        : `https://leetcode-api-faisal.vercel.app/${username}/contest`;
        
      console.log(`[LeetCode Backup] Fetching contest history from ${contestUrl}...`);
      const contestRes = await axios.get(contestUrl, { timeout: 6000 });
      const contestData = contestRes.data || {};
      const participation = contestData.contestParticipation || contestData.data?.contestParticipation || [];
      
      contestHistory = participation
        .filter((h: any) => h.attended)
        .map((h: any) => ({
          contestName: h.contest?.title || 'Weekly Contest',
          rating: Math.round(h.rating || 0),
          rank: h.ranking || 0,
          ratingChange: 0
        }));
    } catch (err: any) {
      console.warn('[LeetCode Backup Contest Error]', err.message);
    }

    return {
      username,
      followers: 0,
      solved,
      rating,
      rank: ranking ? `Global Rank: ${ranking}` : 'Coder',
      stars: 0,
      contests: user.contestAttend || contestHistory.length || 0,
      avatar: user.avatar || '',
      metadata: {
        contests: contestHistory,
        badges: user.badges?.map((b: any) => b.displayName) || [],
        streak,
        topics,
        submissions,
        languages,
        reputation,
        extra: {
          easy,
          medium,
          hard,
          globalRanking: ranking,
          avatar: user.avatar || '',
          heatmap,
          languages,
        }
      }
    };
  }

  /**
   * Scraper Fallback
   */
  async fetchScraper(username: string): Promise<any> {
    const url = `https://leetcode.com/u/${username}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 12000
    });

    const $ = cheerio.load(response.data);
    
    // Extract solved problems count
    const solvedText = $('span.text-2xl.font-medium.text-label-1, div.text-2xl.font-medium.text-label-1, [class*="total-solved"]').first().text().trim();
    const solved = parseInt(solvedText.replace(/[^0-9]/g, '')) || 0;

    // Parse Global Rank
    const rankText = $('span.text-label-1.font-medium, div.text-label-1.font-medium, [class*="global-rank"]').first().text().replace(/[^0-9]/g, '').trim();
    const rank = parseInt(rankText) || 0;

    return {
      username,
      followers: 0,
      solved,
      rating: 0,
      rank: rank ? `Global Rank: ${rank}` : 'LeetCoder',
      stars: 0,
      contests: 0,
      metadata: {
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
