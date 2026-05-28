"use client";

import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { RefreshCw, Sparkles, Trophy, Award, Calendar, AlertCircle } from 'lucide-react';

interface ProfileHeaderProps {
  username: string;
  realName?: string;
  avatarUrl?: string;
  rank: string;
  maxRank?: string;
  rating: number;
  maxRating: number;
  contestsCount: number;
  solvedCount: number;
  syncing: boolean;
  onSync: () => void;
  lastSyncedTime?: string;
  error?: string | null;
}

// Custom spring-based animated counter component using Framer Motion
export const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => setCount(Math.floor(latest))
    });
    return () => controls.stop();
  }, [value]);

  return <>{count.toLocaleString()}</>;
};

export const getCFColors = (rank: string) => {
  const r = rank.toLowerCase();
  if (r.includes('legendary') || r.includes('tourist')) return { color: '#ff0000', bg: 'rgba(255, 0, 0, 0.1)', border: 'rgba(255, 0, 0, 0.25)', glow: 'rgba(255, 0, 0, 0.4)' };
  if (r.includes('grandmaster')) return { color: '#ff3333', bg: 'rgba(255, 51, 51, 0.1)', border: 'rgba(255, 51, 51, 0.25)', glow: 'rgba(255, 51, 51, 0.4)' };
  if (r.includes('master')) return { color: '#ffcc33', bg: 'rgba(255, 204, 51, 0.1)', border: 'rgba(255, 204, 51, 0.25)', glow: 'rgba(255, 204, 51, 0.4)' };
  if (r.includes('candidate')) return { color: '#aa00aa', bg: 'rgba(170, 0, 170, 0.1)', border: 'rgba(170, 0, 170, 0.25)', glow: 'rgba(170, 0, 170, 0.4)' };
  if (r.includes('expert')) return { color: '#0000ff', bg: 'rgba(0, 0, 255, 0.1)', border: 'rgba(0, 0, 255, 0.25)', glow: 'rgba(0, 0, 255, 0.4)' };
  if (r.includes('specialist')) return { color: '#03a89e', bg: 'rgba(3, 168, 158, 0.1)', border: 'rgba(3, 168, 158, 0.25)', glow: 'rgba(3, 168, 158, 0.4)' };
  if (r.includes('pupil')) return { color: '#008000', bg: 'rgba(0, 128, 0, 0.1)', border: 'rgba(0, 128, 0, 0.25)', glow: 'rgba(0, 128, 0, 0.4)' };
  if (r.includes('newbie')) return { color: '#cccccc', bg: 'rgba(204, 204, 204, 0.1)', border: 'rgba(204, 204, 204, 0.25)', glow: 'rgba(204, 204, 204, 0.4)' };
  return { color: '#4DA3FF', bg: 'rgba(77, 163, 255, 0.1)', border: 'rgba(77, 163, 255, 0.25)', glow: 'rgba(77, 163, 255, 0.3)' };
};

export default function ProfileHeader({
  username,
  realName = "Codeforces Competitor",
  avatarUrl,
  rank = "Newbie",
  maxRank = "Newbie",
  rating = 0,
  maxRating = 0,
  contestsCount = 0,
  solvedCount = 0,
  syncing = false,
  onSync,
  lastSyncedTime = "Just now",
  error = null
}: ProfileHeaderProps) {
  const currentColors = getCFColors(rank);

  // Gradient avatar fallback based on user initials
  const getInitialsAvatar = () => {
    const initials = username.slice(0, 2).toUpperCase();
    return (
      <div 
        className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-xl text-white select-none border shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${currentColors.color}40, ${currentColors.color}80)`,
          borderColor: currentColors.color,
          boxShadow: `0 0 15px ${currentColors.glow}30`
        }}
      >
        {initials}
      </div>
    );
  };

  const isFakeAvatar = !avatarUrl || avatarUrl.includes('no-avatar.jpg') || avatarUrl.includes('no-title-photo');

  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border bg-[#0B1023]/90 border-white/[0.06] backdrop-blur-xl relative overflow-hidden"
      style={{
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px ${currentColors.glow}15`
      }}
    >
      {/* Corner accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
        style={{ backgroundImage: `linear-gradient(to right, ${currentColors.color}, #FF5C5C)` }}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="relative">
            {isFakeAvatar ? (
              getInitialsAvatar()
            ) : (
              <div 
                className="w-20 h-20 rounded-2xl overflow-hidden bg-cover bg-center border-2 shadow-lg"
                style={{ 
                  backgroundImage: `url(${avatarUrl})`,
                  borderColor: currentColors.color,
                  boxShadow: `0 0 15px ${currentColors.glow}30`
                }}
              />
            )}
            <div 
              className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white border"
              style={{ backgroundColor: currentColors.color, borderColor: currentColors.border }}
            >
              {rank || 'Unrated'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black tracking-tight text-white">{username}</h1>
              {rating > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-extrabold uppercase tracking-widest">
                  <Sparkles className="w-2 h-2" />
                  <span>Synced</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">
              {realName} • Codeforces star candidate
            </p>
            
            {/* Sync System UX */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sync Status:</span>
                <button 
                  onClick={onSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all text-[9px] font-bold cursor-pointer"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing latest submissions...' : 'Sync Now'}</span>
                </button>
              </div>
              <span className="text-[9px] text-gray-500 italic">
                Last updated: {lastSyncedTime}
              </span>
            </div>
          </div>
        </div>

        {/* Counter metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex flex-col pr-4 sm:border-r border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Current Rating</span>
            <span className="text-lg font-black tracking-tight" style={{ color: currentColors.color }}>
              <AnimatedCounter value={rating} />
            </span>
            <span className="text-[8px] font-semibold text-gray-500 mt-1 capitalize">{rank}</span>
          </div>

          <div className="flex flex-col px-1 sm:px-4 sm:border-r border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Max Rating</span>
            <span className="text-lg font-black text-white tracking-tight">
              <AnimatedCounter value={maxRating} />
            </span>
            <span className="text-[8px] font-semibold text-rose-400 mt-1 capitalize">Peak: {maxRank}</span>
          </div>

          <div className="flex flex-col px-1 sm:px-4 sm:border-r border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Contests</span>
            <span className="text-lg font-black text-white tracking-tight">
              <AnimatedCounter value={contestsCount} />
            </span>
            <span className="text-[8px] font-semibold text-gray-500 mt-1">Attended</span>
          </div>

          <div className="flex flex-col pl-4">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Solved</span>
            <span className="text-lg font-black text-white tracking-tight">
              <AnimatedCounter value={solvedCount} />
            </span>
            <span className="text-[8px] font-semibold text-emerald-400 mt-1">Accepted</span>
          </div>
        </div>
      </div>

      {/* Premium Error Card Overlay */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-[10px] text-red-200 font-bold leading-normal">{error}</span>
          </div>
          <button 
            onClick={onSync}
            className="px-2.5 py-1 text-[9px] font-black uppercase bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded border border-red-500/30 transition-all cursor-pointer"
          >
            Retry Sync
          </button>
        </div>
      )}
    </motion.header>
  );
}
