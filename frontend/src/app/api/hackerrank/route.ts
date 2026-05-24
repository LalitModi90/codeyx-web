import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'lalitmodi7878065';

  try {
    // HackerRank doesn't have a public API — use the badges/profile endpoint
    const res = await fetch(`https://www.hackerrank.com/rest/hackers/${username}/badges`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    // Also fetch basic profile info
    const profileRes = await fetch(`https://www.hackerrank.com/rest/hackers/${username}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const badges = res.ok ? await res.json() : { models: [] };
    const profileData = profileRes.ok ? await profileRes.json() : { model: {} };
    const profile = profileData.model || {};

    // Extract star badges per track
    const badgeList = (badges.models || []).map((b: any) => ({
      name: b.badge_name || b.name || '',
      stars: b.stars || 0,
      category: b.category_name || b.slug || '',
    }));

    // Calculate total stars
    const totalStars = badgeList.reduce((sum: number, b: any) => sum + (b.stars || 0), 0);

    return NextResponse.json({
      platform: 'HackerRank',
      username: profile.username || username,
      name: profile.name || '',
      avatar: profile.avatar || '',
      country: profile.country || '',
      school: profile.school || '',
      totalStars,
      badges: badgeList,
      level: profile.level || 0,
      followers: profile.followers_count || 0,
      totalSolved: profile.total_solutions_submitted || 0,
    });
  } catch (error: any) {
    console.error('HackerRank API Error:', error.message);
    return NextResponse.json({
      error: 'Failed to fetch HackerRank data',
      details: error.message,
    }, { status: 500 });
  }
}
