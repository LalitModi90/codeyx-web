"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, ShieldAlert, Award, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

interface ContestAnalyticsProps {
  history: Array<{
    contestName: string;
    rating: number;
    rank: string | number;
    delta: number;
  }>;
}

export default function ContestAnalytics({ history = [] }: ContestAnalyticsProps) {
  const brandColors = {
    gold: '#D4A017',
    brown: '#8B5E3C',
    accent: '#FFB84D',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  // Calculations
  const stats = useMemo(() => {
    if (history.length === 0) {
      return { total: 0, bestRank: '-', avgRank: '-', avgDelta: 0 };
    }

    const numericalRanks = history
      .map(h => parseInt(String(h.rank).replace(/[^0-9]/g, '')))
      .filter(r => !isNaN(r));

    const total = history.length;
    const bestRank = numericalRanks.length > 0 ? Math.min(...numericalRanks) : '-';
    const avgRank = numericalRanks.length > 0 ? Math.round(numericalRanks.reduce((a, b) => a + b, 0) / numericalRanks.length) : '-';
    
    const deltas = history.map(h => h.delta || 0);
    const avgDelta = Math.round(deltas.reduce((a, b) => a + b, 0) / total);

    return { total, bestRank, avgRank, avgDelta };
  }, [history]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Contests Attended */}
        <div className={`p-4 rounded-xl border ${brandColors.card} flex flex-col justify-between shadow-lg`}>
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-2 block">Contests Attended</span>
          <span className="text-xl font-black text-white tracking-tight leading-none">{stats.total}</span>
          <span className="text-[8px] text-gray-400 mt-2 font-medium">Contest count</span>
        </div>

        {/* Best Rank */}
        <div className={`p-4 rounded-xl border ${brandColors.card} flex flex-col justify-between shadow-lg`}>
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-2 block">Best Rank</span>
          <span className="text-xl font-black text-[#FFB84D] tracking-tight leading-none">
            {stats.bestRank !== '-' ? `#${stats.bestRank.toLocaleString()}` : '-'}
          </span>
          <span className="text-[8px] text-emerald-400 mt-2 font-medium">Peak Performance</span>
        </div>

        {/* Avg Rank */}
        <div className={`p-4 rounded-xl border ${brandColors.card} flex flex-col justify-between shadow-lg`}>
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-2 block">Average Rank</span>
          <span className="text-xl font-black text-white tracking-tight leading-none">
            {stats.avgRank !== '-' ? `#${stats.avgRank.toLocaleString()}` : '-'}
          </span>
          <span className="text-[8px] text-gray-400 mt-2 font-medium">Mean placement</span>
        </div>

        {/* Net Rating delta */}
        <div className={`p-4 rounded-xl border ${brandColors.card} flex flex-col justify-between shadow-lg`}>
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-2 block">Mean Rating Change</span>
          <span className={`text-xl font-black tracking-tight leading-none ${stats.avgDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.avgDelta >= 0 ? `+${stats.avgDelta}` : stats.avgDelta}
          </span>
          <span className="text-[8px] text-gray-400 mt-2 font-medium">Per contest average</span>
        </div>
      </div>

      {/* Contest Timeline List */}
      <div className={`p-5 rounded-2xl border ${brandColors.card} shadow-xl`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm tracking-wide text-white">Contest Performance Timeline</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Chronological record of completed contests</p>
          </div>
        </div>

        <div className="overflow-x-auto select-none">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[8px] font-black uppercase tracking-wider text-gray-500">
                <th className="pb-3 pl-2">Contest Name</th>
                <th className="pb-3 text-center">Placement</th>
                <th className="pb-3 text-center">Change</th>
                <th className="pb-3 text-right pr-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {history.map((c, i) => (
                <tr key={i} className="border-b border-white/[0.02] last:border-none hover:bg-white/[0.01] transition-colors text-xs">
                  <td className="py-3.5 pl-2 font-bold text-white uppercase">{c.contestName}</td>
                  <td className="py-3.5 text-center font-mono font-bold text-gray-300">
                    {c.rank ? `#${c.rank}` : '-'}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className={`inline-flex items-center gap-0.5 font-bold ${c.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.delta >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      <span>{Math.abs(c.delta)}</span>
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-2 font-mono font-black text-[#FFB84D]">{c.rating}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 font-bold uppercase tracking-wider text-xs">
                    No contest history synced
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
