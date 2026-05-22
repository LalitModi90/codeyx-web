import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'tourist';

  try {
    // Codeforces official API — free, no auth needed
    const [infoRes, ratingRes, statusRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${username}`),
      fetch(`https://codeforces.com/api/user.rating?handle=${username}`),
      fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=50`),
    ]);

    if (!infoRes.ok) {
      throw new Error(`Codeforces API returned ${infoRes.status}`);
    }

    const infoData = await infoRes.json();
    const ratingData = ratingRes.ok ? await ratingRes.json() : { result: [] };
    const statusData = statusRes.ok ? await statusRes.json() : { result: [] };

    if (infoData.status !== 'OK' || !infoData.result?.length) {
      throw new Error('User not found on Codeforces');
    }

    const user = infoData.result[0];
    const ratingHistory = ratingData.result || [];
    const submissions = statusData.result || [];

    // Calculate unique accepted problems
    const acceptedSet = new Set<string>();
    submissions.forEach((sub: any) => {
      if (sub.verdict === 'OK' && sub.problem) {
        acceptedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
      }
    });

    // Determine rank color mapping
    const rankColors: Record<string, string> = {
      'newbie': '#808080',
      'pupil': '#008000',
      'specialist': '#03a89e',
      'expert': '#0000ff',
      'candidate master': '#aa00aa',
      'master': '#ff8c00',
      'international master': '#ff8c00',
      'grandmaster': '#ff0000',
      'international grandmaster': '#ff0000',
      'legendary grandmaster': '#ff0000',
    };

    return NextResponse.json({
      platform: 'Codeforces',
      username: user.handle || username,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      avatar: user.titlePhoto || user.avatar || '',
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'unrated',
      maxRank: user.maxRank || 'unrated',
      rankColor: rankColors[(user.rank || '').toLowerCase()] || '#808080',
      contribution: user.contribution || 0,
      friendOfCount: user.friendOfCount || 0,
      registrationTime: user.registrationTimeSeconds || 0,
      totalSolved: acceptedSet.size,
      contestsParticipated: ratingHistory.length,
      ratingHistory: ratingHistory.slice(-20).map((r: any) => ({
        contestName: r.contestName,
        contestId: r.contestId,
        rank: r.rank,
        oldRating: r.oldRating,
        newRating: r.newRating,
        ratingChange: r.newRating - r.oldRating,
        timestamp: r.ratingUpdateTimeSeconds,
      })),
      recentSubmissions: submissions.slice(0, 10).map((s: any) => ({
        problem: `${s.problem?.contestId}${s.problem?.index} - ${s.problem?.name}`,
        verdict: s.verdict,
        language: s.programmingLanguage,
        timestamp: s.creationTimeSeconds,
      })),
    });
  } catch (error: any) {
    console.error('Codeforces API Error:', error.message);
    return NextResponse.json({
      error: 'Failed to fetch Codeforces data',
      details: error.message,
    }, { status: 500 });
  }
}
