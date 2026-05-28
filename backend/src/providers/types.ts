export interface UnifiedResponse {
  platform: string;
  username: string;
  rating: number;
  solved: number;
  rank: string;
  followers: number;
  stars: number;
  contests: number;
  metadata?: {
    badges?: string[];
    streak?: number;
    skills?: string[];
    languages?: string[];
    repositoriesCount?: number;
    commitsCount?: number;
    highestRating?: number;
    certificates?: string[];
    extra?: any;
    resolutionDetails?: {
      strategyUsed: string;
      timestamp: string;
    };
  };
}

export type ProviderType = 'primary' | 'backup' | 'scraper';

export interface IProfileProvider {
  platformName: string;
  fetchPrimary(username: string): Promise<any>;
  fetchBackup(username: string): Promise<any>;
  fetchScraper(username: string): Promise<any>;
}
