import { IProfileProvider } from './types';
import { fetchGFGStats } from '../services/gfg.service';

export class GeeksforGeeksProvider implements IProfileProvider {
  public readonly platformName = 'GeeksforGeeks';

  /**
   * Primary: Resolves GFG stats utilizing the robust 3-stage scraping & API fallbacks.
   */
  async fetchPrimary(username: string): Promise<any> {
    const stats = await fetchGFGStats(username);
    return {
      username: stats.username,
      solved: stats.totalSolved,
      rating: stats.codingScore, // Mapping Coding Score to generic rating
      rank: 'GeeksforGeeks Coder',
      stars: 0,
      contests: 0,
      globalRank: stats.instituteRank || 0, // Map instituteRank directly to globalRank!
      metadata: {
        extra: {
          easy: stats.easy,
          medium: stats.medium,
          hard: stats.hard,
          basic: stats.basic,
          school: stats.school,
          score: stats.codingScore,
          instituteRank: stats.instituteRank || 0
        }
      }
    };
  }

  async fetchBackup(username: string): Promise<any> {
    return this.fetchPrimary(username);
  }

  async fetchScraper(username: string): Promise<any> {
    return this.fetchPrimary(username);
  }
}
