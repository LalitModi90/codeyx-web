import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'lalitmodi7878';

  try {
    // Use codechef-api.vercel.app (free public API)
    const res = await fetch(`https://codechef-api.vercel.app/handle/${username}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`CodeChef API returned ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      platform: 'CodeChef',
      username: username,
      name: data.name || '',
      currentRating: data.currentRating || 0,
      highestRating: data.highestRating || 0,
      stars: data.stars || '0',
      globalRank: data.globalRank || 0,
      countryRank: data.countryRank || 0,
      totalProblems: data.totalProblems || 0,
      ratingData: data.ratingData || [],
      heatMap: data.heatMap || [],
    });
  } catch (error: any) {
    console.error('CodeChef API Error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch CodeChef data',
      details: error.message 
    }, { status: 500 });
  }
}
