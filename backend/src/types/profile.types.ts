export interface IUnifiedProfile {
  username: string;
  platform: 'leetcode' | 'codeforces' | 'codechef' | 'github' | 'atcoder' | 'hackerrank' | 'gfg';
  avatar: string;
  rating: number;
  solvedProblems: number;
  rank: number | string;
  contests: any[]; // Array of contest history
  rawStats?: any; // To preserve any platform-specific unique data
}
