import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'tourist';

  try {
    // Kenkoooo's AtCoder community API — free, no auth needed
    const [historyRes, acceptedRes] = await Promise.all([
      fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/contest_history?user=${username}`),
      fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${username}`),
    ]);

    if (!historyRes.ok) {
      throw new Error(`AtCoder API returned ${historyRes.status}`);
    }

    const contestHistory = historyRes.ok ? await historyRes.json() : [];
    const acRankData = acceptedRes.ok ? await acceptedRes.json() : { count: 0, rank: 0 };

    // Extract current rating from the most recent contest
    const sortedHistory = Array.isArray(contestHistory)
      ? [...contestHistory].sort((a: any, b: any) => b.end_epoch_second - a.end_epoch_second)
      : [];

    const latestContest = sortedHistory[0] || {};
    const currentRating = latestContest.NewRating || 0;

    // Find max rating from history
    let maxRating = 0;
    sortedHistory.forEach((c: any) => {
      if (c.NewRating && c.NewRating > maxRating) {
        maxRating = c.NewRating;
      }
    });

    // Determine color/rank based on AtCoder rating system
    const getRankFromRating = (rating: number): { rank: string; color: string } => {
      if (rating >= 2800) return { rank: 'Red', color: '#FF0000' };
      if (rating >= 2400) return { rank: 'Orange', color: '#FF8000' };
      if (rating >= 2000) return { rank: 'Yellow', color: '#C0C000' };
      if (rating >= 1600) return { rank: 'Blue', color: '#0000FF' };
      if (rating >= 1200) return { rank: 'Cyan', color: '#00C0C0' };
      if (rating >= 800) return { rank: 'Green', color: '#008000' };
      if (rating >= 400) return { rank: 'Brown', color: '#804000' };
      return { rank: 'Gray', color: '#808080' };
    };

    const rankInfo = getRankFromRating(currentRating);

    return NextResponse.json({
      platform: 'AtCoder',
      username,
      rating: currentRating,
      maxRating,
      rank: rankInfo.rank,
      rankColor: rankInfo.color,
      totalAccepted: acRankData.count || 0,
      globalRank: acRankData.rank || 0,
      contestsParticipated: sortedHistory.length,
      ratingHistory: sortedHistory.slice(0, 20).map((c: any) => ({
        contestName: c.ContestScreenName || c.ContestName || '',
        isRated: c.IsRated || false,
        oldRating: c.OldRating || 0,
        newRating: c.NewRating || 0,
        ratingChange: (c.NewRating || 0) - (c.OldRating || 0),
        place: c.Place || 0,
        timestamp: c.EndTime || c.end_epoch_second || 0,
      })),
    });
  } catch (error: any) {
    console.error('AtCoder API Error:', error.message);
    return NextResponse.json({
      error: 'Failed to fetch AtCoder data',
      details: error.message,
    }, { status: 500 });
  }
}
