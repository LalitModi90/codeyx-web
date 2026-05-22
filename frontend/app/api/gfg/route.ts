import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'lalitmodiog7e';

  try {
    // Use GFG profile scraping API (free)
    const res = await fetch(`https://geeks-for-geeks-stats-api.vercel.app/?userName=${username}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`GFG API returned ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      platform: 'GeeksforGeeks',
      username: username,
      totalProblemsSolved: data.totalProblemsSolved || 0,
      school: data.School || 0,
      basic: data.Basic || 0,
      easy: data.Easy || 0,
      medium: data.Medium || 0,
      hard: data.Hard || 0,
      codingScore: data.codingScore || 0,
      monthlyScore: data.monthlyScore || 0,
      instituteRank: data.instituteRank || 0,
    });
  } catch (error: any) {
    console.error('GFG API Error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch GFG data',
      details: error.message 
    }, { status: 500 });
  }
}
