"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trophy, TrendingUp, Calendar, Zap } from 'lucide-react';

interface ContestHistoryPoint {
  contestName: string;
  rating: number;
  rank: number;
  ratingChange: number;
}

interface ContestAnalyticsProps {
  currentRating?: number;
  topPercent?: number;
  contestsAttended?: number;
  globalContestRank?: number;
  globalProfileRank?: number;
  ratingHistory?: ContestHistoryPoint[];
}

export default function ContestAnalytics({
  currentRating = 0,
  topPercent = 0,
  contestsAttended = 0,
  globalContestRank = 0,
  globalProfileRank = 0,
  ratingHistory = []
}: ContestAnalyticsProps) {
  const brandColors = {
    orange: '#FFA116',
    yellow: '#FFD43B',
    accent: '#FF8C00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} flex flex-col justify-between shadow-lg`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#FFA116] flex items-center gap-1.5">
            <Trophy size={14} className="text-[#FFA116]" />
            <span>Contest Performance Analytics</span>
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Rating milestones and progression chart</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.02] border border-white/5 text-[9px] font-bold text-gray-400">
            <Calendar size={12} className="text-gray-500" />
            <span>{contestsAttended} Contests</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[9px] font-bold text-[#FFA116]">
            <Zap size={12} className="text-[#FFA116]" />
            <span>Top {topPercent}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        <div className="xl:col-span-8 h-64 pt-4 flex items-center justify-center w-full">
          {ratingHistory && ratingHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ratingHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="contestGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFA116" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FFA116" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis 
                  dataKey="contestName" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }}
                />
                <YAxis 
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0B1023] border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
                          <p className="text-[9px] font-black text-[#FFA116] uppercase tracking-wider mb-1 truncate max-w-[180px]">{d.contestName}</p>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[10px] text-white font-bold">New Rating: <span className="font-mono text-orange-400">{d.rating}</span></p>
                            <p className="text-[9px] text-gray-400">Rank: <span className="font-bold text-white">#{d.rank}</span></p>
                            <p className="text-[9px] text-gray-400">Change: <span className={d.ratingChange >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{d.ratingChange >= 0 ? `+${d.ratingChange}` : d.ratingChange}</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#FFA116" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#contestGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01] relative overflow-hidden group py-8">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
              <Trophy className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">No contest history synced</h3>
              <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
                Sync your profile to load analytics
              </p>
            </div>
          )}
        </div>

        <div className="xl:col-span-4 flex flex-col justify-center gap-4">
          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1 block">Rating Milestone</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{currentRating}</span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp size={10} />
                <span>+50 last match</span>
              </span>
            </div>
            <span className="text-[8px] font-semibold text-gray-500 mt-1 block">Current Contest Standing</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1 block">Global Standing</span>
            <span className="text-xl font-black text-white font-mono">
              {globalContestRank > 0 
                ? `#${globalContestRank.toLocaleString()}` 
                : (globalProfileRank > 0 ? `#${globalProfileRank.toLocaleString()}` : "Unrated")}
            </span>
            <span className="text-[8px] font-semibold text-gray-500 mt-1 block">
              {globalContestRank > 0 
                ? `Top ${topPercent}% active competitors` 
                : "Profile Rank Fallback • Unrated in Contests"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
