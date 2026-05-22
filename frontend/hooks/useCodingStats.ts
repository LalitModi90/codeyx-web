import { useState, useEffect, useCallback } from 'react';

// ─── Platform Data Interfaces ───────────────────────────────

export interface LeetCodeData {
  platform: string;
  username: string;
  realName: string;
  avatar: string;
  ranking: number;
  reputation: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: number;
  totalActiveDays: number;
  submissionCalendar: string;
  badges: { name: string; icon: string }[];
}

export interface CodeChefData {
  platform: string;
  username: string;
  name: string;
  currentRating: number;
  highestRating: number;
  stars: string;
  globalRank: number;
  countryRank: number;
  totalProblems: number;
  ratingData: any[];
  heatMap: any[];
}

export interface GitHubData {
  platform: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  company: string;
  blog: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  totalStars: number;
  totalForks: number;
  topLanguages: { name: string; count: number }[];
  recentRepos: {
    name: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    url: string;
    updatedAt: string;
  }[];
}

export interface GFGData {
  platform: string;
  username: string;
  totalProblemsSolved: number;
  school: number;
  basic: number;
  easy: number;
  medium: number;
  hard: number;
  codingScore: number;
  monthlyScore: number;
  instituteRank: number;
}

export interface CodeforcesData {
  platform: string;
  username: string;
  name: string;
  avatar: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  rankColor: string;
  contribution: number;
  friendOfCount: number;
  registrationTime: number;
  totalSolved: number;
  contestsParticipated: number;
  ratingHistory: {
    contestName: string;
    contestId: number;
    rank: number;
    oldRating: number;
    newRating: number;
    ratingChange: number;
    timestamp: number;
  }[];
  recentSubmissions: {
    problem: string;
    verdict: string;
    language: string;
    timestamp: number;
  }[];
}

export interface AtCoderData {
  platform: string;
  username: string;
  rating: number;
  maxRating: number;
  rank: string;
  rankColor: string;
  totalAccepted: number;
  globalRank: number;
  contestsParticipated: number;
  ratingHistory: {
    contestName: string;
    isRated: boolean;
    oldRating: number;
    newRating: number;
    ratingChange: number;
    place: number;
    timestamp: number;
  }[];
}

export interface HackerRankData {
  platform: string;
  username: string;
  name: string;
  avatar: string;
  country: string;
  school: string;
  totalStars: number;
  badges: { name: string; stars: number; category: string }[];
  level: number;
  followers: number;
  totalSolved: number;
}

// ─── Aggregated Data Types ──────────────────────────────────

export type PlatformKey = 'leetcode' | 'codechef' | 'github' | 'gfg' | 'codeforces' | 'atcoder' | 'hackerrank';

export interface AllPlatformData {
  leetcode: LeetCodeData | null;
  codechef: CodeChefData | null;
  github: GitHubData | null;
  gfg: GFGData | null;
  codeforces: CodeforcesData | null;
  atcoder: AtCoderData | null;
  hackerrank: HackerRankData | null;
}

export interface PlatformHandlesMap {
  leetcode?: string;
  codeforces?: string;
  codechef?: string;
  github?: string;
  gfg?: string;
  atcoder?: string;
  hackerrank?: string;
}

// ─── Aggregated Stats ───────────────────────────────────────

export interface AggregatedStats {
  totalSolved: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  streak: number;
  bestRating: number;
  bestRatingPlatform: string;
  connectedPlatforms: number;
  totalContests: number;
  githubStars: number;
  githubRepos: number;
}

