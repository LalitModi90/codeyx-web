export const fetchGitHubStats = async (username: string) => {
  try {
    // Basic user info
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'User-Agent': 'Codeyx-Analytics',
        // 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` // Recommended to prevent rate limits
      }
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub API Error: ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    // Fetch user's public repositories to aggregate stats
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
      headers: {
        'User-Agent': 'Codeyx-Analytics',
      }
    });

    let totalStars = 0;
    let totalForks = 0;
    
    if (reposResponse.ok) {
      const repos = await reposResponse.json();
      repos.forEach((repo: any) => {
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;
      });
    }

    return {
      totalStars,
      totalForks,
      followers: userData.followers,
      following: userData.following,
      publicRepos: userData.public_repos,
      raw: userData
    };

  } catch (error: any) {
    console.error(`GitHub Fetch Error for ${username}:`, error.message);
    throw error;
  }
};
