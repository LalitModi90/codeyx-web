"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { TrendingUp, Award, Calendar } from 'lucide-react';

interface StarProgressionChartProps {
  history: Array<{
    contestName: string;
    rating: number;
    rank: string | number;
    delta: number;
  }>;
}

export default function StarProgressionChart({ history = [] }: StarProgressionChartProps) {
  const brandColors = {
    gold: '#D4A017',
    brown: '#8B5E3C',
    accent: '#FFB84D',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  // Determine last delta trend
  const latestDelta = history.length > 0 ? history[history.length - 1].delta : 0;
  const latestContest = history.length > 0 ? history[history.length - 1].contestName : 'None';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border ${brandColors.card} shadow-2xl flex flex-col justify-between`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#FFB84D] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4A017]" />
            <span>Star Progression Trends</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Rating evolution over CodeChef contests</p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col">
              <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest leading-none">Last Delta</span>
              <span className={`text-xs font-black mt-1 ${latestDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {latestDelta >= 0 ? `+${latestDelta}` : latestDelta}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col max-w-[120px]">
              <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest leading-none truncate">Last Event</span>
              <span className="text-[10px] font-bold text-white truncate mt-1">{latestContest}</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-64 pt-4 select-none">
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="chefGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A017" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#8B5E3C" stopOpacity={0.0}/>
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
                      <div className="bg-[#0B1023] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                        <p className="text-[9px] font-black text-[#FFB84D] uppercase tracking-wider mb-1 truncate max-w-[200px]">
                          {d.contestName}
                        </p>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[10px] text-white font-bold">New Rating: <span className="font-mono text-amber-400">{d.rating}</span></p>
                          <p className="text-[9px] text-gray-400">Rank: <span className="font-bold text-white">#{d.rank}</span></p>
                          <p className="text-[9px] text-gray-400">Change: <span className={d.delta >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{d.delta >= 0 ? `+${d.delta}` : d.delta}</span></p>
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
                stroke="#D4A017" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#chefGlow)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Calendar className="w-8 h-8 text-amber-500/30 mb-2" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">No Contest History Sync</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
