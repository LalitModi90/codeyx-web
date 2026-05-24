import { fetchWithRetry, fetchWithCache } from '../utils/api.utils';
import { IUnifiedProfile } from '../types/profile.types';

export const fetchGitHubStats = async (username: string): Promise<IUnifiedProfile & any> => {
  return fetchWithCache(
    `platform:github:profile:${username.toLowerCase()}`,
    86400, // 24 hours TTL for github as requested
    async () => {
      try {
        const userResponse = await fetchWithRetry(`https://api.github.com/users/${username}`, {
          headers: { 'User-Agent': 'Codeyx-Analytics' }
        });
        const userData = await userResponse.json();

        const reposResponse = await fetchWithRetry(`https://api.github.com/users/${username}/repos?per_page=100`, {
          headers: { 'User-Agent': 'Codeyx-Analytics' }
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
          username: userData.login,
          platform: 'github',
          avatar: userData.avatar_url || '',
          rating: totalStars * 10 + totalForks * 5, // Mock rating
          solvedProblems: userData.public_repos,
          rank: 'Unrated',
          contests: [],

          // Legacy
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
    }
  );
};
