"use client";

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { LineChart, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContestPoint {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingUpdateTimeSeconds: number;
}

interface RatingProgressionChartProps {
  history: ContestPoint[];
  color?: string;
  glow?: string;
}

export default function RatingProgressionChart({
  history = [],
  color = '#4DA3FF',
  glow = 'rgba(77, 163, 255, 0.4)'
}: RatingProgressionChartProps) {

  // Rule: Only show rating graph if at least 2 contest records exist.
  const hasEnoughData = history && history.length >= 2;

  if (!hasEnoughData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl border bg-[#0B1023]/70 border-white/[0.08] backdrop-blur-md shadow-2xl h-72 flex flex-col items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        <LineChart className="w-10 h-10 text-gray-500 mb-3 group-hover:scale-110 transition-transform duration-500" />
        
        <span className="text-xs font-black uppercase tracking-wider text-gray-300">No contest history synced</span>
        <span className="text-[10px] text-gray-500 mt-1 max-w-[340px] text-center px-4 leading-relaxed font-medium">
          Participate in at least 2 Codeforces rated contests and sync your profile to generate detailed rating progression analytics.
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border bg-[#0B1023]/70 border-white/[0.08] backdrop-blur-md shadow-2xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#4DA3FF] flex items-center gap-1.5">
            <LineChart size={14} className="text-[#4DA3FF]" />
            <span>Contest Rating Progression</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Rating evolution over your {history.length} rated contests</p>
        </div>

        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#4DA3FF] text-[8px] font-black uppercase tracking-widest">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Active Timeline</span>
        </span>
      </div>

      <div className="h-64 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="cfGraphGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="contestId" 
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
            />
            <YAxis 
              domain={['dataMin - 100', 'dataMax + 100']}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  const delta = d.newRating - d.oldRating;
                  return (
                    <div className="bg-[#0B1023] border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
                      <p className="text-[9px] font-black text-[#4DA3FF] uppercase tracking-wider mb-1 truncate max-w-[200px]">{d.contestName}</p>
                      <div className="flex flex-col gap-0.5 text-[10px]">
                        <p className="text-white font-bold">New Rating: <span className="font-mono text-blue-400">{d.newRating}</span></p>
                        <p className="text-gray-400 font-medium">Rank: <span className="font-bold text-white">#{d.rank}</span></p>
                        <p className="text-gray-400 font-medium">Change: <span className={delta >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{delta >= 0 ? `+${delta}` : delta}</span></p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="newRating" 
              stroke={color} 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#cfGraphGlow)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
