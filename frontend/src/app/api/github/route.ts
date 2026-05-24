import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'LalitModi90';

  try {
    // GitHub official free API (no auth needed for public profiles)
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
      }),
    ]);

    if (!userRes.ok) {
      throw new Error(`GitHub API returned ${userRes.status}`);
    }

    const userData = await userRes.json();
    const reposData = reposRes.ok ? await reposRes.json() : [];

    // Calculate languages from repos
    const languageCount: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;

    if (Array.isArray(reposData)) {
      reposData.forEach((repo: any) => {
        if (repo.language) {
          languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
        totalStars += repo.stargazers_count || 0;
        totalForks += repo.forks_count || 0;
      });
    }

    // Sort languages by count
    const topLanguages = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      platform: 'GitHub',
      username: userData.login || username,
      name: userData.name || '',
      avatar: userData.avatar_url || '',
      bio: userData.bio || '',
      location: userData.location || '',
      company: userData.company || '',
      blog: userData.blog || '',
      publicRepos: userData.public_repos || 0,
      followers: userData.followers || 0,
      following: userData.following || 0,
      createdAt: userData.created_at || '',
      totalStars,
      totalForks,
      topLanguages,
      recentRepos: Array.isArray(reposData) ? reposData.slice(0, 5).map((r: any) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        url: r.html_url,
        updatedAt: r.updated_at,
      })) : [],
    });
  } catch (error: any) {
    console.error('GitHub API Error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch GitHub data',
      details: error.message 
    }, { status: 500 });
  }
}
