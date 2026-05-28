"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
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

export default function LeetCodePage() {
  const { user } = useUser();
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

  const fetchLCData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getPlatformStats('leetcode', userId);
      const doc = res.data?.data || res.data;
      if (doc && doc.platform === 'leetcode' && doc.username) {
        setLcHandle(doc.username);
        setLcData(doc);
      } else {
        setLcHandle(null);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch LeetCode cache portfolio data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchLCData(user.id);
    }
  }, [user?.id]);

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
    fetchDaily();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectInput.trim() || !user?.id) return;
    
    setIsConnecting(true);
    try {
      await platformService.syncPlatform('leetcode', user.id, connectInput.trim());
      await fetchLCData(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to link LeetCode account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!lcHandle || !user?.id) return;
    setSyncing(true);
    try {
      await platformService.syncPlatform('leetcode', user.id);
      await fetchLCData(user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const brandColors = {
    bg: 'bg-[#050816]', // Dark futuristic UI
    orange: '#FFA116',
    yellow: '#FFD43B',
    accentGrad: 'from-[#FFA116]/10 to-[#FFD43B]/5',
  };

  const totalSolved = lcData?.totalSolved || 0;
  const globalRank = lcData?.rating || 0;
  const streakDays = lcData?.stats?.streak || lcData?.stats?.metadata?.streak || 0;

  const profileRankNum = lcData?.stats?.globalRank 
    ? parseInt(String(lcData.stats.globalRank).replace(/[^0-9]/g, '')) || 0 
    : 0;

  const historyFromStats = lcData?.stats?.metadata?.contests || lcData?.stats?.contests || [];
  const lastContestRating = Array.isArray(historyFromStats) && historyFromStats.length > 0
    ? historyFromStats[historyFromStats.length - 1]?.rating || 0
    : 0;
  const resolvedRating = lcData?.rating || lastContestRating || 0;

  const extraData = lcData?.stats?.extra || lcData?.stats?.metadata?.extra;
  const easySolved = extraData?.easy || 0;
  const mediumSolved = extraData?.medium || 0;
  const hardSolved = extraData?.hard || 0;
  const topPercent = extraData?.topPercentage || 0;

  const dbTopicsList = lcData?.stats?.topics || [];
  const fetchedTopics = Array.isArray(dbTopicsList) && dbTopicsList.length > 0
    ? dbTopicsList.map((t: any) => ({
        subject: t.subject || t.tagName || t.name,
        solved: t.solved || t.count || t.problemsSolved || 0,
        category: t.category || 'Fundamental'
      }))
    : [];

  // Dynamically map accepted code submissions logs
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

  // Dynamically detect language usage based on actual submission logs
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

  // Dynamically map platform achievements badges
  const badgesList = lcData?.stats?.badges || lcData?.stats?.metadata?.badges || [];
  const fetchedBadges = Array.isArray(badgesList) && badgesList.length > 0
    ? badgesList.map((name: string) => ({
        name,
        category: "Accolade",
        iconColor: "text-amber-500",
        unlocked: true,
        unlockedDate: "Verified",
        description: `Official LeetCode achievement`
      }))
    : undefined;

  // Dynamically map customizable performance analysis based on real sorted weights!
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

  // Dynamically map daily challenge question from synced database stats
  const dailyChallengeObj = lcData?.stats?.dailyChallenge || {};
  const dailyChallengeTitle = dailyChallengeObj.title || dynamicDailyChallenge?.title || "Course Schedule II";
  const dailyChallengeDifficulty = dailyChallengeObj.difficulty || dynamicDailyChallenge?.difficulty || "Medium";
  const dailyChallengeLink = dailyChallengeObj.link || dynamicDailyChallenge?.link || "https://leetcode.com/problemset/all/";

  const isChallengeCompleted = Array.isArray(fetchedSubmissions) && fetchedSubmissions.some(
    (s: any) => (s.problemName || '').toLowerCase() === dailyChallengeTitle.toLowerCase() && s.status === 'Accepted'
  );

  // Extract contest rank with robust fallbacks
  const contestHistory = lcData?.stats?.metadata?.contests || lcData?.stats?.contests || [];
  const lastContestRank = Array.isArray(contestHistory) && contestHistory.length > 0
    ? contestHistory[contestHistory.length - 1]?.rank || 0
    : 0;
  const globalContestRank = lcData?.stats?.extra?.globalRanking || lastContestRank || 0;

  return (
    <div className={`min-h-screen ${brandColors.bg} text-[var(--text-main)] font-sans selection:bg-orange-500/30 pb-16 overflow-x-hidden relative`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffa11602_1px,transparent_1px),linear-gradient(to_bottom,#ffa11602_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/5 to-transparent blur-[180px] rounded-full pointer-events-none" />
      
      <TopNavbar />

      <main className="max-w-[1600px] mx-auto px-6 pt-8 flex flex-col gap-6 relative z-10">
        
        {loading && lcHandle && (
          <div className="flex flex-col gap-6 w-full animate-pulse mt-4">
            <div className="h-44 bg-[#0B1023]/60 border border-white/5 rounded-2xl w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 h-[450px] bg-[#0B1023]/60 border border-white/5 rounded-2xl" />
              <div className="lg:col-span-9 h-[450px] bg-[#0B1023]/60 border border-white/5 rounded-2xl" />
            </div>
          </div>
        )}

        {!lcHandle && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] w-full text-center relative py-12 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="max-w-md w-full p-8 rounded-3xl bg-[#0B1023]/90 border border-orange-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#FFA116]/15 to-transparent rounded-full blur-2xl" />

              <div className="w-20 h-20 bg-gradient-to-tr from-orange-500/10 to-[#FFA116]/20 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Flame className="w-10 h-10 text-[#FFA116]" />
              </div>

              <h2 className="text-xl font-extrabold tracking-tight mb-2 text-white">Connect LeetCode</h2>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Connect your LeetCode profile to import problem solving percentages, streak badges, and active contest ratings!
              </p>

              <form onSubmit={handleConnect} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={connectInput}
                  onChange={(e) => setConnectInput(e.target.value)}
                  placeholder="Enter LeetCode Handle (e.g. mTQb0YqjQb)" 
                  className="px-4 py-3 text-xs bg-white/[0.02] border border-white/5 rounded-xl focus:outline-none focus:border-[#FFA116] focus:bg-white/[0.04] text-center tracking-wider font-bold text-white transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 text-xs font-black tracking-wider uppercase rounded-xl bg-gradient-to-r from-[#FFA116] to-[#FFD43B] hover:opacity-90 shadow-md shadow-orange-500/15 flex items-center justify-center gap-2 text-black transition-opacity"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Link LeetCode Portfolio</span>
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
              realName={user?.fullName || "LeetCode Developer"}
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
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <aside className="lg:col-span-2.5 xl:col-span-2 bg-[#0B1023]/60 border border-white/[0.08] rounded-2xl p-3 flex flex-col gap-1 sticky top-24 backdrop-blur-md shadow-2xl">
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
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 relative group ${
                      activeTab === tab.id 
                        ? 'text-[#FFA116] bg-orange-500/[0.05] border border-orange-500/20 shadow-[0_0_15px_rgba(255,161,22,0.06)]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-[#FFA116]' : 'text-gray-500'}`} />
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
                      contestsAttended={Array.isArray(lcData?.stats?.contests) ? lcData.stats.contests.length : (lcData?.stats?.contests || 0)}
                      globalContestRank={globalContestRank}
                      globalProfileRank={profileRankNum}
                      ratingHistory={
                        Array.isArray(lcData?.stats?.contests) && lcData.stats.contests.length > 0 
                          ? (lcData.stats.contests.length === 1 
                              ? [
                                  { contestName: "Start", rating: 1500, rank: 0, ratingChange: 0 },
                                  ...lcData.stats.contests
                                ]
                              : lcData.stats.contests)
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
                        <PerformanceInsights strongestTopic={strongestTopic} weakestTopic={weakestTopic} recommendations={recommendations} />
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
                      contestsAttended={Array.isArray(lcData?.stats?.contests) ? lcData.stats.contests.length : (lcData?.stats?.contests || 0)}
                      globalContestRank={globalContestRank}
                      globalProfileRank={profileRankNum}
                      ratingHistory={
                        Array.isArray(lcData?.stats?.contests) && lcData.stats.contests.length > 0 
                          ? (lcData.stats.contests.length === 1 
                              ? [
                                  { contestName: "Start", rating: 1500, rank: 0, ratingChange: 0 },
                                  ...lcData.stats.contests
                                ]
                              : lcData.stats.contests)
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
                        <PerformanceInsights strongestTopic={strongestTopic} weakestTopic={weakestTopic} recommendations={recommendations} />
                      </div>
                    </div>
                    <LanguageAnalytics languages={detectedLanguages} />
                  </motion.div>
                )}

              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
