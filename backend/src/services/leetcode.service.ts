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
        contest { title startTime }
        rating
        ranking
      }
      recentAcSubmissionList(username: $username, limit: 15) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 Codeyx/1.0',
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!response.ok) throw new Error(`LeetCode API returned ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    if (!result.data.matchedUser) throw new Error('User not found on LeetCode');

    const d = result.data;
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
    const tags = [
      ...(d.matchedUser.tagProblemCounts.advanced || []),
      ...(d.matchedUser.tagProblemCounts.intermediate || []),
      ...(d.matchedUser.tagProblemCounts.fundamental || [])
    ].sort((a: any, b: any) => b.problemsSolved - a.problemsSolved).slice(0, 6).map((t: any) => ({
       name: t.tagName,
       count: t.problemsSolved,
       pct: 'N/A' // Calculated in frontend relative to max
    }));

    // Process Submissions
    const submissions = (d.recentAcSubmissionList || []).map((s: any) => ({
       name: s.title,
       date: new Date(s.timestamp * 1000).toLocaleString(),
       diff: 'N/A', // Leetcode doesn't return diff here without another query
       status: 'Accepted',
       success: true
    }));

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
