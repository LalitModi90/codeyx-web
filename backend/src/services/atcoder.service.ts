import { fetchWithRetry, fetchWithCache } from '../utils/api.utils';
import { IUnifiedProfile } from '../types/profile.types';

export const fetchAtCoderStats = async (username: string): Promise<IUnifiedProfile & any> => {
  return fetchWithCache(
    `platform:atcoder:profile:${username.toLowerCase()}`,
    7200,
    async () => {
      try {
        const userResponse = await fetchWithRetry(`https://kenkoooo.com/atcoder/atcoder-api/v2/user_info?user=${username}`);
        const userData = await userResponse.json(); 
        
        return {
          username: username,
          platform: 'atcoder',
          avatar: '', 
          rating: 0,
          solvedProblems: userData?.accepted_count || 0,
          rank: 'Unrated',
          contests: [],
          
          raw: userData
        };
      } catch (error: any) {
        console.error(`AtCoder Fetch Error for ${username}:`, error.message);
        throw error;
      }
    }
  );
}
