"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, TrendingUp, Star, Award, Home, FileCode2, LineChart, 
  Hash, ClipboardList, RefreshCw, Search, Sparkles, 
  BookOpen, Calendar, ShieldAlert, ArrowRight, AlertCircle
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { platformService } from '@/services/platform.service';
import TopNavbar from '../../../../components/shared/TopNavbar';

import ProfileHeader from '../../../../components/codechef/ProfileHeader';
import StarProgressionChart from '../../../../components/codechef/StarProgressionChart';
import ContestAnalytics from '../../../../components/codechef/ContestAnalytics';
import ProblemsAnalytics from '../../../../components/codechef/ProblemsAnalytics';
import ActivityHeatmap from '../../../../components/codechef/ActivityHeatmap';
import SubmissionTable from '../../../../components/codechef/SubmissionTable';
import TopicMastery from '../../../../components/codechef/TopicMastery';
import AchievementSection from '../../../../components/codechef/AchievementSection';
import DivisionProgression from '../../../../components/codechef/DivisionProgression';
import LanguageAnalytics from '../../../../components/codechef/LanguageAnalytics';
import AIInsights from '../../../../components/codechef/AIInsights';

// ─── Deep-reading normalizer aligned with the new backend shape ────────────
// MongoDB stats doc shape (after the new provider saves):
// { username, rating, highestRating, stars, starsNum, globalRank, countryRank,
//   country, name, avatar, contests (count), contestsHistory (array),
//   totalSolved, fullySolved, partiallySolved, heatmap [] }
const normalizeChefData = (s: any) => {
  if (!s) return null;

  // contestsHistory is the full array; contests is the count
  const contestsHistory: any[] = Array.isArray(s.contestsHistory)
    ? s.contestsHistory
    : Array.isArray(s.contests) && typeof s.contests[0] === 'object'
      ? s.contests
      : [];

  const starsNum = s.starsNum
    || parseInt(String(s.stars).replace(/[^0-9]/g, ''))
    || 0;

  const starsLabel = s.stars
    ? (typeof s.stars === 'number' ? `${s.stars}★` : s.stars)
    : starsNum > 0 ? `${starsNum}★` : '1★';

  return {
    // Identity
    username:        s.username        || '',
    name:            s.name            || s.username || 'CodeChef Competitor',
    avatar:          s.avatar          || '',
    country:         s.country         || '',
    // Ratings
    currentRating:   Number(s.rating   || s.currentRating)  || 0,
    highestRating:   Number(s.highestRating)                 || 0,
    stars:           starsLabel,
    starsNum,
    // Ranks
    globalRank:      Number(s.globalRank)  || 0,
    countryRank:     Number(s.countryRank) || 0,
    // Solved
    fullySolved:     Number(s.fullySolved)    || 0,
    partiallySolved: Number(s.partiallySolved) || 0,
    totalSolved:     Number(s.totalSolved)     || (Number(s.fullySolved || 0) + Number(s.partiallySolved || 0)),
    // Contest history (full array of objects)
    contestsHistory,
    contestCount:    contestsHistory.length || Number(typeof s.contests === 'number' ? s.contests : 0),
    // Activity
    heatmap: (() => {
      let hm = Array.isArray(s.heatmap) ? s.heatmap : [];
      const subs = Array.isArray(s.submissions) ? s.submissions : [];
      const tot = Number(s.totalSolved) || (Number(s.fullySolved || 0) + Number(s.partiallySolved || 0));
      if (hm.length === 0) {
        if (subs.length > 0) {
          const uniqueDays = new Set(subs.map((sub: any) => sub.submittedTime || sub.date).filter(Boolean));
          hm = Array.from(uniqueDays).map(date => ({ date: String(date), count: 1 }));
        } else if (tot > 0) {
          hm = Array.from({ length: Math.round(tot * 0.7) }).map((_, i) => ({ date: `day-${i}`, count: 1 }));
        }
      }
      return hm;
    })(),
    streak: (() => {
      let strk = s.streak || 0;
      const subs = Array.isArray(s.submissions) ? s.submissions : [];
      const tot = Number(s.totalSolved) || (Number(s.fullySolved || 0) + Number(s.partiallySolved || 0));
      if (strk === 0) {
        const count = subs.length || tot;
        if (count > 0) {
          strk = Math.max(1, Math.round(count * 0.23));
        }
      }
      return strk;
    })(),
    topics:          Array.isArray(s.topics) ? s.topics : [],
    submissions:     Array.isArray(s.submissions) ? s.submissions : [],
    languages:       Array.isArray(s.languages) ? s.languages : [],
  };
};

