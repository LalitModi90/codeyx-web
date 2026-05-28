"use client";

import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { Sparkles, RefreshCw, Trophy, AlertCircle } from 'lucide-react';

interface ProfileHeaderProps {
  username: string;
  realName?: string;
  avatarUrl?: string;
  stars?: string;
  rating?: number;
  highestRating?: number;
  globalRank?: number;
  countryRank?: number;
  solvedCount: number;
  streak: number;
  syncing: boolean;
  onSync: () => void;
  lastSyncedTime?: string;
  error?: string | null;
  topics?: { subject: string; category: string; solved: number }[];
}

const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const ctrl = animate(0, value, {
      duration: 1.4, ease: 'easeOut',
      onUpdate: v => setCount(Math.floor(v))
    });
    return () => ctrl.stop();
  }, [value]);
  return <>{count.toLocaleString()}</>;
};

export default function ProfileHeader({
  username,
  realName = "CodeChef Competitor",
  avatarUrl,
  stars = "3★",
  rating = 0,
  highestRating = 0,
  globalRank = 0,
  countryRank = 0,
  solvedCount,
  streak,
  syncing,
  onSync,
  lastSyncedTime = 'Never synced',
  error = null,
  topics = []
}: ProfileHeaderProps) {
  // Analyze strong and weak topics using real-time solved statistics
  const { strongTopic, weakTopic } = React.useMemo(() => {
    if (!topics || topics.length === 0) {
      return { strongTopic: 'Implementation', weakTopic: 'DP / Graphs' };
    }
    // Sort topics by solved count descending
    const sorted = [...topics].sort((a, b) => b.solved - a.solved);
    const strong = sorted[0]?.subject || 'Implementation';
    
    // Find a weak topic (from the remaining or a predefined list)
    const predefined = ['Dynamic Programming', 'Graph Theory', 'Greedy Algorithms', 'Mathematics', 'Sorting & Arrays', 'Implementation'];
    const solvedSubjects = topics.map(t => t.subject);
    const missing = predefined.filter(p => !solvedSubjects.includes(p));
    
    let weak = 'Dynamic Programming';
    if (missing.length > 0) {
      weak = missing[0];
    } else {
      // If they have all, get the one with the lowest solved count
      weak = sorted[sorted.length - 1]?.subject || 'Graph Theory';
    }
    
    // Shorten topic names for visual space in the header bar
    const shortenName = (name: string) => {
      if (name === 'Dynamic Programming') return 'DP';
      if (name === 'Sorting & Arrays') return 'Arrays';
      if (name === 'Greedy Algorithms') return 'Greedy';
      if (name === 'Graph Theory') return 'Graphs';
      return name;
    };
    
    return { strongTopic: shortenName(strong), weakTopic: shortenName(weak) };
  }, [topics]);
  // Detect fake/missing avatars — never show no-avatar.jpg
  const isFakeAvatar = !avatarUrl ||
    avatarUrl.includes('no-avatar') ||
    avatarUrl.includes('no-title-photo') ||
    avatarUrl.includes('codeforces.com/images/no-avatar');

  const brandColors = {
    gold: '#D4A017',
    brown: '#8B5E3C',
    accent: '#FFB84D',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${brandColors.card} relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]`}
      style={{
        boxShadow: `0 0 35px rgba(212, 160, 23, 0.06)`
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5E3C] via-[#D4A017] to-[#FFB84D]" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="relative">
            {isFakeAvatar ? (
              // Gradient initials fallback
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-xl text-white select-none border-2 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${brandColors.brown}60, ${brandColors.gold}90)`,
                  borderColor: brandColors.gold,
                  boxShadow: `0 0 20px rgba(212, 160, 23, 0.25)`
                }}
              >
                {username.slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <img
                src={avatarUrl}
                alt={username}
                className="w-20 h-20 rounded-2xl object-cover border-2 shadow-lg"
                style={{ borderColor: brandColors.gold, boxShadow: `0 0 20px rgba(212, 160, 23, 0.25)` }}
                onError={e => {
                  const t = e.target as HTMLImageElement;
                  t.style.display = 'none';
                }}
              />
            )}
            <div 
              className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-black border shadow"
              style={{ backgroundColor: brandColors.gold, borderColor: brandColors.accent }}
            >
              {stars}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black tracking-tight text-white">{realName}</h1>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[#FFB84D] text-[8px] font-extrabold uppercase tracking-widest">
                <Sparkles className="w-2 h-2" />
                <span>Connected</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">
              CodeChef Competitor • Handle: <span className="font-bold text-white">@{username}</span>
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={onSync}
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex flex-col pr-4 sm:border-r border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Rating</span>
            <span className="text-lg font-black tracking-tight text-[#FFB84D]">
              <AnimatedCounter value={rating} />
            </span>
            <span className="text-[8px] font-semibold text-[#D4A017] mt-1">Current Rating</span>
          </div>

          <div className="flex flex-col px-1 sm:px-4 sm:border-r border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Peak Rating</span>
            <span className="text-lg font-black text-white tracking-tight">
              <AnimatedCounter value={highestRating} />
            </span>
            <span className="text-[8px] font-semibold text-gray-500 mt-1">Highest Rating</span>
          </div>

          <div className="flex flex-col px-1 sm:px-4 sm:border-r border-white/5 min-w-[110px]">
            <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
              <Sparkles className="w-2 h-2 text-amber-400 animate-pulse" />
              <span>AI Analysis</span>
            </span>
            <span className="text-[12px] font-black text-emerald-400 tracking-wide uppercase mt-1.5 truncate" title={`Strongest Domain: ${strongTopic}`}>
              💪 {strongTopic}
            </span>
            <span className="text-[8px] font-extrabold text-red-400 mt-1 truncate" title={`Needs Practice: ${weakTopic}`}>
              ⚠️ Weak: {weakTopic}
            </span>
          </div>

          <div className="flex flex-col pl-4 font-mono">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Solved</span>
            <span className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#FFB84D]" />
              <span><AnimatedCounter value={solvedCount} /></span>
            </span>
            <span className="text-[8px] font-semibold text-emerald-400 mt-1">Fully Solved</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
