"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Home, FileCode2, LineChart, 
  ClipboardList, RefreshCw, Sparkles, Hash, Cpu, ArrowRight
} from 'lucide-react';

import { useUser } from '@clerk/nextjs';
import { platformService } from '@/services/platform.service';
import TopNavbar from '../../../../components/shared/TopNavbar';

import ProfileHeader from '../../../../components/codeforces/ProfileHeader';
import RatingProgressionChart from '../../../../components/codeforces/RatingProgressionChart';
import ContestAnalytics from '../../../../components/codeforces/ContestAnalytics';
import ProblemsAnalytics from '../../../../components/codeforces/ProblemsAnalytics';
import TagsMastery from '../../../../components/codeforces/TagsMastery';
import TopicMastery from '../../../../components/codechef/TopicMastery';
import SubmissionTable from '../../../../components/codeforces/SubmissionTable';
import ActivityHeatmap from '../../../../components/codeforces/ActivityHeatmap';
import ContestHistoryTimeline from '../../../../components/codeforces/ContestHistoryTimeline';
import LanguageAnalytics from '../../../../components/codeforces/LanguageAnalytics';
import RankAchievements from '../../../../components/codeforces/RankAchievements';
import AIInsights from '../../../../components/codeforces/AIInsights';

export default function CodeforcesPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('Overview');
  const [cfHandle, setCfHandle] = useState<string | null>(null);
  const [cfData, setCfData] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectInput, setConnectInput] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Data loading states
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Never synced');

  const fetchCFData = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getPlatformStats('codeforces', userId);
      const doc = res.data?.data || res.data;
      if (doc && doc.platform === 'codeforces' && doc.username) {
        setCfHandle(doc.username);
        setCfData(doc);
        if (doc.lastSyncedAt) {
          setLastSyncedTime(new Date(doc.lastSyncedAt).toLocaleString());
        }
      } else {
        setCfHandle(null);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch Codeforces cache portfolio data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCFData(user.id);
    }
  }, [user?.id]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectInput.trim() || !user?.id) return;
    
    setIsConnecting(true);
    setError(null);
    try {
      await platformService.connectPlatform(user.id, 'codeforces', connectInput.trim());
      await fetchCFData(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to link Codeforces account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!cfHandle || !user?.id) return;
    setSyncing(true);
    setError(null);
    try {
      await platformService.syncPlatform('codeforces', user.id);
      await fetchCFData(user.id);
    } catch (err: any) {
      console.error(err);
      setError('Unable to sync Codeforces data. Using cached records.');
    } finally {
      setSyncing(false);
    }
  };

  // Construct standard compatibility userInfo structure for sub-widgets
  const userInfo = useMemo(() => {
    if (!cfData) return null;
    const extra = cfData.stats?.metadata?.extra || {};
    return {
      handle: cfData.username,
      firstName: extra.organization || 'Codeforces',
      lastName: 'Competitor',
      avatar: cfData.stats?.avatar || '',
      titlePhoto: cfData.stats?.avatar || '',
      rank: cfData.stats?.stars || 'Newbie',
      maxRank: extra.maxRank || 'Newbie',
      rating: cfData.rating || 0,
      maxRating: cfData.stats?.metadata?.highestRating || 0,
      contribution: extra.contribution || 0,
      friendOfCount: extra.friendCount || 0
    };
  }, [cfData]);

  // Process Solved Problems list
  const solvedProblemsList = useMemo(() => {
    if (!cfData) return [];
    const subs = cfData.stats?.metadata?.submissions || [];
    return subs.filter((s: any) => s.success).map((s: any, idx: number) => ({
      id: String(idx),
      name: s.name.split(':')[1] || s.name,
      contestId: s.name.split('-')[0] || '0',
      index: s.name.split('-')[1]?.split(':')[0] || 'A',
      rating: s.diff !== 'N/A' ? parseInt(s.diff) : 0,
      tags: s.tags || [],
      language: s.language,
      time: s.date
    }));
  }, [cfData]);

  // Construct standard submissions list for SubmissionTable
  const submissionsList = useMemo(() => {
    if (!cfData) return [];
    const subs = cfData.stats?.metadata?.submissions || [];
    return subs.map((s: any, idx: number) => ({
      id: String(idx),
      problemName: s.name.split(':')[1] || s.name,
      contestId: parseInt(s.name.split('-')[0]) || 0,
      problemIndex: s.name.split('-')[1]?.split(':')[0] || 'A',
      difficulty: s.diff !== 'N/A' ? parseInt(s.diff) : 0,
      language: s.language,
      runtime: s.executionTime,
      memory: s.memory,
      status: s.status,
      submittedTime: s.date,
      tags: s.tags || []
    }));
  }, [cfData]);

  // Filter solved list based on selected tag
  const filteredSolvedProblemsList = useMemo(() => {
    if (!selectedTag) return solvedProblemsList;
    const tagLower = selectedTag.toLowerCase();
    const aliasMap: Record<string, string[]> = {
      'greedy': ['greedy'],
      'dp': ['dp', 'dynamic programming'],
      'graphs': ['graphs', 'dfs and similar', 'trees', 'shortest paths', 'flows', 'graph'],
      'math': ['math', 'number theory', 'combinatorics', 'probabilities'],
      'binary search': ['binary search'],
      'strings': ['strings', 'string suffix structures'],
      'implementation': ['implementation', 'constructive algorithms', 'brute force']
    };
    const aliases = aliasMap[tagLower] || [tagLower];
    return solvedProblemsList.filter((p: any) => 
      p.tags?.some((t: string) => aliases.some(alias => t.toLowerCase().includes(alias)))
    );
  }, [solvedProblemsList, selectedTag]);

  // Filter submissions list based on selected tag
  const filteredSubmissionsList = useMemo(() => {
    if (!selectedTag) return submissionsList;
    const tagLower = selectedTag.toLowerCase();
    const aliasMap: Record<string, string[]> = {
      'greedy': ['greedy'],
      'dp': ['dp', 'dynamic programming'],
      'graphs': ['graphs', 'dfs and similar', 'trees', 'shortest paths', 'flows', 'graph'],
      'math': ['math', 'number theory', 'combinatorics', 'probabilities'],
      'binary search': ['binary search'],
      'strings': ['strings', 'string suffix structures'],
      'implementation': ['implementation', 'constructive algorithms', 'brute force']
    };
    const aliases = aliasMap[tagLower] || [tagLower];
    return submissionsList.filter((s: any) => 
      s.tags?.some((t: string) => aliases.some(alias => t.toLowerCase().includes(alias)))
    );
  }, [submissionsList, selectedTag]);

  // Process rating progression
  const ratingProgressHistory = useMemo(() => {
    if (!cfData) return [];
    const history = cfData.stats?.metadata?.extra?.contests || [];
    return history.map((pt: any) => ({
      contestId: pt.contestName ? parseInt(pt.contestName.replace(/[^0-9]/g, '')) || 0 : 0,
      contestName: pt.contestName || 'Codeforces Round',
      rank: pt.rank || 0,
      oldRating: pt.rating - pt.ratingChange,
      newRating: pt.rating || 0,
      ratingUpdateTimeSeconds: pt.date ? new Date(pt.date).getTime() / 1000 : 0
    }));
  }, [cfData]);

  const parsedTags = useMemo(() => {
    if (!cfData) return [];
    const topics = cfData.stats?.metadata?.topics || [];
    return topics.map((t: any) => ({
      name: t.subject,
      value: t.solved
    }));
  }, [cfData]);

  const streakDays = cfData?.stats?.metadata?.streak || 0;
  const heatmapData = cfData?.stats?.metadata?.extra?.heatmap || [];

  const brandColors = {
    bg: 'bg-[#06080F]',
    card: 'bg-[#0B1023]/75 border-white/[0.08] backdrop-blur-md shadow-2xl',
  };

  return (
    <div className={`min-h-screen ${brandColors.bg} text-[var(--text-main)] font-sans selection:bg-[#4DA3FF]/30 pb-16 overflow-x-hidden relative`}>
      {/* Decorative Grid Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_30px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/10 to-transparent blur-[160px] rounded-full pointer-events-none" />
      
      <TopNavbar />

      <main className="max-w-[1600px] mx-auto px-6 pt-8 flex flex-col gap-6 relative z-10">
        
        {loading && cfHandle && (
          <div className="flex flex-col gap-6 w-full animate-pulse mt-4">
            <div className="h-44 bg-[#0B1023]/70 border border-white/5 rounded-3xl w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 h-[450px] bg-[#0B1023]/70 border border-white/5 rounded-3xl" />
              <div className="lg:col-span-9 h-[450px] bg-[#0B1023]/70 border border-white/5 rounded-3xl" />
            </div>
          </div>
        )}

        {!cfHandle && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] w-full text-center relative py-12 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="max-w-md w-full p-8 rounded-3xl bg-[#0B1023]/80 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#4DA3FF]/20 to-transparent rounded-full blur-2xl" />

              <div className="w-20 h-20 bg-gradient-to-tr from-[#4DA3FF]/10 to-[#FF5C5C]/20 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/5">
                <Trophy className="w-10 h-10 text-[#4DA3FF]" />
              </div>

              <h2 className="text-xl font-extrabold tracking-tight mb-2">Connect Codeforces</h2>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Unlock automated competitive analytics, dynamic rating progression, division milestones, tag mastery grids, and rolling submission tracking.
              </p>

              <form onSubmit={handleConnect} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={connectInput}
                  onChange={(e) => setConnectInput(e.target.value)}
                  placeholder="Enter Codeforces Handle (e.g. tourist)" 
                  className="px-4 py-3 text-xs bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-[#4DA3FF] focus:bg-white/[0.04] text-center tracking-wider font-bold text-white transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 text-xs font-black tracking-wider uppercase rounded-xl bg-gradient-to-r from-[#4DA3FF] to-[#FF5C5C] hover:opacity-90 shadow-md shadow-blue-500/15 flex items-center justify-center gap-2 text-black transition-opacity"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Link Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Syncing indicator */}
        {syncing && (
          <div className="fixed bottom-6 right-6 bg-[#0E121E] border border-[#4DA3FF]/20 p-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50 backdrop-blur-md animate-bounce">
            <RefreshCw className="w-5 h-5 text-[#4DA3FF] animate-spin" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Syncing latest submissions...</span>
              <span className="text-[9px] text-gray-500 font-semibold mt-0.5">Updating Codeforces analytics...</span>
            </div>
          </div>
        )}

        {!loading && cfHandle && userInfo && (
          <div className="space-y-6">
            
            {/* Hero Profile Section */}
            <ProfileHeader 
              username={userInfo.handle}
              realName={cfData?.stats?.metadata?.extra?.organization || "Codeforces star candidate"}
              avatarUrl={userInfo.titlePhoto || userInfo.avatar}
              rank={userInfo.rank || 'Newbie'}
              maxRank={userInfo.maxRank || 'Newbie'}
              rating={userInfo.rating || 0}
              maxRating={userInfo.maxRating || 0}
              contestsCount={ratingProgressHistory.length}
              solvedCount={cfData?.totalSolved || 0}
              syncing={syncing}
              onSync={handleSync}
              lastSyncedTime={lastSyncedTime}
              error={error}
            />

            {/* Sidebar & Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Sticky Sidebar */}
              <aside className="lg:col-span-3 bg-[#0B1023]/60 border border-white/[0.06] rounded-3xl p-3 flex flex-col gap-1 sticky top-24 backdrop-blur-md shadow-2xl">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-3 py-1.5 block">Navigation</span>
                {[
                  { id: 'Overview', icon: Home },
                  { id: 'Contests', icon: Trophy },
                  { id: 'Rating Graph', icon: LineChart },
                  { id: 'Solved Problems', icon: FileCode2 },
                  { id: 'Problem Tags', icon: Hash },
                  { id: 'Submissions', icon: ClipboardList },
                  { id: 'Analytics', icon: Cpu }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 w-full text-left group ${
                      activeTab === tab.id 
                        ? 'text-[#4DA3FF] bg-blue-500/[0.05] border border-[#4DA3FF]/20 shadow-[0_0_15px_rgba(77,163,255,0.06)]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-[#4DA3FF]' : 'text-gray-500'}`} />
                    <span>{tab.id}</span>
                  </button>
                ))}
              </aside>

              {/* Main Content Area */}
              <div className="lg:col-span-9 space-y-6">
                
                {activeTab === 'Overview' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <RatingProgressionChart history={ratingProgressHistory} />

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                      <div className="xl:col-span-6">
                        <ProblemsAnalytics 
                          solvedCount={solvedProblemsList.length}
                          easyCount={solvedProblemsList.filter((p: any) => p.rating < 1200).length}
                          mediumCount={solvedProblemsList.filter((p: any) => p.rating >= 1200 && p.rating < 1600).length}
                          hardCount={solvedProblemsList.filter((p: any) => p.rating >= 1600 && p.rating < 2000).length}
                          eliteCount={solvedProblemsList.filter((p: any) => p.rating >= 2000).length}
                        />
                      </div>
                      <div className="xl:col-span-6">
                        <TagsMastery 
                          tags={parsedTags}
                          solvedCount={solvedProblemsList.length}
                        />
                      </div>
                    </div>

                    <AIInsights 
                      solvedCount={solvedProblemsList.length}
                      rating={userInfo.rating || 0}
                      maxRating={userInfo.maxRating || 0}
                    />

                    <ActivityHeatmap 
                      activityData={heatmapData}
                      streak={streakDays}
                      activeDaysCount={heatmapData.length}
                    />
                  </motion.div>
                )}

                {activeTab === 'Contests' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <ContestAnalytics history={ratingProgressHistory} />
                    <ContestHistoryTimeline history={ratingProgressHistory} />
                  </motion.div>
                )}

                {activeTab === 'Rating Graph' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <RatingProgressionChart history={ratingProgressHistory} />
                  </motion.div>
                )}

                {activeTab === 'Solved Problems' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <TopicMastery topics={cfData?.stats?.metadata?.topics || []} />

                    <ProblemsAnalytics 
                      solvedCount={cfData?.totalSolved || 0}
                      easyCount={solvedProblemsList.filter((p: any) => p.rating < 1200).length}
                      mediumCount={solvedProblemsList.filter((p: any) => p.rating >= 1200 && p.rating < 1600).length}
                      hardCount={solvedProblemsList.filter((p: any) => p.rating >= 1600 && p.rating < 2000).length}
                      eliteCount={solvedProblemsList.filter((p: any) => p.rating >= 2000).length}
                    />

                    <TagsMastery 
                      tags={parsedTags}
                      solvedCount={solvedProblemsList.length}
                      selectedTag={selectedTag}
                      onSelectTag={setSelectedTag}
                    />
                  </motion.div>
                )}

                {activeTab === 'Problem Tags' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <TagsMastery 
                      tags={parsedTags}
                      solvedCount={solvedProblemsList.length}
                      selectedTag={selectedTag}
                      onSelectTag={setSelectedTag}
                    />
                  </motion.div>
                )}

                {activeTab === 'Submissions' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="space-y-4">
                      {selectedTag && (
                        <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-[#4DA3FF]/20 rounded-2xl">
                          <span className="text-[10px] font-bold text-gray-300">
                            Filtering submissions by tag: <span className="text-[#4DA3FF] uppercase font-black">{selectedTag}</span>
                          </span>
                          <button 
                            onClick={() => setSelectedTag(null)}
                            className="text-[9px] font-black uppercase text-gray-500 hover:text-white transition-colors cursor-pointer"
                          >
                            [ Clear Filter ]
                          </button>
                        </div>
                      )}
                      <SubmissionTable submissions={filteredSubmissionsList} />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'Analytics' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <RankAchievements 
                      currentRating={userInfo.rating || 0}
                      currentRank={userInfo.rank || 'Newbie'}
                    />

                    <LanguageAnalytics submissions={submissionsList} />

                    <AIInsights 
                      solvedCount={solvedProblemsList.length}
                      rating={userInfo.rating || 0}
                      maxRating={userInfo.maxRating || 0}
                    />
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
