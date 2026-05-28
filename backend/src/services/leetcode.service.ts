import { graphqlRequest } from '../utils/httpClient';

export const fetchLeetCodeStats = async (username: string) => {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum { difficulty count submissions }
        }
        profile { ranking reputation starRating countryName }
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
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        topPercentage
      }
      userContestRankingHistory(username: $username) {
        attended
        contest { title startTime }
        rating
        ranking
      }
      recentSubmissionList(username: $username, limit: 15) {
        title
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  try {
    const d = await graphqlRequest(
      'https://leetcode.com/graphql',
      query,
      { username }
    );
    const acStats = d.matchedUser.submitStats.acSubmissionNum;
    const contest = d.userContestRanking;
    
    // Process Line Chart Points (Rating History)
    const history = d.userContestRankingHistory || [];
    const attendedContests = history.filter((c: any) => c.attended === true || c.rating > 0);
    const linePoints = attendedContests.slice(-10).map((c: any) => ({
       label: c.contest.title,
       value: Math.round(c.rating),
       date: new Date(c.contest.startTime * 1000).toLocaleDateString()
    }));

    // Process Topics
    const advanced = (d.matchedUser.tagProblemCounts?.advanced || []).map((t: any) => ({
       name: t.tagName,
       count: t.problemsSolved,
       problemsSolved: t.problemsSolved,
       tagName: t.tagName,
       category: 'Advanced'
    }));

    const intermediate = (d.matchedUser.tagProblemCounts?.intermediate || []).map((t: any) => ({
       name: t.tagName,
       count: t.problemsSolved,
       problemsSolved: t.problemsSolved,
       tagName: t.tagName,
       category: 'Intermediate'
    }));

    const fundamental = (d.matchedUser.tagProblemCounts?.fundamental || []).map((t: any) => ({
       name: t.tagName,
       count: t.problemsSolved,
       problemsSolved: t.problemsSolved,
       tagName: t.tagName,
       category: 'Fundamental'
    }));

    const tags = [...advanced, ...intermediate, ...fundamental];

    // Process Submissions
    const submissions = (d.recentSubmissionList || []).map((s: any) => {
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

    // Process Calendar Heatmap
    let calendarObj = {};
    try {
      calendarObj = JSON.parse(d.matchedUser.userCalendar.submissionCalendar || '{}');
    } catch(e) {}

    return {
      totalSolved: acStats.find((s: any) => s.difficulty === 'All')?.count || 0,
      easy: acStats.find((s: any) => s.difficulty === 'Easy')?.count || 0,
      medium: acStats.find((s: any) => s.difficulty === 'Medium')?.count || 0,
      hard: acStats.find((s: any) => s.difficulty === 'Hard')?.count || 0,
      rating: contest ? Math.round(contest.rating) : 0,
      rank: contest ? contest.globalRanking : d.matchedUser.profile.ranking,
      reputation: d.matchedUser.profile.reputation,
      country: d.matchedUser.profile.countryName || null,
      streak: d.matchedUser.userCalendar.streak,
      calendar: calendarObj,
      linePoints,
      topics: tags,
      submissions,
      contests: attendedContests.slice(-5).reverse().map((c: any) => ({
         name: c.contest.title,
         rank: c.ranking,
         change: 'N/A', // need prev contest to calc change accurately
         date: new Date(c.contest.startTime * 1000).toLocaleDateString(),
         isPositive: true
      })),
      contestAttend: attendedContests.length,
      raw: d,
    };

  } catch (error: any) {
    console.error(`LeetCode Fetch Error for ${username}:`, error.message);
    throw error;
  }
};
