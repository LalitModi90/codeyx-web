"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { animate } from 'framer-motion';
import { RefreshCw, Sparkles, MapPin, LinkIcon, Star, GitFork, Users, GitCommit, GitPullRequest, Flame, ExternalLink } from 'lucide-react';

const AnimatedCounter = ({ value, prefix = '' }: { value: number; prefix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const ctrl = animate(0, value, { duration: 1.4, ease: 'easeOut', onUpdate: v => setCount(Math.floor(v)) });
    return () => ctrl.stop();
  }, [value]);
  return <>{prefix}{count.toLocaleString()}</>;
};

interface Props {
  profile: any;
  username: string;
  syncing: boolean;
  onSync: () => void;
  lastSyncedTime: string;
}

const StatBox = ({ label, value, icon: Icon, color }: any) => (
  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#58A6FF]/20 hover:bg-[#58A6FF]/[0.02] transition-all group">
    <Icon className={`w-3.5 h-3.5 mb-1.5 ${color} transition-transform group-hover:scale-110`} />
    <span className="text-sm font-black text-[var(--text-main)] leading-none"><AnimatedCounter value={value} /></span>
    <span className="text-[8px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">{label}</span>
  </div>
);

export default function GHProfileHeader({ profile, username, syncing, onSync, lastSyncedTime }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] backdrop-blur-md shadow-2xl overflow-hidden"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#58A6FF]/50 to-transparent" />
      {/* Glow */}
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#58A6FF]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
        {/* Avatar + Identity */}
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#58A6FF]/40 to-[#1F6FEB]/20 blur-md scale-110" />
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={username}
                className="relative w-20 h-20 rounded-2xl border-2 border-[#58A6FF]/40 shadow-[0_0_20px_rgba(88,166,255,0.2)] object-cover"
              />
            ) : (
              <div className="relative w-20 h-20 rounded-2xl border-2 border-[#30363D] bg-[#161B22] flex items-center justify-center">
                <span className="text-2xl font-black text-[#58A6FF]">{username[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest bg-[#58A6FF] text-black shadow-[0_0_8px_rgba(88,166,255,0.4)]">
              Developer
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-black tracking-tight text-[var(--text-main)]">{profile.name || username}</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#58A6FF]/10 border border-[#58A6FF]/25 text-[#58A6FF] text-[8px] font-black uppercase tracking-widest">
                <Sparkles className="w-2 h-2" />Synced
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">@{username}</p>
            {profile.bio && (
              <p className="text-[11px] text-gray-400 mt-1 max-w-xs leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {profile.location && (
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <MapPin className="w-3 h-3" />{profile.location}
                </span>
              )}
              {profile.blog && (
                <a href={profile.blog} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[10px] text-[#58A6FF] hover:underline">
                  <LinkIcon className="w-3 h-3" />{profile.blog.replace(/^https?:\/\//, '')}
                </a>
              )}
              {profile.streak > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-orange-400 font-black">
                  <Flame className="w-3 h-3" />{profile.streak}d streak
                </span>
              )}
            </div>
            {/* Sync controls */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={onSync}
                disabled={syncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#58A6FF]/30 hover:bg-[#58A6FF]/5 text-gray-400 hover:text-[#58A6FF] transition-all text-[9px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
              <span className="text-[9px] text-gray-600 italic">Last synced: {lastSyncedTime}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:ml-auto grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 w-full lg:max-w-sm xl:max-w-md">
          <StatBox label="Repos"        value={profile.publicRepos}   icon={GitFork}        color="text-[#58A6FF]" />
          <StatBox label="Followers"    value={profile.followers}     icon={Users}          color="text-emerald-400" />
          <StatBox label="Stars"        value={profile.totalStars}    icon={Star}           color="text-yellow-400" />
          <StatBox label="Forks"        value={profile.totalForks}    icon={GitFork}        color="text-purple-400" />
          <StatBox label="Commits"      value={profile.commitsCount}  icon={GitCommit}      color="text-[#58A6FF]" />
          <StatBox label="PRs"          value={profile.prsCount}      icon={GitPullRequest} color="text-violet-400" />
          <StatBox label="Contributions"value={profile.totalContributions} icon={Sparkles}  color="text-orange-400" />
          <StatBox label="Following"    value={profile.following}     icon={Users}          color="text-pink-400" />
        </div>
      </div>
    </motion.header>
  );
}
