"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

interface ProfileHeaderProps {
  username: string;
  realName: string;
  avatarUrl?: string;
  solvedCount: number;
  globalRank: number;
  certificatesCount: number;
  streak: number;
  level: string;
  syncing: boolean;
  onSync: () => void;
}

export default function ProfileHeader({
  username,
  realName,
  avatarUrl = 'https://assets.codeforces.com/images/no-avatar.jpg',
  solvedCount = 0,
  globalRank = 0,
  certificatesCount = 0,
  streak = 0,
  level = '',
  syncing = false,
  onSync
}: ProfileHeaderProps) {
  const brandColors = {
    primary: '#00EA64',
    secondary: '#00C853',
    accent: '#39FF14',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-3xl border ${brandColors.card} relative overflow-hidden`}
      style={{
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 25px rgba(0, 234, 100, 0.08)`
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00EA64] via-[#39FF14] to-[#00C853] shadow-[0_0_10px_#00EA64]" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* User Info Section */}
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#00EA64] to-[#39FF14] rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
            <div 
              className="relative w-20 h-20 rounded-2xl overflow-hidden bg-cover bg-center border-2 border-[#00EA64] bg-[#050816]"
              style={{ backgroundImage: `url(${avatarUrl})` }}
            />
            {level ? (
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-black bg-[#00EA64] border border-[#00C853] shadow-[0_0_8px_#00EA64]">
                {level}
              </div>
            ) : (
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider text-gray-400 bg-black/80 border border-white/10">
                N/A
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black tracking-tight text-white">{realName || 'HackerRank Member'}</h1>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#00EA64]/10 border border-[#00EA64]/20 text-[#00EA64] text-[8px] font-extrabold uppercase tracking-widest animate-pulse">
                <Terminal className="w-2.5 h-2.5" />
                <span>ONLINE PORTFOLIO</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">
              HackerRank Connected Account • Handle: @{username || 'N/A'}
            </p>
            
            <div className="flex items-center gap-2.5 mt-3">
              <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider">Sync Engine:</span>
              <button 
                onClick={onSync}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/5 hover:border-[#00EA64]/30 hover:bg-[#00EA64]/5 text-gray-300 hover:text-[#00EA64] transition-all duration-300 text-[9px] font-black tracking-wider uppercase"
              >
                <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin text-[#00EA64]' : ''}`} />
                <span>{syncing ? 'Synchronizing...' : 'Sync Profile'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cyber Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/40 border border-white/5 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#00ea6408_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

          <div className="flex flex-col pr-4 sm:border-r border-white/5 relative z-10">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Global Standing</span>
            <span className="text-lg font-black tracking-tight text-white font-mono">
              {globalRank > 0 ? `#${globalRank.toLocaleString()}` : 'N/A'}
            </span>
            <span className="text-[8px] font-semibold text-[#00EA64] mt-1 flex items-center gap-0.5">
              <CheckCircle2 className="w-2 h-2" /> Verified rank
            </span>
          </div>

          <div className="flex flex-col px-1 sm:px-4 sm:border-r border-white/5 relative z-10">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Solved</span>
            <span className="text-lg font-black tracking-tight text-[#00EA64] font-mono">
              {solvedCount > 0 ? solvedCount : '0'}
            </span>
            <span className="text-[8px] font-semibold text-gray-500 mt-1">Accepted Solutions</span>
          </div>

          <div className="flex flex-col px-1 sm:px-4 sm:border-r border-white/5 relative z-10">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Certifications</span>
            <span className="text-lg font-black tracking-tight text-white font-mono">
              {certificatesCount > 0 ? certificatesCount : '0'}
            </span>
            <span className="text-[8px] font-semibold text-[#39FF14] mt-1">Verified Badges</span>
          </div>

          <div className="flex flex-col pl-4 relative z-10">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Active Streak</span>
            <span className="text-lg font-black tracking-tight text-white font-mono flex items-baseline gap-1">
              {streak > 0 ? streak : '0'}<span className="text-[9px] text-[#00EA64] font-black uppercase">Days</span>
            </span>
            <span className="text-[8px] font-semibold text-gray-500 mt-1">Consistency Tracker</span>
          </div>
        </div>

      </div>
    </motion.header>
  );
}
