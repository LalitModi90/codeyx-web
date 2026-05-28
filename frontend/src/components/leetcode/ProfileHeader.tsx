"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Flame, Trophy, Award, Star } from 'lucide-react';

interface ProfileHeaderProps {
  username: string;
  realName?: string;
  avatarUrl?: string;
  rank?: string;
  globalRank?: number;
  rating?: number;
  reputation?: number;
  solvedCount: number;
  streak: number;
  syncing: boolean;
  onSync: () => void;
}

const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const duration = 1.0;
    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toLocaleString()}</>;
};

export default function ProfileHeader({
  username,
  realName = "LeetCode Competitor",
  avatarUrl = "https://assets.codeforces.com/images/no-avatar.jpg",
  rank = "Coder",
  globalRank = 0,
  rating = 0,
  reputation = 0,
  solvedCount,
  streak,
  syncing,
  onSync
}: ProfileHeaderProps) {
  const brandColors = {
    orange: '#FFA116',
    yellow: '#FFD43B',
    accent: '#FF8C00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${brandColors.card} relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]`}
      style={{
        boxShadow: `0 0 30px rgba(255, 161, 22, 0.05)`
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFA116] via-[#FFD43B] to-[#FF8C00]" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div 
              className="w-20 h-20 rounded-2xl overflow-hidden bg-cover bg-center border-2 shadow-lg"
              style={{ 
                backgroundImage: `url(${avatarUrl})`,
                borderColor: brandColors.orange,
                boxShadow: `0 0 20px rgba(255, 161, 22, 0.25)`
              }}
            />
            <div 
              className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-black border shadow"
              style={{ backgroundColor: brandColors.orange, borderColor: brandColors.accent }}
            >
              {rank}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black tracking-tight text-white">{realName}</h1>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[#FFA116] text-[8px] font-extrabold uppercase tracking-widest">
                <Sparkles className="w-2 h-2" />
                <span>Connected</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">
              LeetCode Handle: <span className="font-bold text-white">@{username}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sync:</span>
              <button 
                onClick={onSync}
                disabled={syncing}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all text-[9px] font-bold"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex flex-col pr-4 sm:border-r border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Global Rank</span>
            <span className="text-lg font-black tracking-tight text-white font-mono">
              #<AnimatedCounter value={globalRank} />
            </span>
            <span className="text-[8px] font-semibold text-gray-500 mt-1">LeetCode Rank</span>
          </div>

          <div className="flex flex-col px-1 sm:px-4 sm:border-r border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Rating</span>
            <span className="text-lg font-black tracking-tight text-[#FFA116]">
              <AnimatedCounter value={rating} />
            </span>
            <span className="text-[8px] font-semibold text-[#FFD43B] mt-1">Contest Rating</span>
          </div>

          <div className="flex flex-col pl-4">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Solved Problems</span>
            <span className="text-lg font-black text-white tracking-tight flex items-center gap-1.5 font-mono">
              <Trophy className="w-4 h-4 text-[#FFA116]" />
              <span><AnimatedCounter value={solvedCount} /></span>
            </span>
            <span className="text-[8px] font-semibold text-emerald-400 mt-1">Total Solved Count</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