function computeAggregatedStats(data: AllPlatformData): AggregatedStats {
  let totalSolved = 0;
  let totalEasy = 0;
  let totalMedium = 0;
  let totalHard = 0;
  let streak = 0;
  let bestRating = 0;
  let bestRatingPlatform = '';
  let connectedPlatforms = 0;
  let totalContests = 0;
  let githubStars = 0;
  let githubRepos = 0;

  if (data.leetcode) {
    connectedPlatforms++;
    totalSolved += data.leetcode.totalSolved || 0;
    totalEasy += data.leetcode.easySolved || 0;
    totalMedium += data.leetcode.mediumSolved || 0;
    totalHard += data.leetcode.hardSolved || 0;
    streak = Math.max(streak, data.leetcode.streak || 0);
    if ((data.leetcode.ranking || 0) > 0) {
      // LeetCode ranking is global position (lower is better), not a rating
    }
  }

  if (data.codeforces) {
    connectedPlatforms++;
    totalSolved += data.codeforces.totalSolved || 0;
    totalContests += data.codeforces.contestsParticipated || 0;
    if ((data.codeforces.maxRating || 0) > bestRating) {
      bestRating = data.codeforces.maxRating;
      bestRatingPlatform = 'Codeforces';
    }
  }

  if (data.codechef) {
    connectedPlatforms++;
    totalSolved += data.codechef.totalProblems || 0;
    if ((data.codechef.highestRating || 0) > bestRating) {
      bestRating = data.codechef.highestRating;
      bestRatingPlatform = 'CodeChef';
    }
  }

  if (data.gfg) {
    connectedPlatforms++;
    totalSolved += data.gfg.totalProblemsSolved || 0;
    totalEasy += data.gfg.easy || 0;
    totalMedium += data.gfg.medium || 0;
    totalHard += data.gfg.hard || 0;
  }

  if (data.atcoder) {
    connectedPlatforms++;
    totalSolved += data.atcoder.totalAccepted || 0;
    totalContests += data.atcoder.contestsParticipated || 0;
    if ((data.atcoder.maxRating || 0) > bestRating) {
      bestRating = data.atcoder.maxRating;
      bestRatingPlatform = 'AtCoder';
    }
  }

  if (data.github) {
    connectedPlatforms++;
    githubStars = data.github.totalStars || 0;
    githubRepos = data.github.publicRepos || 0;
  }

  if (data.hackerrank) {
    connectedPlatforms++;
    totalSolved += data.hackerrank.totalSolved || 0;
  }

  return {
    totalSolved,
    totalEasy,
    totalMedium,
    totalHard,
    streak,
    bestRating,
    bestRatingPlatform,
    connectedPlatforms,
    totalContests,
    githubStars,
    githubRepos,
  };
}

// ─── Main Hook ──────────────────────────────────────────────

export function useCodingStats(handles?: PlatformHandlesMap) {
  const [data, setData] = useState<AllPlatformData>({
    leetcode: null,
    codechef: null,
    github: null,
    gfg: null,
    codeforces: null,
    atcoder: null,
    hackerrank: null,
  });
  const [loading, setLoading] = useState<Record<PlatformKey, boolean>>({
    leetcode: false,
    codechef: false,
    github: false,
    gfg: false,
    codeforces: false,
    atcoder: false,
    hackerrank: false,
  });
  const [errors, setErrors] = useState<Record<PlatformKey, string>>({
    leetcode: '',
    codechef: '',
    github: '',
    gfg: '',
    codeforces: '',
    atcoder: '',
    hackerrank: '',
  });

  const fetchPlatform = useCallback(async (
    platform: PlatformKey,
    url: string
  ) => {
    setLoading(prev => ({ ...prev, [platform]: true }));
    setErrors(prev => ({ ...prev, [platform]: '' }));
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(prev => ({ ...prev, [platform]: json }));
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [platform]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  }, []);

  const fetchAll = useCallback(() => {
    if (!handles) return;

    // Only fetch platforms that have a handle set
    if (handles.leetcode) {
      fetchPlatform('leetcode', `/api/leetcode?username=${encodeURIComponent(handles.leetcode)}`);
    }
    if (handles.codeforces) {
      fetchPlatform('codeforces', `/api/codeforces?username=${encodeURIComponent(handles.codeforces)}`);
    }
    if (handles.codechef) {
      fetchPlatform('codechef', `/api/codechef?username=${encodeURIComponent(handles.codechef)}`);
    }
    if (handles.github) {
      fetchPlatform('github', `/api/github?username=${encodeURIComponent(handles.github)}`);
    }
    if (handles.gfg) {
      fetchPlatform('gfg', `/api/gfg?username=${encodeURIComponent(handles.gfg)}`);
    }
    if (handles.atcoder) {
      fetchPlatform('atcoder', `/api/atcoder?username=${encodeURIComponent(handles.atcoder)}`);
    }
    if (handles.hackerrank) {
      fetchPlatform('hackerrank', `/api/hackerrank?username=${encodeURIComponent(handles.hackerrank)}`);
    }
  }, [handles, fetchPlatform]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isAnyLoading = Object.values(loading).some(Boolean);
  const aggregated = computeAggregatedStats(data);

  return { data, loading, errors, isAnyLoading, aggregated, refetch: fetchAll };
}
