"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Home, RefreshCw, Sparkles, Calendar, 
  Target, AlertCircle, LineChart, ClipboardList, Code2, Activity
} from 'lucide-react';
import { animate } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { platformService } from '@/services/platform.service';
import TopNavbar from '../../../../components/shared/TopNavbar';

// Import newly created premium AtCoder components
import ActivityHeatmap from '../../../../components/atcoder/ActivityHeatmap';
import SubmissionTable from '../../../../components/atcoder/SubmissionTable';
import ContestAnalytics from '../../../../components/atcoder/ContestAnalytics';
import LanguageAnalytics from '../../../../components/atcoder/LanguageAnalytics';
import TopicMastery from '../../../../components/atcoder/TopicMastery';
import AccuracyAnalytics from '../../../../components/atcoder/AccuracyAnalytics';

// AtCoder colour bands mapper
const getAtCoderColors = (rating: number) => {
  if (rating >= 2800) return { name: 'Red',    color: '#FF0000', glow: 'rgba(255,0,0,0.4)'   };
  if (rating >= 2400) return { name: 'Orange', color: '#FF8000', glow: 'rgba(255,128,0,0.4)' };
  if (rating >= 2000) return { name: 'Yellow', color: '#C0C000', glow: 'rgba(192,192,0,0.3)' };
  if (rating >= 1600) return { name: 'Blue',   color: '#0000FF', glow: 'rgba(0,0,255,0.3)'   };
  if (rating >= 1200) return { name: 'Cyan',   color: '#00C0C0', glow: 'rgba(0,192,192,0.2)' };
  if (rating >= 800)  return { name: 'Green',  color: '#008000', glow: 'rgba(0,128,0,0.2)'   };
  if (rating >= 400)  return { name: 'Brown',  color: '#804000', glow: 'rgba(128,64,0,0.1)'  };
  return                      { name: 'Gray',   color: '#808080', glow: 'rgba(128,128,128,0.1)'};
};

const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const ctrl = animate(0, value, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate: v => setCount(Math.floor(v))
    });
    return () => ctrl.stop();
  }, [value]);
  return <>{count.toLocaleString()}</>;
};

const InitialsAvatar = ({ handle, color }: { handle: string; color: string }) => (
  <div
    className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-xl text-white select-none border-2 shadow-lg"
    style={{
      background: `linear-gradient(135deg, ${color}40, ${color}90)`,
      borderColor: color,
      boxShadow: `0 0 15px ${color}30`
    }}
  >
    {handle.slice(0, 2).toUpperCase()}
  </div>
);

