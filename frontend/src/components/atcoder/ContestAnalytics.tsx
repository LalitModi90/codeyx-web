"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Sparkles, AlertCircle, Info, Calendar } from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

interface RatingHistoryEntry {
  contestName: string;
  rating: number;
  rank: number;
  performance: number;
  ratingChange: number;
  date: string;
}

interface ContestAnalyticsProps {
  currentRating?: number;
  highestRating?: number;
  contestsAttended?: number;
  globalContestRank?: string | number;
  ratingHistory?: RatingHistoryEntry[];
}

export default function ContestAnalytics({
  currentRating = 0,
  highestRating = 0,
  contestsAttended = 0,
  globalContestRank = 'N/A',
  ratingHistory = []
}: ContestAnalyticsProps) {
  const brandColors = {
    theme: '#FF8A00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const hasHistory = Array.isArray(ratingHistory) && ratingHistory.length >= 2;

  if (!hasHistory) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg py-12 flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <Trophy className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">No contest history synced</h3>
        <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
          Sync your profile to load analytics
        </p>
      </div>
    );
  }

  const ratingProgressData = useMemo(() => 
    ratingHistory.map((h: any) => ({
      name: h.contestName || 'Contest',
      rating: h.rating || 0,
      place: h.rank || 0,
      change: h.ratingChange || 0
    })),
    [ratingHistory]
  );

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#FF8A00] flex items-center gap-1.5">
            <Trophy size={14} className="text-[#FF8A00]" />
            <span>Contest Rating Progression</span>
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Track your rating growth and performance history</p>
        </div>

        <div className="flex gap-4 text-[9px] font-bold">
          <div className="flex flex-col">
            <span className="text-gray-500 uppercase leading-none mb-0.5">Rating</span>
            <span className="text-[#FF8A00] font-mono">{currentRating}</span>
          </div>
          <div className="w-[1px] h-6 bg-white/5" />
          <div className="flex flex-col">
            <span className="text-gray-500 uppercase leading-none mb-0.5">Peak Rating</span>
            <span className="text-white font-mono">{highestRating}</span>
          </div>
          <div className="w-[1px] h-6 bg-white/5" />
          <div className="flex flex-col">
            <span className="text-gray-500 uppercase leading-none mb-0.5">Global Rank</span>
            <span className="text-amber-400 font-mono">#{globalContestRank}</span>
          </div>
        </div>
      </div>

      <div className="h-64 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ratingProgressData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="atcoderRatingGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#FF8A00" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#FF8A00" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }} />
            <YAxis domain={['dataMin - 150', 'dataMax + 150']} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0E121E] border border-slate-800/40 p-3 rounded-xl shadow-xl backdrop-blur-md">
                      <p className="text-[9px] font-black text-[#FF8A00] uppercase tracking-wider mb-1 truncate max-w-[200px]">{d.name}</p>
                      <p className="text-[10px] text-white font-bold">Rating: <span className="font-mono text-orange-400">{d.rating}</span></p>
                      <p className="text-[9px] text-gray-400">Place: <span className="font-bold text-white">#{d.place}</span></p>
                      <p className="text-[9px] text-gray-400">Change: <span className={d.change >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{d.change >= 0 ? `+${d.change}` : d.change}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="rating" stroke="#FF8A00" strokeWidth={2.5} fillOpacity={1} fill="url(#atcoderRatingGlow)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
