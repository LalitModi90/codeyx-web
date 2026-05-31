"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { platformService } from '../../../../services/platform.service';
import TopNavbar from '../../../../components/shared/TopNavbar';

// Import modular LeetCode UI segments
import ProfileHeader from '../../../../components/leetcode/ProfileHeader';
import DifficultyChart from '../../../../components/leetcode/DifficultyChart';
import ContestAnalytics from '../../../../components/leetcode/ContestAnalytics';
import ActivityHeatmap from '../../../../components/leetcode/ActivityHeatmap';
import SubmissionTable from '../../../../components/leetcode/SubmissionTable';
import TopicMastery from '../../../../components/leetcode/TopicMastery';
import BadgeSection from '../../../../components/leetcode/BadgeSection';
import LanguageAnalytics from '../../../../components/leetcode/LanguageAnalytics';
import DailyChallenge from '../../../../components/leetcode/DailyChallenge';
import PerformanceInsights from '../../../../components/leetcode/PerformanceInsights';

import { 
  Home, FileCode2, Trophy, Award, Calendar, Flame,
  HelpCircle, Settings, MessageSquare, LineChart, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// Custom GFG 5-Level Difficulty Breakdown Chart
function GfgDifficultyChart({ school = 0, basic = 0, easy = 0, medium = 0, hard = 0, total = 0 }) {
  const [hoveredSegment, setHoveredSegment] = React.useState<string | null>(null);

  const data = [
    { name: 'School', value: school, fill: '#A3E635' },
    { name: 'Basic', value: basic, fill: '#34D399' },
    { name: 'Easy', value: easy, fill: '#059669' },
    { name: 'Medium', value: medium, fill: '#3B82F6' },
    { name: 'Hard', value: hard, fill: '#EF4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="bg-[#06180c]/80 border border-[#2f8d46]/10 backdrop-blur-xl p-6 rounded-2xl flex flex-col justify-between h-[360px] shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#00E676]">Difficulty Breakdown</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Problems solved by custom GFG category</p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-6 py-2">
        <div className="w-44 h-44 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={(_, index) => setHoveredSegment(data[index].name)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    style={{
                      filter: hoveredSegment === entry.name ? `drop-shadow(0 0 8px ${entry.fill}80)` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#06180c] border border-[#2f8d46]/20 p-2.5 rounded-xl text-[10px] text-white">
                        <span className="font-bold" style={{ color: d.fill }}>{d.name}</span>: {d.value} solved
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-2xl font-black tracking-tight text-white">{total}</span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Solved</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5 max-h-[250px] overflow-y-auto pr-1 scrollbar-none">
          {[
            { name: 'School', value: school, fill: '#A3E635' },
            { name: 'Basic', value: basic, fill: '#34D399' },
            { name: 'Easy', value: easy, fill: '#059669' },
            { name: 'Medium', value: medium, fill: '#3B82F6' },
            { name: 'Hard', value: hard, fill: '#EF4444' }
          ].map((d) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <div key={d.name} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-gray-300">{d.name}</span>
                  </div>
                  <span className="text-gray-400 font-mono">
                    {d.value} <span className="text-gray-600 font-normal">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: d.fill }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Bespoke GfgStreakCard
function GfgStreakCard({ monthlyScore = 0, correctSubmissions = 0, longestStreak = 0, currentStreak = 0, streakDays = 0, totalSolved = 0 }) {
  return (
    <div className="bg-[#06180c]/80 border border-[#2f8d46]/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg flex flex-col justify-between h-[360px] relative overflow-hidden group">
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: `radial-gradient(circle at 100% 100%, #00E67608, transparent)` }}
      />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent blur-2xl rounded-full pointer-events-none" />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#00E676] flex items-center gap-1.5">
              <Flame size={14} className="animate-pulse text-[#00E676]" />
              <span>GFG Streak & Metrics</span>
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Legendary stats & Monthly performance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
            <span className="text-[8px] font-black text-[#00E676] uppercase tracking-wider block">Monthly Score</span>
            <p className="text-white font-extrabold text-base tracking-tight">{monthlyScore}</p>
            <span className="text-[8px] text-gray-500 block">Active score points</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
            <span className="text-[8px] font-black text-[#00E676] uppercase tracking-wider block">Correct Solves</span>
            <p className="text-white font-extrabold text-base tracking-tight">{correctSubmissions || totalSolved}</p>
            <span className="text-[8px] text-gray-500 block">Total positive verdicts</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Flame className="w-5 h-5 text-[#00E676] animate-bounce" />
          </div>
          <div>
            <span className="text-[8px] font-black text-[#00E676] uppercase tracking-widest block">Global Longest Streak</span>
            <p className="text-white font-black text-sm">{longestStreak || streakDays || 0} Days</p>
            <span className="text-[8px] text-gray-400 block mt-0.5 leading-tight">Top 0.1% of GeeksforGeeks global coders!</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.03] pt-4 mt-2 flex justify-between items-center">
        <span className="text-[9px] font-bold text-gray-400">Current active streak:</span>
        <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          {currentStreak || streakDays || 0} Days
        </span>
      </div>
    </div>
  );
}

export default function LeetCodePage({ platform: propPlatform }: { platform?: string }) {
  const { user } = useUser();
  const params = useParams();
  const routePlatform = params?.platform as string;
  const platform = propPlatform || routePlatform || 'leetcode';
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [lcHandle, setLcHandle] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectInput, setConnectInput] = useState('');
  
  // Data loading states
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MERN states
  const [lcData, setLcData] = useState<any>(null);
  const [dynamicDailyChallenge, setDynamicDailyChallenge] = useState<any>(null);

  // Normalize platform key
  const platformId = platform.toLowerCase() === 'gfg' ? 'geeksforgeeks' : platform.toLowerCase();

  const platformDisplayNames: Record<string, string> = {
    leetcode: 'LeetCode',
    geeksforgeeks: 'GeeksforGeeks',
    codechef: 'CodeChef',
    codeforces: 'Codeforces',
    hackerrank: 'HackerRank',
    atcoder: 'AtCoder'
  };
  const platformName = platformDisplayNames[platformId] || platform;

  const brandColors = React.useMemo(() => {
    if (platformId === 'geeksforgeeks') {
      return {
        bg: 'bg-[#040f08]',
        orange: '#2F8D46',
        yellow: '#00E676',
        accent: '#1B5E20',
        accentGrad: 'from-[#2F8D46]/10 to-[#00E676]/5',
        card: 'bg-[#06180c]/80 border-[#2f8d46]/10 backdrop-blur-xl',
      };
    }
    if (platformId === 'codeforces') {
      return {
        bg: 'bg-[#050B14]',
        orange: '#1F8ACB',
        yellow: '#3b82f6',
        accent: '#1565C0',
        accentGrad: 'from-[#1F8ACB]/10 to-[#3b82f6]/5',
        card: 'bg-[#091222]/80 border-white/[0.08] backdrop-blur-xl',
      };
    }
    if (platformId === 'codechef') {
      return {
        bg: 'bg-[#0f0a07]',
        orange: '#9E7A5A',
        yellow: '#b45309',
        accent: '#78350f',
        accentGrad: 'from-[#9E7A5A]/10 to-[#b45309]/5',
        card: 'bg-[#18110c]/80 border-white/[0.08] backdrop-blur-xl',
      };
    }
    return {
      bg: 'bg-[#050816]',
      orange: '#FFA116',
      yellow: '#FFD43B',
      accent: '#FF8C00',
      accentGrad: 'from-[#FFA116]/10 to-[#FFD43B]/5',
      card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
    };
  }, [platformId]);

  const fetchLCData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getPlatformStats(platformId, userId);
      const doc = res.data?.data || res.data;
      if (doc && doc.platform === platformId && doc.username) {
        setLcHandle(doc.username);
        setLcData(doc);
      } else {
        setLcHandle(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(`Could not fetch ${platformName} cache portfolio data.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchLCData(user.id);
    }
  }, [user?.id, platformId]);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const res = await fetch('https://alfa-leetcode-api.onrender.com/daily');
        const data = await res.json();
        if (data) {
          setDynamicDailyChallenge({
            title: data.questionTitle || data.title || "Course Schedule II",
            difficulty: data.difficulty || "Medium",
            link: data.questionLink || "https://leetcode.com/problemset/all/"
          });
        }
      } catch (err) {
        console.error('Failed to fetch dynamic daily challenge in client:', err);
      }
    };
    if (platformId === 'leetcode') {
      fetchDaily();
    } else {
      setDynamicDailyChallenge({
        title: "Two Sum",
        difficulty: "Easy",
        link: platformId === 'geeksforgeeks' 
          ? "https://www.geeksforgeeks.org/problems/two-sum-problem/1" 
          : "https://leetcode.com/problems/two-sum/"
      });
    }
  }, [platformId]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectInput.trim() || !user?.id) return;
    
    setIsConnecting(true);
    try {
      await platformService.syncPlatform(platformId, user.id, connectInput.trim());
      await fetchLCData(user.id);
    } catch (err: any) {
      setError(err.message || `Failed to link ${platformName} account`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!lcHandle || !user?.id) return;
    setSyncing(true);
    try {
      await platformService.syncPlatform(platformId, user.id);
      await fetchLCData(user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const totalSolved = lcData?.totalSolved || 0;
  const globalRank = lcData?.rating || 0;
  const streakDays = lcData?.stats?.streak || lcData?.stats?.metadata?.streak || 0;

  const profileRankNum = platformId === 'geeksforgeeks'
    ? (lcData?.stats?.globalRank || lcData?.stats?.instituteRank || 0)
    : (lcData?.stats?.globalRank 
        ? parseInt(String(lcData.stats.globalRank).replace(/[^0-9]/g, '')) || 0 
        : 0);

  const historyFromStats = lcData?.stats?.metadata?.contests || lcData?.stats?.contestsHistory || (Array.isArray(lcData?.stats?.contests) ? lcData.stats.contests : []);
  const lastContestRating = Array.isArray(historyFromStats) && historyFromStats.length > 0
    ? historyFromStats[historyFromStats.length - 1]?.rating || 0
    : 0;
  
  const resolvedRating = platformId === 'geeksforgeeks'
    ? (lcData?.stats?.rating || lcData?.rating || lcData?.stats?.codingScore || 0)
    : (lcData?.rating || lastContestRating || 0);

  const extraData = lcData?.stats?.extra || lcData?.stats?.metadata?.extra;
  
  // Merge GFG's School and Basic categories into Easy so the breakdown matches the total solved problems exactly!
  const easySolved = platformId === 'geeksforgeeks' 
    ? ((lcData?.stats?.easy || lcData?.stats?.easySolved || 0) + 
       (lcData?.stats?.basic || lcData?.stats?.metadata?.extra?.basic || 0) + 
       (lcData?.stats?.school || lcData?.stats?.metadata?.extra?.school || 0))
    : (extraData?.easy || 0);
    
  const mediumSolved = platformId === 'geeksforgeeks' 
    ? (lcData?.stats?.medium || lcData?.stats?.mediumSolved || 0) 
    : (extraData?.medium || 0);
    
  const hardSolved = platformId === 'geeksforgeeks' 
    ? (lcData?.stats?.hard || lcData?.stats?.hardSolved || 0) 
    : (extraData?.hard || 0);
    
  const topPercent = extraData?.topPercentage || 0;

  const dbTopicsList = lcData?.stats?.topics || [];
  const fetchedTopics = Array.isArray(dbTopicsList) && dbTopicsList.length > 0
    ? dbTopicsList.map((t: any) => ({
        subject: t.subject || t.tagName || t.name,
        solved: t.solved || t.count || t.problemsSolved || 0,
        category: t.category || 'Fundamental'
      }))
    : [];

  const fetchedSubmissions = Array.isArray(lcData?.stats?.submissions) && lcData.stats.submissions.length > 0
    ? lcData.stats.submissions.map((s: any, idx: number) => ({
        id: String(idx + 1),
        problemName: s.name || s.title,
        difficulty: s.difficulty || 'Medium',
        language: s.language || 'Java',
        runtime: s.runtime || '15ms',
        memory: s.memory || '14.2MB',
        status: s.status || 'Accepted',
        submittedTime: s.date || 'Just now',
      }))
    : undefined;

  const detectedLanguages = React.useMemo(() => {
    if (Array.isArray(lcData?.stats?.languages) && lcData.stats.languages.length > 0) {
      return lcData.stats.languages;
    }
    if (!fetchedSubmissions || fetchedSubmissions.length === 0) return undefined;
    const counts: Record<string, number> = {};
    fetchedSubmissions.forEach((s: any) => {
      const lang = s.language || 'Java';
      counts[lang] = (counts[lang] || 0) + 1;
    });
    return Object.entries(counts).map(([language, count]) => ({
      language,
      count
    }));
  }, [fetchedSubmissions, lcData?.stats?.languages]);

  const badgesList = lcData?.stats?.badges || lcData?.stats?.metadata?.badges || [];
  const fetchedBadges = Array.isArray(badgesList) && badgesList.length > 0
    ? badgesList.map((name: string) => ({
        name,
        category: "Accolade",
        iconColor: "text-amber-500",
        unlocked: true,
        unlockedDate: "Verified",
        description: `Official ${platformName} achievement`
      }))
    : undefined;

  const sortedTopicsForInsights = [...fetchedTopics].sort((a, b) => b.solved - a.solved);
  const strongest = sortedTopicsForInsights[0];
  const weakest = sortedTopicsForInsights.filter(t => t.solved > 0).pop() || sortedTopicsForInsights[sortedTopicsForInsights.length - 1];

  const strongestMastery = strongest ? Math.min(100, Math.max(30, Math.round((strongest.solved / 150) * 100))) : 0;
  const weakestMastery = weakest ? Math.max(5, Math.min(65, Math.round((weakest.solved / 30) * 100))) : 0;

  const strongestTopic = strongest ? `${strongest.subject} (${strongestMastery}% Mastery)` : 'None';
  const weakestTopic = weakest ? `${weakest.subject} (${weakestMastery}% Mastery)` : 'None';

  const recommendations = strongest
    ? [
        `Practice 5 medium ${weakest?.subject || 'Concepts'} problems to push your mastery past 70%.`,
        `Participate in the upcoming Weekly Contest to improve your contest rank consistency.`,
        `Review your submitted acceptances in ${strongest.subject} to lock in your strongest concepts.`
      ]
    : [];

  const dailyChallengeObj = lcData?.stats?.dailyChallenge || {};
  const dailyChallengeTitle = dailyChallengeObj.title || dynamicDailyChallenge?.title || "Course Schedule II";
  const dailyChallengeDifficulty = dailyChallengeObj.difficulty || dynamicDailyChallenge?.difficulty || "Medium";
  const dailyChallengeLink = dailyChallengeObj.link || dynamicDailyChallenge?.link || "https://leetcode.com/problemset/all/";

  const isChallengeCompleted = Array.isArray(fetchedSubmissions) && fetchedSubmissions.some(
    (s: any) => (s.problemName || '').toLowerCase() === dailyChallengeTitle.toLowerCase() && s.status === 'Accepted'
  );

  const contestHistory = lcData?.stats?.metadata?.contests || lcData?.stats?.contestsHistory || (Array.isArray(lcData?.stats?.contests) ? lcData.stats.contests : []);
  const lastContestRank = Array.isArray(contestHistory) && contestHistory.length > 0
    ? contestHistory[contestHistory.length - 1]?.rank || 0
    : 0;
  const globalContestRank = lcData?.stats?.extra?.globalRanking || lastContestRank || 0;

  const schoolSolved = platformId === 'geeksforgeeks' ? (lcData?.stats?.school || lcData?.stats?.metadata?.extra?.school || 0) : 0;
  const basicSolved = platformId === 'geeksforgeeks' ? (lcData?.stats?.basic || lcData?.stats?.metadata?.extra?.basic || 0) : 0;
  const easySolvedCount = platformId === 'geeksforgeeks' ? (lcData?.stats?.easy || lcData?.stats?.easySolved || 0) : 0;
  const mediumSolvedCount = platformId === 'geeksforgeeks' ? (lcData?.stats?.medium || lcData?.stats?.mediumSolved || 0) : 0;
  const hardSolvedCount = platformId === 'geeksforgeeks' ? (lcData?.stats?.hard || lcData?.stats?.hardSolved || 0) : 0;

  const monthlyScore = platformId === 'geeksforgeeks' ? (lcData?.stats?.monthlyScore || lcData?.stats?.metadata?.extra?.monthly_score || lcData?.stats?.extra?.monthly_score || 0) : 0;
  const longestStreak = platformId === 'geeksforgeeks' ? (lcData?.stats?.longestStreak || lcData?.stats?.metadata?.extra?.pod_solved_global_longest_streak || lcData?.stats?.extra?.pod_solved_global_longest_streak || 0) : 0;
  const currentStreak = platformId === 'geeksforgeeks' ? (lcData?.stats?.currentStreak || lcData?.stats?.metadata?.extra?.pod_solved_current_streak || lcData?.stats?.extra?.pod_solved_current_streak || 0) : 0;
  const correctSubmissions = platformId === 'geeksforgeeks' ? (lcData?.stats?.correctSubmissions || lcData?.stats?.metadata?.extra?.pod_correct_submissions_count || lcData?.stats?.extra?.pod_correct_submissions_count || 0) : 0;

  return (
    <div className={`min-h-screen ${brandColors.bg} text-[var(--text-main)] font-sans selection:bg-orange-500/30 pb-16 overflow-x-hidden relative`}>
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(to_right, ${brandColors.orange}03 1px, transparent 1px), linear-gradient(to_bottom, ${brandColors.orange}03 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div 
        className="absolute top-0 left-1/4 w-[600px] h-[600px] blur-[180px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${brandColors.orange}0d, transparent)`
        }}
      />
      
      <TopNavbar />

      <main className="max-w-[1600px] mx-auto px-6 pt-8 flex flex-col gap-6 relative z-10">
        
        {loading && lcHandle && (
          <div className="flex flex-col gap-6 w-full animate-pulse mt-4">
            <div className={`h-44 ${brandColors.card} rounded-2xl w-full`} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={`lg:col-span-3 h-[450px] ${brandColors.card} rounded-2xl`} />
              <div className={`lg:col-span-9 h-[450px] ${brandColors.card} rounded-2xl`} />
            </div>
          </div>
        )}

        {!lcHandle && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] w-full text-center relative py-12 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`max-w-md w-full p-8 rounded-3xl border shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden ${brandColors.card}`}
            >
              <div 
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl pointer-events-none" 
                style={{ background: `radial-gradient(circle, ${brandColors.orange}26, transparent)` }}
              />

              <div 
                className="w-20 h-20 border rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                style={{ 
                  backgroundColor: `${brandColors.orange}1a`, 
                  borderColor: `${brandColors.orange}33` 
                }}
              >
                <Flame className="w-10 h-10" style={{ color: brandColors.orange }} />
              </div>

              <h2 className="text-xl font-extrabold tracking-tight mb-2 text-white">Connect {platformName}</h2>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Connect your {platformName} profile to import problem solving percentages, streak badges, and active contest ratings!
              </p>

              <form onSubmit={handleConnect} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={connectInput}
                  onChange={(e) => setConnectInput(e.target.value)}
                  placeholder={`Enter ${platformName} Handle (e.g. mTQb0YqjQb)`}
                  className="px-4 py-3 text-xs bg-white/[0.02] border border-white/5 rounded-xl focus:outline-none focus:bg-white/[0.04] text-center tracking-wider font-bold text-white transition-all"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  required
                />
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 text-xs font-black tracking-wider uppercase rounded-xl hover:opacity-90 shadow-md flex items-center justify-center gap-2 text-black transition-opacity"
                  style={{ 
                    background: `linear-gradient(to_right, ${brandColors.orange}, ${brandColors.yellow})`,
                    boxShadow: `0 4px 12px ${brandColors.orange}26`
                  }}
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Link {platformName} Portfolio</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {!loading && lcHandle && (
          <div className="space-y-6">
            
            <ProfileHeader 
              username={lcHandle}
              realName={user?.fullName || `${platformName} Developer`}
              avatarUrl={lcData?.stats?.avatar || lcData?.stats?.extra?.avatar || lcData?.stats?.metadata?.extra?.avatar || user?.imageUrl || "https://assets.codeforces.com/images/no-avatar.jpg"}
              solvedCount={totalSolved}
              globalRank={profileRankNum}
              rating={resolvedRating}
              reputation={lcData?.stats?.reputation || 0}
              rank={
                resolvedRating >= 2190 
                  ? "Guardian" 
                  : (resolvedRating >= 1850 
                      ? "Knight" 
                      : (lcData?.stats?.globalRank && !String(lcData.stats.globalRank).includes("Global Rank:")
                          ? String(lcData.stats.globalRank) 
                          : "Coder"))
              }
              streak={streakDays}
              syncing={syncing}
              onSync={handleSync}
              platformName={platformName}
              brandColors={brandColors}
            />

            {platformId === 'geeksforgeeks' ? (
              // BREATHTAKING BESPOKE GEEKSFORGEEKS DASHBOARD!
              <div className="space-y-8 animate-fadeIn w-full">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                  {/* Left Column - Breathtaking 5-Level difficulty breakdown */}
                  <div className="xl:col-span-7">
                    <GfgDifficultyChart 
                      school={schoolSolved}
                      basic={basicSolved}
                      easy={easySolvedCount}
                      medium={mediumSolvedCount}
                      hard={hardSolvedCount}
                      total={totalSolved}
                    />
                  </div>

                  {/* Right Column - Custom GFG Metrics & Streak */}
                  <div className="xl:col-span-5">
                    <GfgStreakCard 
                      monthlyScore={monthlyScore}
                      correctSubmissions={correctSubmissions}
                      longestStreak={longestStreak}
                      currentStreak={currentStreak}
                      streakDays={streakDays}
                      totalSolved={totalSolved}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                  {/* Left Column - GFG Problem of the Day */}
                  <div className="xl:col-span-7">
                    <DailyChallenge 
                      challengeTitle="Problem of the Day"
                      difficulty="Medium"
                      completed={false}
                      problemUrl="https://practice.geeksforgeeks.org/problem-of-the-day"
                      platformName="GeeksforGeeks"
                      brandColors={brandColors}
                    />
                  </div>

                  {/* Right Column - Dynamic Prep & Performance Insights */}
                  <div className="xl:col-span-5">
                    <PerformanceInsights 
                      strongestTopic={strongestTopic} 
                      weakestTopic={weakestTopic} 
                      recommendations={recommendations} 
                      platformName="GeeksforGeeks"
                      brandColors={brandColors}
                    />
                  </div>
                </div>

                {/* Heatmap Section if GFG returns any data */}
                {(lcData?.stats?.extra?.heatmap || lcData?.stats?.heatmap || []).length > 0 && (
                  <ActivityHeatmap 
                    activityData={lcData?.stats?.extra?.heatmap || lcData?.stats?.heatmap || []}
                    yearlyStreak={streakDays}
                    activeDaysCount={(lcData?.stats?.extra?.heatmap || lcData?.stats?.heatmap || []).length}
                  />
                )}
              </div>
            ) : (
              // STANDARD MULTI-TAB CODE FOR OTHER PLATFORMS
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <aside className={`lg:col-span-2.5 xl:col-span-2 border rounded-2xl p-3 flex flex-col gap-1 sticky top-24 backdrop-blur-md shadow-2xl ${brandColors.card}`}>
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-3 py-1.5 block">Navigation</span>
                  {[
                    { id: 'Overview', icon: Home },
                    { id: 'Problems', icon: FileCode2 },
                    { id: 'Contests', icon: Trophy },
                    { id: 'Submissions', icon: Award },
                    { id: 'Badges', icon: Calendar },
                    { id: 'Analytics', icon: LineChart },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 relative group"
                      style={activeTab === tab.id ? { 
                        color: brandColors.orange, 
                        backgroundColor: `${brandColors.orange}0c`, 
                        borderColor: `${brandColors.orange}33` 
                      } : {
                        color: '#9ca3af'
                      }}
                    >
                      <tab.icon className="w-4 h-4 transition-transform group-hover:scale-110" style={activeTab === tab.id ? { color: brandColors.orange } : { color: '#6b7280' }} />
                      <span>{tab.id}</span>
                    </button>
                  ))}
                </aside>

                <div className="lg:col-span-9.5 xl:col-span-10 space-y-6">
                  
                  {activeTab === 'Overview' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-7">
                          <DifficultyChart 
                            easySolved={easySolved}
                            mediumSolved={mediumSolved}
                            hardSolved={hardSolved}
                          />
                        </div>
                        <div className="xl:col-span-5">
                          <DailyChallenge 
                            challengeTitle={dailyChallengeTitle}
                            difficulty={dailyChallengeDifficulty as any}
                            completed={isChallengeCompleted}
                            problemUrl={dailyChallengeLink}
                          />
                        </div>
                      </div>

                      <ContestAnalytics 
                        currentRating={resolvedRating}
                        topPercent={topPercent}
                        contestsAttended={Array.isArray(historyFromStats) ? historyFromStats.length : (lcData?.stats?.contests || 0)}
                        globalContestRank={globalContestRank}
                        globalProfileRank={profileRankNum}
                        ratingHistory={
                          Array.isArray(historyFromStats) && historyFromStats.length > 0 
                            ? (historyFromStats.length === 1 
                                ? [
                                    { contestName: "Start", rating: 1500, rank: 0, ratingChange: 0 },
                                    ...historyFromStats
                                  ]
                                : historyFromStats)
                            : resolvedRating 
                              ? [
                                  { contestName: "Start", rating: 1500, rank: 0, ratingChange: 0 },
                                  { contestName: "Current", rating: resolvedRating, rank: globalContestRank, ratingChange: 0 }
                                ]
                              : []
                        }
                      />

                      <ActivityHeatmap 
                        activityData={lcData?.stats?.extra?.heatmap || lcData?.stats?.heatmap || []}
                        yearlyStreak={streakDays}
                        activeDaysCount={(lcData?.stats?.extra?.heatmap || lcData?.stats?.heatmap || []).length}
                      />

                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-7">
                          <TopicMastery topics={fetchedTopics} />
                        </div>
                        <div className="xl:col-span-5">
                          <PerformanceInsights 
                            strongestTopic={strongestTopic} 
                            weakestTopic={weakestTopic} 
                            recommendations={recommendations} 
                            platformName={platformName}
                            brandColors={brandColors}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-7">
                          <BadgeSection badges={fetchedBadges} />
                        </div>
                        <div className="xl:col-span-5">
                          <LanguageAnalytics languages={detectedLanguages} />
                        </div>
                      </div>

                      <SubmissionTable submissions={fetchedSubmissions} />
                    </motion.div>
                  )}

                  {activeTab === 'Problems' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-7">
                          <DifficultyChart 
                            easySolved={easySolved}
                            mediumSolved={mediumSolved}
                            hardSolved={hardSolved}
                          />
                        </div>
                        <div className="xl:col-span-5">
                          <DailyChallenge 
                            challengeTitle={dailyChallengeTitle}
                            difficulty={dailyChallengeDifficulty as any}
                            completed={isChallengeCompleted}
                            problemUrl={dailyChallengeLink}
                          />
                        </div>
                      </div>
                      <TopicMastery topics={fetchedTopics} />
                    </motion.div>
                  )}

                  {activeTab === 'Contests' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ContestAnalytics 
                        currentRating={resolvedRating}
                        topPercent={topPercent}
                        contestsAttended={Array.isArray(historyFromStats) ? historyFromStats.length : (lcData?.stats?.contests || 0)}
                        globalContestRank={globalContestRank}
                        globalProfileRank={profileRankNum}
                        ratingHistory={
                          Array.isArray(historyFromStats) && historyFromStats.length > 0 
                            ? (historyFromStats.length === 1 
                                ? [
                                    { contestName: "Start", rating: 1500, rank: 0, ratingChange: 0 },
                                    ...historyFromStats
                                  ]
                                : historyFromStats)
                            : resolvedRating 
                              ? [
                                  { contestName: "Start", rating: 1500, rank: 0, ratingChange: 0 },
                                  { contestName: "Current", rating: resolvedRating, rank: globalContestRank, ratingChange: 0 }
                                ]
                              : []
                        }
                      />
                    </motion.div>
                  )}

                  {activeTab === 'Submissions' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <SubmissionTable submissions={fetchedSubmissions} />
                    </motion.div>
                  )}

                  {activeTab === 'Badges' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <BadgeSection badges={fetchedBadges} />
                    </motion.div>
                  )}

                  {activeTab === 'Analytics' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-7">
                          <TopicMastery topics={fetchedTopics} />
                        </div>
                        <div className="xl:col-span-5">
                          <PerformanceInsights 
                            strongestTopic={strongestTopic} 
                            weakestTopic={weakestTopic} 
                            recommendations={recommendations} 
                            platformName={platformName}
                            brandColors={brandColors}
                          />
                        </div>
                      </div>
                      <LanguageAnalytics languages={detectedLanguages} />
                    </motion.div>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