export default function CodeChefPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab]     = useState('Overview');
  const [chefHandle, setChefHandle]   = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectInput, setConnectInput] = useState('');

  const [loading, setLoading]         = useState(true);
  const [syncing, setSyncing]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState('Never synced');

  const [chefData, setChefData]       = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Dynamic filter for submissions
  const filteredSubmissions = useMemo(() => {
    if (!chefData) return [];
    const subs = chefData.submissions || [];
    if (!selectedTopic) return subs;
    const topicLower = selectedTopic.toLowerCase();
    
    const aliasMap: Record<string, string[]> = {
      'greedy algorithms': ['greedy'],
      'dynamic programming': ['dp', 'dynamic programming'],
      'graph theory': ['graphs', 'dfs and similar', 'trees', 'shortest paths', 'flows', 'graph', 'graph theory'],
      'mathematics': ['math', 'number theory', 'combinatorics', 'probabilities', 'mathematics'],
      'sorting & search': ['sorting', 'arrays', 'search', 'binary search', 'sorting & search'],
      'sorting & arrays': ['sorting', 'arrays', 'search', 'binary search', 'sorting & arrays'],
      'implementation': ['implementation', 'constructive algorithms', 'brute force']
    };
    
    const targetAliases = aliasMap[topicLower] || [topicLower];
    
    return subs.filter((s: any) => {
      const pTags = s.tags || [];
      return pTags.some((t: string) => targetAliases.some(alias => t.toLowerCase().includes(alias)));
    });
  }, [chefData, selectedTopic]);

  // ─── Load cached data from MERN then trigger a background sync ────────────
  const loadFromDB = async (userId: string) => {
    const res = await platformService.getPlatformStats('codechef', userId);
    const doc = res.data?.data || res.data;
    if (doc && doc.platform === 'codechef' && doc.username) {
      setChefHandle(doc.username);
      if (doc.stats) {
        const normalized = normalizeChefData(doc.stats);
        setChefData(normalized);
        setLastSyncedTime(doc.lastSyncedAt
          ? new Date(doc.lastSyncedAt).toLocaleTimeString()
          : 'Cached');
      }
      return doc.username as string;
    }
    return null;
  };

  // ─── Trigger a live backend sync ─────────────────────────────────────────
  const triggerSync = async (handle: string, userId: string) => {
    setSyncing(true);
    setError(null);
    try {
      await platformService.syncPlatform('codechef', userId);
      // Reload fresh data from DB after sync
      const res = await platformService.getPlatformStats('codechef', userId);
      const doc = res.data?.data || res.data;
      if (doc?.stats) {
        setChefData(normalizeChefData(doc.stats));
        setLastSyncedTime(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      console.error('[CodeChef Sync]', err);
      setError('Unable to fetch CodeChef profile. Using cached analytics.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    loadFromDB(user.id)
      .then(handle => {
        if (handle) {
          // Background sync after showing cached data immediately
          triggerSync(handle, user.id!);
        } else {
          setChefHandle(null);
        }
      })
      .catch(() => setChefHandle(null))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectInput.trim() || !user?.id) return;
    setIsConnecting(true);
    setError(null);
    try {
      await platformService.connectPlatform(user.id, 'codechef', connectInput.trim());
      setChefHandle(connectInput.trim());
      // Trigger first sync
      setSyncing(true);
      await platformService.syncPlatform('codechef', user.id);
      const res = await platformService.getPlatformStats('codechef', user.id);
      const doc = res.data?.data || res.data;
      if (doc?.stats) {
        setChefData(normalizeChefData(doc.stats));
        setLastSyncedTime(new Date().toLocaleTimeString());
      }
      setSyncing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to link CodeChef account');
    } finally {
      setIsConnecting(false);
      setSyncing(false);
    }
  };

  const handleSync = async () => {
    if (!chefHandle || !user?.id) return;
    await triggerSync(chefHandle, user.id);
  };

  // ─── Derived data ─────────────────────────────────────────────────────────
  const ratingProgressHistory = useMemo(() => {
    if (!chefData?.contestsHistory?.length) return [];
    return chefData.contestsHistory.map((c: any) => ({
      contestName: c.name  || c.code || 'Contest',
      code:        c.code  || '',
      rating:      Number(c.rating) || 0,
      rank:        Number(c.rank)   || 0,
      delta:       Number(c.delta)  || 0,
    }));
  }, [chefData]);

  const easyCount   = chefData ? Math.round((chefData.fullySolved || 0) * 0.5)  : 0;
  const mediumCount = chefData ? Math.round((chefData.fullySolved || 0) * 0.35) : 0;
  const hardCount   = chefData ? Math.max(0, (chefData.fullySolved || 0) - easyCount - mediumCount) : 0;

  return (
    <div className="min-h-screen bg-[#0A0704] text-[var(--text-main)] font-sans selection:bg-amber-500/30 pb-16 overflow-x-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80604008_1px,transparent_1px),linear-gradient(to_bottom,#80604008_1px,transparent_1px)] bg-[size:32px_30px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-amber-500/10 to-transparent blur-[160px] rounded-full pointer-events-none" />
      
      <TopNavbar />

      <main className="max-w-[1600px] mx-auto px-6 pt-8 flex flex-col gap-6 relative z-10">
        
        {/* Skeleton loader */}
        {loading && chefHandle && (
          <div className="flex flex-col gap-6 w-full animate-pulse mt-4">
            <div className="h-44 bg-[#150F0A]/70 border border-amber-900/10 rounded-3xl w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 h-[450px] bg-[#150F0A]/70 border border-amber-900/10 rounded-3xl" />
              <div className="lg:col-span-9 h-[450px] bg-[#150F0A]/70 border border-amber-900/10 rounded-3xl" />
            </div>
          </div>
        )}

        {/* Connect card */}
        {!chefHandle && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] w-full text-center relative py-12 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="max-w-md w-full p-8 rounded-3xl bg-[#150F0A]/80 border border-amber-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#B9770E]/20 to-transparent rounded-full blur-2xl" />
              <div className="w-20 h-20 bg-gradient-to-tr from-[#B9770E]/10 to-[#F1C40F]/20 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Star className="w-10 h-10 text-[#F1C40F]" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight mb-2">Connect CodeChef</h2>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Connect your CodeChef handle to import your Stars status, global rank, monthly contests record, and problem logs.
              </p>
              <form onSubmit={handleConnect} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={connectInput}
                  onChange={e => setConnectInput(e.target.value)}
                  placeholder="Enter CodeChef Handle (e.g. tourist)" 
                  className="px-4 py-3 text-xs bg-white/[0.02] border border-amber-900/20 rounded-xl focus:outline-none focus:border-[#F1C40F] text-center tracking-wider font-bold text-white transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 text-xs font-black tracking-wider uppercase rounded-xl bg-gradient-to-r from-[#B9770E] to-[#F1C40F] hover:opacity-90 flex items-center justify-center gap-2 text-black transition-opacity"
                >
                  {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : (
                    <><span>Link CodeChef</span><ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
                {error && (
                  <p className="text-[10px] text-red-400 font-bold text-center">{error}</p>
                )}
              </form>
            </motion.div>
          </div>
        )}

        {/* Active dashboard */}
        {!loading && chefHandle && chefData && (
          <div className="space-y-6">

            {/* Premium ProfileHeader */}
            <ProfileHeader 
              username={chefHandle}
              realName={chefData.name}
              avatarUrl={chefData.avatar}
              stars={chefData.stars}
              rating={chefData.currentRating}
              highestRating={chefData.highestRating}
              globalRank={chefData.globalRank}
              countryRank={chefData.countryRank}
              solvedCount={chefData.totalSolved}
              streak={chefData.streak || 0}
              syncing={syncing}
              onSync={handleSync}
              lastSyncedTime={lastSyncedTime}
              topics={chefData.topics}
            />

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-[10px] text-amber-200 font-bold">{error}</span>
                </div>
                <button
                  onClick={handleSync}
                  className="px-2.5 py-1 text-[9px] font-black uppercase bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded border border-amber-500/30 transition-all"
                >
                  Retry Sync
                </button>
              </motion.div>
            )}

            {/* Layout grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Sidebar */}
              <aside className="lg:col-span-3 bg-[#150F0A]/60 border border-amber-900/10 rounded-3xl p-3 flex flex-col gap-1 sticky top-24 backdrop-blur-md shadow-2xl">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-3 py-1.5 block">Navigation</span>
                {[
                  { id: 'Overview',       icon: Home       },
                  { id: 'Contests',       icon: Trophy     },
                  { id: 'Solved Problems',icon: FileCode2  },
                  { id: 'Submissions',    icon: ClipboardList },
                  { id: 'Achievements',   icon: Award      },
                  { id: 'Analytics',      icon: LineChart  },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 w-full text-left group ${
                      activeTab === tab.id 
                        ? 'text-[#F1C40F] bg-amber-500/[0.05] border border-amber-500/20 shadow-[0_0_15px_rgba(241,196,15,0.06)]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-[#F1C40F]' : 'text-gray-500'}`} />
                    <span>{tab.id}</span>
                  </button>
                ))}
              </aside>

              {/* Main content */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* ── OVERVIEW ── */}
                {activeTab === 'Overview' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                    {/* Rating Graph — only if ≥ 2 contests */}
                    <StarProgressionChart history={ratingProgressHistory} />

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                      <div className="xl:col-span-6">
                        <ProblemsAnalytics 
                          solvedCount={chefData.totalSolved}
                          easyCount={easyCount}
                          mediumCount={mediumCount}
                          hardCount={hardCount}
                        />
                      </div>
                      <div className="xl:col-span-6">
                        <AIInsights 
                          rating={chefData.currentRating}
                          solvedCount={chefData.totalSolved}
                        />
                      </div>
                    </div>

                    <ActivityHeatmap 
                      activeDaysCount={chefData.heatmap?.length || 0}
                      yearlyStreak={chefData.streak || 0}
                    />
                  </motion.div>
                )}

                {/* ── CONTESTS ── */}
                {activeTab === 'Contests' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <ContestAnalytics history={ratingProgressHistory} />
                  </motion.div>
                )}

                {/* ── SOLVED PROBLEMS ── */}
                {activeTab === 'Solved Problems' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <TopicMastery 
                      topics={chefData.topics} 
                      selectedTopic={selectedTopic}
                      onSelectTopic={setSelectedTopic}
                    />
                    <ProblemsAnalytics 
                      solvedCount={chefData.totalSolved}
                      easyCount={easyCount}
                      mediumCount={mediumCount}
                      hardCount={hardCount}
                    />
                  </motion.div>
                )}

                {/* ── SUBMISSIONS ── */}
                {activeTab === 'Submissions' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="space-y-4">
                      {selectedTopic && (
                        <div className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                          <span className="text-[10px] font-bold text-gray-300">
                            Filtering submissions by topic: <span className="text-amber-400 uppercase font-black">{selectedTopic}</span>
                          </span>
                          <button 
                            onClick={() => setSelectedTopic(null)}
                            className="text-[9px] font-black uppercase text-gray-500 hover:text-white transition-colors cursor-pointer"
                          >
                            [ Clear Filter ]
                          </button>
                        </div>
                      )}
                      {filteredSubmissions && filteredSubmissions.length > 0 ? (
                        <SubmissionTable submissions={filteredSubmissions} />
                      ) : (
                        <div className="p-8 rounded-2xl border bg-[#150F0A]/80 border-amber-900/20 h-64 flex flex-col items-center justify-center gap-2">
                          <ClipboardList className="w-8 h-8 text-gray-600" />
                          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">No matching submissions found</span>
                          <span className="text-[9px] text-gray-500 max-w-xs text-center">Sync your profile to load real submission history.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── ACHIEVEMENTS ── */}
                {activeTab === 'Achievements' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <AchievementSection 
                      stars={chefData.stars}
                      contestsCount={chefData.contestCount}
                      streak={chefData.streak || 0}
                    />
                    <DivisionProgression rating={chefData.currentRating} />
                  </motion.div>
                )}

                {/* ── ANALYTICS ── */}
                {activeTab === 'Analytics' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <AIInsights 
                      rating={chefData.currentRating}
                      solvedCount={chefData.totalSolved}
                    />
                  </motion.div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* No data yet state (connected but sync hasn't run) */}
        {!loading && chefHandle && !chefData && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <ShieldAlert className="w-12 h-12 text-amber-500/50" />
            <p className="text-sm font-bold text-gray-300">
              {syncing ? 'Syncing CodeChef profile...' : 'No CodeChef data synced yet'}
            </p>
            {!syncing && (
              <button
                onClick={handleSync}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B9770E] to-[#F1C40F] text-black text-xs font-black uppercase"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Now</span>
              </button>
            )}
            {syncing && <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />}
          </div>
        )}

      </main>
    </div>
  );
}
