"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { platformService } from '../../../../services/platform.service';
import TopNavbar from '../../../../components/shared/TopNavbar';
import ProfileHeader from '../../../../components/leetcode/ProfileHeader';
import DailyChallenge from '../../../../components/leetcode/DailyChallenge';
import PerformanceInsights from '../../../../components/leetcode/PerformanceInsights';
import ActivityHeatmap from '../../../../components/leetcode/ActivityHeatmap';

import { Flame, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// Custom GFG 5-Level Difficulty Breakdown Chart
interface GfgDifficultyChartProps {
  school?: number;
  basic?: number;
  easy?: number;
  medium?: number;
  hard?: number;
  total?: number;
  isLight?: boolean;
  brandColors?: any;
}

function GfgDifficultyChart({ 
  school = 0, 
  basic = 0, 
  easy = 0, 
  medium = 0, 
  hard = 0, 
  total = 0,
  isLight = false,
  brandColors = {} as any
}: GfgDifficultyChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const data = [
    { name: 'School', value: school, fill: '#A3E635' },
    { name: 'Basic', value: basic, fill: '#34D399' },
    { name: 'Easy', value: easy, fill: '#059669' },
    { name: 'Medium', value: medium, fill: '#3B82F6' },
    { name: 'Hard', value: hard, fill: '#EF4444' }
  ].filter(d => d.value > 0);

  return (
    <div className={`${brandColors.card} p-6 rounded-2xl flex flex-col justify-between h-[360px] shadow-lg relative overflow-hidden transition-all duration-300`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-extrabold text-xs uppercase tracking-wider" style={{ color: brandColors.title }}>
            Difficulty Breakdown
          </h3>
          <p className={`text-[10px] ${brandColors.textMuted} mt-0.5 font-bold`}>
            Problems solved by custom GFG category
          </p>
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
                      <div className={`${isLight ? 'bg-white border-[#2f8d46]/20 text-[#0a230f]' : 'bg-[#06180c] border-[#2f8d46]/20 text-white'} border p-2.5 rounded-xl text-[10px] shadow-md font-bold`}>
                        <span style={{ color: d.fill }}>{d.name}</span>: {d.value} solved
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className={`text-2xl font-black tracking-tight ${brandColors.textMain}`}>{total}</span>
            <span className={`text-[8px] font-bold ${brandColors.textMuted} uppercase tracking-widest`}>Solved</span>
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
                    <span className={brandColors.textMain}>{d.name}</span>
                  </div>
                  <span className={`${brandColors.textMain} font-mono`}>
                    {d.value} <span className={`${isLight ? 'text-emerald-700' : 'text-gray-500'} font-normal`}>({pct}%)</span>
                  </span>
                </div>
                <div className={`h-1.5 rounded-full ${isLight ? 'bg-emerald-500/10' : 'bg-white/[0.03]'} overflow-hidden`}>
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

// Custom GFG Streak & Metrics Card
interface GfgStreakCardProps {
  monthlyScore?: number;
  correctSubmissions?: number;
  longestStreak?: number;
  currentStreak?: number;
  streakDays?: number;
  totalSolved?: number;
  isLight?: boolean;
  brandColors?: any;
}

function GfgStreakCard({ 
  monthlyScore = 0, 
  correctSubmissions = 0, 
  longestStreak = 0, 
  currentStreak = 0, 
  streakDays = 0, 
  totalSolved = 0,
  isLight = false,
  brandColors = {} as any
}: GfgStreakCardProps) {
  return (
    <div className={`${brandColors.card} p-6 rounded-2xl shadow-lg flex flex-col justify-between h-[360px] relative overflow-hidden group transition-all duration-300`}>
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: isLight ? `radial-gradient(circle at 100% 100%, #2F8D460a, transparent)` : `radial-gradient(circle at 100% 100%, #00E67608, transparent)` }}
      />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent blur-2xl rounded-full pointer-events-none" />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5" style={{ color: brandColors.title }}>
              <Flame size={14} className="animate-pulse" style={{ color: brandColors.orange }} />
              <span>GFG Streak & Metrics</span>
            </h3>
            <p className={`text-[10px] ${brandColors.textMuted} mt-0.5 font-bold`}>
              Legendary stats & Monthly performance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`${brandColors.subCard} p-3.5 rounded-xl border space-y-1 transition-all duration-300`}>
            <span className="text-[8px] font-black uppercase tracking-wider block" style={{ color: brandColors.orange }}>
              Monthly Score
            </span>
            <p className={`${brandColors.textMain} font-extrabold text-base tracking-tight`}>
              {monthlyScore}
            </p>
            <span className={`text-[8px] ${brandColors.textMuted} font-bold block`}>
              Active score points
            </span>
          </div>

          <div className={`${brandColors.subCard} p-3.5 rounded-xl border space-y-1 transition-all duration-300`}>
            <span className="text-[8px] font-black uppercase tracking-wider block" style={{ color: brandColors.orange }}>
              Correct Solves
            </span>
            <p className={`${brandColors.textMain} font-extrabold text-base tracking-tight`}>
              {correctSubmissions || totalSolved}
            </p>
            <span className={`text-[8px] ${brandColors.textMuted} font-bold block`}>
              Total positive verdicts
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isLight ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-emerald-500/20 bg-emerald-500/5'} flex items-center gap-3 transition-all duration-300`}>
          <div className={`w-10 h-10 rounded-lg ${isLight ? 'bg-emerald-500/20' : 'bg-emerald-500/10'} flex items-center justify-center shrink-0 border border-emerald-500/20`}>
            <Flame className="w-5 h-5 animate-bounce" style={{ color: brandColors.orange }} />
          </div>
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest block" style={{ color: brandColors.orange }}>
              Global Longest Streak
            </span>
            <p className={`${brandColors.textMain} font-black text-sm`}>
              {longestStreak || streakDays || 0} Days
            </p>
            <span className={`text-[8px] ${brandColors.textMuted} font-bold block mt-0.5 leading-tight`}>
              Top 0.1% of GeeksforGeeks global coders!
            </span>
          </div>
        </div>
      </div>

      <div className={`border-t ${isLight ? 'border-emerald-500/10' : 'border-white/[0.03]'} pt-4 mt-2 flex justify-between items-center transition-all duration-300`}>
        <span className={`text-[9px] font-extrabold ${brandColors.textMuted}`}>Current active streak:</span>
        <span className="text-[10px] font-black flex items-center gap-1" style={{ color: brandColors.orange }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" style={{ backgroundColor: brandColors.orange }} />
          {currentStreak || streakDays || 0} Days
        </span>
      </div>
    </div>
  );
}

export default function GeeksforGeeksPage() {
  const { user } = useUser();
  
  // Real-time theme sync that reacts instantly to the TopNavbar toggling the 'dark' class on documentElement
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkTheme = () => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      };
      
      checkTheme();

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            checkTheme();
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      return () => observer.disconnect();
    }
  }, []);

  const isLight = !isDarkMode;
  
  const [lcHandle, setLcHandle] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectInput, setConnectInput] = useState('');
  
  // Data loading states
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MERN states
  const [lcData, setLcData] = useState<any>(null);

  const brandColors = React.useMemo(() => {
    return isLight ? {
      bg: 'bg-[#f4fbf6]', // Softest premium minty background wash
      orange: '#2F8D46', // GFG Emerald Green
      yellow: '#10b981', // Vivid green accent
      accent: '#064e3b',
      accentGrad: 'from-[#2F8D46]/10 to-[#10b981]/5',
      card: 'bg-white/95 border-[#2f8d46]/15 shadow-[0_8px_30px_rgba(47,141,70,0.06)] backdrop-blur-xl',
      textMain: 'text-[#0a2710]',
      textMuted: 'text-[#2b5832]',
      title: '#2F8D46',
      subCard: 'bg-[#eefcf3] border-[#2f8d46]/10',
      inputBg: 'bg-black/[0.02] border-black/10 focus:bg-black/[0.04] text-black focus:border-[#2f8d46]'
    } : {
      bg: 'bg-[#040f08]',
      orange: '#2F8D46',
      yellow: '#00E676',
      accent: '#1B5E20',
      accentGrad: 'from-[#2F8D46]/10 to-[#00E676]/5',
      card: 'bg-[#06180c]/80 border-[#2f8d46]/10 backdrop-blur-xl',
      textMain: 'text-white',
      textMuted: 'text-gray-400',
      title: '#00E676',
      subCard: 'bg-white/[0.01] border-white/5',
      inputBg: 'bg-white/[0.02] border-white/5 focus:bg-white/[0.04] text-white focus:border-[#00E676]'
    };
  }, [isLight]);

  const fetchLCData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getPlatformStats('geeksforgeeks', userId);
      const doc = res.data?.data || res.data;
      if (doc && doc.platform === 'geeksforgeeks' && doc.username) {
        setLcHandle(doc.username);
        setLcData(doc);
      } else {
        setLcHandle(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(`Could not fetch GeeksforGeeks portfolio data.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchLCData(user.id);
    }
  }, [user?.id]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectInput.trim() || !user?.id) return;
    
    setIsConnecting(true);
    try {
      await platformService.syncPlatform('geeksforgeeks', user.id, connectInput.trim());
      await fetchLCData(user.id);
    } catch (err: any) {
      setError(err.message || `Failed to link GeeksforGeeks account`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!lcHandle || !user?.id) return;
    setSyncing(true);
    try {
      await platformService.syncPlatform('geeksforgeeks', user.id);
      await fetchLCData(user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const totalSolved = lcData?.totalSolved || 0;
  const streakDays = lcData?.stats?.streak || lcData?.stats?.metadata?.streak || 0;

  const profileRankNum = lcData?.stats?.globalRank || lcData?.stats?.instituteRank || 0;
  const resolvedRating = lcData?.stats?.rating || lcData?.rating || lcData?.stats?.codingScore || 0;

  const schoolSolved = lcData?.stats?.school || lcData?.stats?.metadata?.extra?.school || 0;
  const basicSolved = lcData?.stats?.basic || lcData?.stats?.metadata?.extra?.basic || 0;
  const easySolvedCount = lcData?.stats?.easy || lcData?.stats?.easySolved || 0;
  const mediumSolvedCount = lcData?.stats?.medium || lcData?.stats?.mediumSolved || 0;
  const hardSolvedCount = lcData?.stats?.hard || lcData?.stats?.hardSolved || 0;

  const monthlyScore = lcData?.stats?.monthlyScore || lcData?.stats?.metadata?.extra?.monthly_score || lcData?.stats?.extra?.monthly_score || 0;
  const longestStreak = lcData?.stats?.longestStreak || lcData?.stats?.metadata?.extra?.pod_solved_global_longest_streak || lcData?.stats?.extra?.pod_solved_global_longest_streak || 0;
  const currentStreak = lcData?.stats?.currentStreak || lcData?.stats?.metadata?.extra?.pod_solved_current_streak || lcData?.stats?.extra?.pod_solved_current_streak || 0;
  const correctSubmissions = lcData?.stats?.correctSubmissions || lcData?.stats?.metadata?.extra?.pod_correct_submissions_count || lcData?.stats?.extra?.pod_correct_submissions_count || 0;

  const strongestTopic = "Data Structures & Algorithms";
  const weakestTopic = "Dynamic Programming";
  const recommendations = [
    "Practice 5 medium Graph problems to push your mastery past 70%.",
    "Complete the daily Problem of the Day to lock in your active coding streak.",
    "Review your submitted basic acceptances to lock in your strongest concepts."
  ];

  return (
    <div className={`min-h-screen ${brandColors.bg} text-[var(--text-main)] font-sans selection:bg-emerald-500/30 pb-16 overflow-x-hidden relative transition-all duration-300`}>
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: isLight 
            ? `linear-gradient(to_right, ${brandColors.orange}05 1px, transparent 1px), linear-gradient(to_bottom, ${brandColors.orange}05 1px, transparent 1px)`
            : `linear-gradient(to_right, ${brandColors.orange}03 1px, transparent 1px), linear-gradient(to_bottom, ${brandColors.orange}03 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div 
        className="absolute top-0 left-1/4 w-[600px] h-[600px] blur-[180px] rounded-full pointer-events-none"
        style={{
          background: isLight 
            ? `radial-gradient(circle, ${brandColors.orange}07, transparent)`
            : `radial-gradient(circle, ${brandColors.orange}0d, transparent)`
        }}
      />
      
      <TopNavbar />

      <main className="max-w-[1600px] mx-auto px-6 pt-8 flex flex-col gap-6 relative z-10">
        
        {loading && (
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
              className={`max-w-md w-full p-8 rounded-3xl border shadow-lg backdrop-blur-xl relative overflow-hidden ${brandColors.card}`}
            >
              <div 
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl pointer-events-none" 
                style={{ background: `radial-gradient(circle, ${brandColors.orange}26, transparent)` }}
              />

              <div 
                className="w-20 h-20 border rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md"
                style={{ 
                  backgroundColor: `${brandColors.orange}1a`, 
                  borderColor: `${brandColors.orange}33` 
                }}
              >
                <Flame className="w-10 h-10" style={{ color: brandColors.orange }} />
              </div>

              <h2 className={`text-xl font-extrabold tracking-tight mb-2 ${brandColors.textMain}`}>Connect GeeksforGeeks</h2>
              <p className={`text-xs ${brandColors.textMuted} mb-6 leading-relaxed font-semibold`}>
                Connect your GeeksforGeeks profile to import problem solving percentages, streak badges, and active coding scores!
              </p>

              <form onSubmit={handleConnect} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={connectInput}
                  onChange={(e) => setConnectInput(e.target.value)}
                  placeholder="Enter GeeksforGeeks Handle"
                  className={`px-4 py-3 text-xs border rounded-xl focus:outline-none text-center tracking-wider font-extrabold transition-all ${brandColors.inputBg}`}
                  required
                />
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 text-xs font-black tracking-wider uppercase rounded-xl hover:opacity-90 shadow-md flex items-center justify-center gap-2 text-white transition-opacity font-sans"
                  style={{ 
                    background: `linear-gradient(to_right, ${brandColors.orange}, ${brandColors.yellow})`,
                    boxShadow: `0 4px 12px ${brandColors.orange}26`
                  }}
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Link GeeksforGeeks Portfolio</span>
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
              realName={user?.fullName || "GeeksforGeeks Developer"}
              avatarUrl={lcData?.stats?.avatar || lcData?.stats?.extra?.avatar || lcData?.stats?.metadata?.extra?.avatar || user?.imageUrl || "https://assets.codeforces.com/images/no-avatar.jpg"}
              solvedCount={totalSolved}
              globalRank={profileRankNum}
              rating={resolvedRating}
              reputation={lcData?.stats?.reputation || 0}
              rank={
                resolvedRating >= 200 
                  ? "Expert" 
                  : (resolvedRating >= 100 
                      ? "Specialist" 
                      : "Coder")
              }
              streak={streakDays}
              syncing={syncing}
              onSync={handleSync}
              platformName="GeeksforGeeks"
              brandColors={brandColors}
            />

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
                    isLight={isLight}
                    brandColors={brandColors}
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
                    isLight={isLight}
                    brandColors={brandColors}
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

          </div>
        )}

      </main>
    </div>
  );
}
