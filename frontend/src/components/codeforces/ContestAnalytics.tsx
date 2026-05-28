"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { AnimatedCounter } from './ProfileHeader';

interface ContestPoint {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
}

interface ContestAnalyticsProps {
  history: ContestPoint[];
}

export default function ContestAnalytics({ history = [] }: ContestAnalyticsProps) {
  const hasData = history && history.length > 0;

  const stats = useMemo(() => {
    if (!hasData) return { bestRank: 0, avgRank: 0, ratingGains: 0, ratingLosses: 0 };
    
    let best = Infinity;
    let sumRank = 0;
    let gains = 0;
    let losses = 0;

    history.forEach(c => {
      if (c.rank < best) best = c.rank;
      sumRank += c.rank;
      const diff = c.newRating - c.oldRating;
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    });

    return {
      bestRank: best === Infinity ? 0 : best,
      avgRank: Math.round(sumRank / history.length),
      ratingGains: gains,
      ratingLosses: losses
    };
  }, [history, hasData]);

  const recentPerformanceData = useMemo(() => {
    return history.slice(-8).map((c, i) => ({
      name: `C${i + 1}`,
      rank: c.rank,
      ratingChange: c.newRating - c.oldRating,
      contestName: c.contestName
    }));
  }, [history]);

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl h-64 flex flex-col items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        <Trophy className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">No synced contest analytics</span>
        <span className="text-[9px] text-gray-500 mt-1 max-w-[280px] text-center px-4 leading-relaxed font-semibold">
          Participate in Codeforces rated challenges to view performance tracking metrics here.
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl space-y-6"
    >
      <div>
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#FF5C5C] flex items-center gap-1.5">
          <Trophy size={14} className="text-[#FF5C5C]" />
          <span>Contest Analytics Workspace</span>
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Deep-dive competitive performance metrics & averages</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex flex-col justify-between">
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1.5">Best Rank</span>
          <span className="text-base font-black text-emerald-400">
            #<AnimatedCounter value={stats.bestRank} />
          </span>
          <span className="text-[8px] text-gray-500 mt-1 font-semibold">Peak performance</span>
        </div>
        <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex flex-col justify-between">
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1.5">Avg Rank</span>
          <span className="text-base font-black text-blue-400">
            #<AnimatedCounter value={stats.avgRank} />
          </span>
          <span className="text-[8px] text-gray-500 mt-1 font-semibold">Attained average</span>
        </div>
        <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex flex-col justify-between">
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1.5">Rating Gains</span>
          <span className="text-base font-black text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+<AnimatedCounter value={stats.ratingGains} /></span>
          </span>
          <span className="text-[8px] text-gray-500 mt-1 font-semibold">Total delta gains</span>
        </div>
        <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex flex-col justify-between">
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1.5">Rating Losses</span>
          <span className="text-base font-black text-rose-500 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-<AnimatedCounter value={stats.ratingLosses} /></span>
          </span>
          <span className="text-[8px] text-gray-500 mt-1 font-semibold">Total delta losses</span>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={recentPerformanceData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0B1023] border border-white/10 p-2.5 rounded-xl text-[9px]">
                      <p className="font-bold text-white mb-1 max-w-[160px] truncate">{d.contestName}</p>
                      <p className="text-gray-400">Rank: <span className="text-white font-bold">#{d.rank}</span></p>
                      <p className={d.ratingChange >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        Rating: {d.ratingChange >= 0 ? `+${d.ratingChange}` : d.ratingChange}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="ratingChange" radius={[4, 4, 0, 0]}>
              {recentPerformanceData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.ratingChange >= 0 ? '#10b981' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