export default function AtCoderPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('Overview');
  const [atCoderHandle, setAtCoderHandle] = useState<string | null>(null);
  const [atCoderData, setAtCoderData] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectInput, setConnectInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Never synced');

  const fetchAtCoderCache = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getPlatformStats('atcoder', userId);
      const doc = res.data?.data || res.data;
      if (doc && doc.platform === 'atcoder' && doc.username) {
        setAtCoderHandle(doc.username);
        setAtCoderData(doc);
        if (doc.lastSyncedAt) {
          setLastSyncedTime(new Date(doc.lastSyncedAt).toLocaleString());
        }
      } else {
        setAtCoderHandle(null);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch AtCoder cache portfolio data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAtCoderCache(user.id);
    }
  }, [user?.id]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectInput.trim() || !user?.id) return;
    setIsConnecting(true);
    setError(null);
    try {
      await platformService.connectPlatform(user.id, 'atcoder', connectInput.trim());
      await fetchAtCoderCache(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to link AtCoder account');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!atCoderHandle || !user?.id) return;
    setSyncing(true);
    setError(null);
    try {
      await platformService.syncPlatform('atcoder', user.id);
      await fetchAtCoderCache(user.id);
    } catch (err: any) {
      console.error(err);
      setError('Unable to sync AtCoder data. Using cached records.');
    } finally {
      setSyncing(false);
    }
  };

  // Resolved dynamic metrics from Mongoose cache Stats model
  const currentRating = atCoderData?.rating || 0;
  const maxRating = atCoderData?.stats?.highestRating || atCoderData?.stats?.metadata?.highestRating || 0;
  const contestsCount = atCoderData?.stats?.contests || 0;
  const totalSolved = atCoderData?.totalSolved || 0;
  const globalRank = atCoderData?.stats?.globalRank || 0;
  
  const extraData = atCoderData?.stats?.extra || atCoderData?.stats?.metadata?.extra || {};
  const accuracy = extraData?.accuracy || 0;
  const totalSubmissions = extraData?.totalSubmissions || 0;
  const acSubmissions = extraData?.acSubmissions || 0;
  const easySolved = extraData?.easy || 0;
  const mediumSolved = extraData?.medium || 0;
  const hardSolved = extraData?.hard || 0;

  const streakDays = atCoderData?.stats?.streak || atCoderData?.stats?.metadata?.streak || 0;
  const ratingColors = getAtCoderColors(currentRating);

  // Modular collections
  const heatmapData = atCoderData?.stats?.heatmap || atCoderData?.stats?.metadata?.extra?.heatmap || [];
  const fetchedSubmissions = atCoderData?.stats?.submissions || atCoderData?.stats?.metadata?.submissions || [];
  const detectedLanguages = atCoderData?.stats?.languages || atCoderData?.stats?.metadata?.languages || [];
  const fetchedTopics = atCoderData?.stats?.topics || atCoderData?.stats?.metadata?.topics || [];
  const ratingHistory = extraData?.contests || [];

  return (
    <div className="min-h-screen bg-[#06080F] text-white font-sans pb-16 overflow-x-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808004_1px,transparent_1px),linear-gradient(to_bottom,#80808004_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/5 to-transparent blur-[180px] rounded-full pointer-events-none" />

      <TopNavbar />

      <main className="max-w-[1600px] mx-auto px-6 pt-8 flex flex-col gap-6 relative z-10">

        {/* Skeleton Loaders */}
        {loading && atCoderHandle && (
          <div className="flex flex-col gap-6 w-full animate-pulse mt-4">
            <div className="h-44 bg-[#0E121E]/60 border border-slate-800/10 rounded-3xl w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 h-[450px] bg-[#0E121E]/60 border border-slate-800/10 rounded-3xl" />
              <div className="lg:col-span-9 h-[450px] bg-[#0E121E]/60 border border-slate-800/10 rounded-3xl" />
            </div>
          </div>
        )}

        {/* Link Account Page */}
        {!atCoderHandle && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] w-full text-center py-12 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="max-w-md w-full p-8 rounded-3xl bg-[#0E121E]/90 border border-orange-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#FF8A00]/15 to-transparent rounded-full blur-2xl" />
              <div className="w-20 h-20 bg-gradient-to-tr from-orange-500/10 to-[#FF8A00]/20 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-[#FF8A00]" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight mb-2">Connect AtCoder</h2>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Connect your AtCoder account to pull precision ratings, contest placement maps, and global rankings from Kenkoooo stats.
              </p>
              <form onSubmit={handleConnect} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={connectInput}
                  onChange={e => setConnectInput(e.target.value)}
                  placeholder="Enter AtCoder Handle"
                  className="px-4 py-3 text-xs bg-white/[0.02] border border-slate-800/30 rounded-xl focus:outline-none focus:border-[#FF8A00] text-center tracking-wider font-bold text-white transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 text-xs font-black tracking-wider uppercase rounded-xl bg-gradient-to-r from-orange-500 to-[#FF8A00] hover:opacity-90 flex items-center justify-center gap-2 text-black transition-opacity"
                >
                  {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Link AtCoder Account'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Syncing indicator */}
        {syncing && (
          <div className="fixed bottom-6 right-6 bg-[#0E121E] border border-[#FF8A00]/20 p-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50 backdrop-blur-md">
            <RefreshCw className="w-5 h-5 text-[#FF8A00] animate-spin" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Syncing latest submissions...</span>
              <span className="text-[9px] text-gray-500 font-semibold mt-0.5">Updating AtCoder analytics...</span>
            </div>
          </div>
        )}

        {/* Connected Dashboard */}
        {!loading && atCoderHandle && (
          <div className="space-y-6">

            {/* Profile Header */}
            <motion.header
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl border bg-[#0E121E]/80 border-slate-800/40 backdrop-blur-md shadow-2xl relative overflow-hidden"
              style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${ratingColors.glow}10` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-[#FF8A00]" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <InitialsAvatar handle={atCoderHandle} color={ratingColors.color} />
                    <div
                      className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-black border border-orange-400"
                      style={{ backgroundColor: '#FF8A00' }}
                    >
                      {ratingColors.name}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl font-black tracking-tight text-white">{atCoderHandle}</h1>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[#FF8A00] text-[8px] font-extrabold uppercase tracking-widest">
                        <Sparkles className="w-2 h-2" />
                        <span>Synced</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                      AtCoder Competitor · Color Band: <span style={{ color: ratingColors.color }} className="font-extrabold">{ratingColors.name}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all text-[9px] font-bold"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${syncing ? 'animate-spin' : ''}`} />
                        <span>{syncing ? 'Syncing contest data...' : 'Sync Now'}</span>
                      </button>
                      <span className="text-[9px] text-gray-500 italic">Last synced: {lastSyncedTime}</span>
                    </div>
                  </div>
                </div>

                {/* Performance overview metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  <div className="flex flex-col pr-4 sm:border-r border-white/5">
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Rating</span>
                    <span className="text-lg font-black tracking-tight" style={{ color: ratingColors.color }}>
                      <AnimatedCounter value={currentRating} />
                    </span>
                    <span className="text-[8px] font-semibold text-gray-500 mt-1">Current</span>
                  </div>
                  <div className="flex flex-col px-1 sm:px-4 sm:border-r border-white/5">
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Peak Rating</span>
                    <span className="text-lg font-black text-white tracking-tight">
                      <AnimatedCounter value={maxRating} />
                    </span>
                    <span className="text-[8px] font-semibold text-[#FF8A00] mt-1">Highest</span>
                  </div>
                  <div className="flex flex-col px-1 sm:px-4 sm:border-r border-white/5">
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Contests</span>
                    <span className="text-lg font-black text-white tracking-tight">
                      <AnimatedCounter value={contestsCount} />
                    </span>
                    <span className="text-[8px] font-semibold text-gray-500 mt-1">Attended</span>
                  </div>
                  <div className="flex flex-col pl-4">
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Accepted</span>
                    <span className="text-lg font-black text-white tracking-tight">
                      <AnimatedCounter value={totalSolved} />
                    </span>
                    <span className="text-[8px] font-semibold text-emerald-400 mt-1">
                      {globalRank ? `Rank: ${globalRank}` : 'AC Problems'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error messages wrapper */}
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-[10px] text-red-200 font-bold">{error}</span>
                  </div>
                  <button onClick={handleSync} className="px-2.5 py-1 text-[9px] font-black uppercase bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded border border-red-500/30 transition-all">
                    Retry Sync
                  </button>
                </div>
              )}
            </motion.header>

            {/* Sidebar + Tab Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <aside className="lg:col-span-3 bg-[#0E121E]/60 border border-slate-800/40 rounded-3xl p-3 flex flex-col gap-1 sticky top-24 backdrop-blur-md shadow-2xl">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-3 py-1.5 block">Navigation</span>
                {[
                  { id: 'Overview', icon: Home },
                  { id: 'Problems', icon: Target },
                  { id: 'Contests', icon: Trophy },
                  { id: 'Submissions', icon: ClipboardList },
                  { id: 'Analytics', icon: Activity },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 w-full text-left group ${
                      activeTab === tab.id
                        ? 'text-[#FF8A00] bg-orange-500/[0.05] border border-orange-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-[#FF8A00]' : 'text-gray-500'}`} />
                    <span>{tab.id}</span>
                  </button>
                ))}
              </aside>

              <div className="lg:col-span-9 space-y-6">

                {activeTab === 'Overview' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-6"
                  >
                    <AccuracyAnalytics 
                      totalSubmissions={totalSubmissions}
                      acSubmissions={acSubmissions}
                      accuracy={accuracy}
                      easyCount={easySolved}
                      mediumCount={mediumSolved}
                      hardCount={hardSolved}
                    />

                    <ContestAnalytics 
                      currentRating={currentRating}
                      highestRating={maxRating}
                      contestsAttended={contestsCount}
                      globalContestRank={globalRank}
                      ratingHistory={ratingHistory}
                    />

                    <ActivityHeatmap 
                      activityData={heatmapData}
                      yearlyStreak={streakDays}
                      activeDaysCount={heatmapData.length}
                    />

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                      <div className="xl:col-span-7">
                        <TopicMastery topics={fetchedTopics} />
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
                    <AccuracyAnalytics 
                      totalSubmissions={totalSubmissions}
                      acSubmissions={acSubmissions}
                      accuracy={accuracy}
                      easyCount={easySolved}
                      mediumCount={mediumSolved}
                      hardCount={hardSolved}
                    />
                    <TopicMastery topics={fetchedTopics} />
                  </motion.div>
                )}

                {activeTab === 'Contests' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ContestAnalytics 
                      currentRating={currentRating}
                      highestRating={maxRating}
                      contestsAttended={contestsCount}
                      globalContestRank={globalRank}
                      ratingHistory={ratingHistory}
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
                        <LanguageAnalytics languages={detectedLanguages} />
                      </div>
                    </div>
                    <AccuracyAnalytics 
                      totalSubmissions={totalSubmissions}
                      acSubmissions={acSubmissions}
                      accuracy={accuracy}
                      easyCount={easySolved}
                      mediumCount={mediumSolved}
                      hardCount={hardSolved}
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
