import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'mTQb0YqjQb';

  try {
    // Use LeetCode's public GraphQL endpoint directly
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            aboutMe
            userAvatar
            reputation
            ranking
            starRating
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          userCalendar {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
          badges {
            name
            icon
          }
        }
      }
    `;

    let res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!res.ok) {
      throw new Error(`LeetCode API returned ${res.status}`);
    }

    let data = await res.json();
    let user = data?.data?.matchedUser;

    if (!user && username !== username.toLowerCase()) {
      res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
        },
        body: JSON.stringify({ query, variables: { username: username.toLowerCase() } }),
      });
      data = await res.json();
      user = data?.data?.matchedUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stats = user.submitStatsGlobal?.acSubmissionNum || [];
    const easy = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const medium = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hard = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;
    const total = stats.find((s: any) => s.difficulty === 'All')?.count || 0;

    return NextResponse.json({
      platform: 'LeetCode',
      username: user.username,
      realName: user.profile?.realName || '',
      avatar: user.profile?.userAvatar || '',
      ranking: user.profile?.ranking || 0,
      reputation: user.profile?.reputation || 0,
      totalSolved: total,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      streak: user.userCalendar?.streak || 0,
      totalActiveDays: user.userCalendar?.totalActiveDays || 0,
      submissionCalendar: user.userCalendar?.submissionCalendar || '{}',
      badges: user.badges || [],
    });
  } catch (error: any) {
    console.error('LeetCode API Error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch LeetCode data',
      details: error.message 
    }, { status: 500 });
  }
}
