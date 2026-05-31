import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let username = searchParams.get('username') || 'lalitmodiog7e';

  // 1. Auto-extract username from GFG profile URL if user pasted the full link
  username = username.trim();
  
  // Strip out query parameters (e.g. ?tab=) and hash fragments first
  username = username.split('?')[0].split('#')[0].trim();

  if (username.toLowerCase().includes('geeksforgeeks.org/profile/')) {
    const parts = username.split(/geeksforgeeks\.org\/profile\//i);
    if (parts[1]) {
      username = parts[1].split('/')[0].trim();
    }
  } else if (username.startsWith('http') && username.includes('/')) {
    username = username.split('/').filter(Boolean).pop() || username;
  }

  // Sanitize handle to filter out invalid query characters
  username = username.replace(/[^a-zA-Z0-9_-]/g, '');

  console.log(`[Frontend GFG API] Resolving handle for user link verification: ${username}`);

  // Strategy A: napiyo API
  try {
    const res = await fetch(`https://geeks-for-geeks-api.vercel.app/public/api/user/${username}/`, {
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      const info = data.info || {};
      const solved = data.solvedStats || {};

      const codingScore = info.codingScore || data.codingScore || 0;
      const totalSolved = info.totalProblemsSolved || data.totalProblemsSolved || data.totalSolved || 0;

      const easy = solved.easy?.count || solved.easy || data.easy || 0;
      const medium = solved.medium?.count || solved.medium || data.medium || 0;
      const hard = solved.hard?.count || solved.hard || data.hard || 0;

      if (Number(totalSolved) > 0) {
        return NextResponse.json({
          platform: 'GeeksforGeeks',
          username,
          totalProblemsSolved: Number(totalSolved),
          easy: Number(easy),
          medium: Number(medium),
          hard: Number(hard),
          codingScore: Number(codingScore),
        });
      }
    }
  } catch (err: any) {
    console.warn(`[Frontend GFG API] Strategy A failed:`, err.message);
  }

  // Strategy B: nikhilpal GFG API
  try {
    const res = await fetch(`https://gfgstatscard.vercel.app/${username}?raw=true`, {
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      const codingScore = data.total_score || data.codingScore || data.score || 0;
      const totalSolved = data.total_problems_solved || data.totalProblemsSolved || data.totalSolved || data.solved || 0;

      const easy = data.Easy || data.easy || 0;
      const medium = data.Medium || data.medium || 0;
      const hard = data.Hard || data.hard || 0;

      if (Number(totalSolved) > 0) {
        return NextResponse.json({
          platform: 'GeeksforGeeks',
          username,
          totalProblemsSolved: Number(totalSolved),
          easy: Number(easy),
          medium: Number(medium),
          hard: Number(hard),
          codingScore: Number(codingScore),
        });
      }
    }
  } catch (err: any) {
    console.warn(`[Frontend GFG API] Strategy B failed:`, err.message);
  }

  // Strategy C: Original GFG stats API
  try {
    const res = await fetch(`https://geeks-for-geeks-stats-api.vercel.app/?userName=${username}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && !data.error) {
        return NextResponse.json({
          platform: 'GeeksforGeeks',
          username,
          totalProblemsSolved: data.totalProblemsSolved || 0,
          easy: data.Easy || 0,
          medium: data.Medium || 0,
          hard: data.Hard || 0,
          codingScore: data.codingScore || 0,
        });
      }
    }
  } catch (err: any) {
    console.warn(`[Frontend GFG API] Strategy C failed:`, err.message);
  }

  return NextResponse.json({ 
    error: 'Failed to fetch GFG data',
    details: 'Profile not found or is private' 
  }, { status: 404 });
}
