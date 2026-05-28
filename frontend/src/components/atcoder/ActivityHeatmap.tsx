"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Info } from 'lucide-react';

interface HeatmapDay {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  activityData?: HeatmapDay[];
  yearlyStreak?: number;
  activeDaysCount?: number;
}

export default function ActivityHeatmap({
  activityData = [],
  yearlyStreak = 0,
  activeDaysCount = 0
}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  const brandColors = {
    theme: '#FF8A00',
    accent: '#FF8A00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const hasData = Array.isArray(activityData) && activityData.length > 0;

  if (!hasData) {
    return (
      <div className="bg-[#0B1023]/80 border border-white/[0.08] backdrop-blur-xl p-6 rounded-2xl flex flex-col items-center justify-center text-center py-12 shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <Calendar className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">Not enough activity data</h3>
        <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
          Sync your profile to load analytics
        </p>
      </div>
    );
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-[#161B22]/60 hover:bg-[#1E2530]';
    if (count <= 1) return 'bg-amber-600/30 border border-amber-500/10 hover:bg-amber-600/50';
    if (count <= 3) return 'bg-amber-500/50 border border-amber-500/20 hover:bg-amber-500/70';
    if (count <= 5) return 'bg-orange-500/70 border border-orange-500/30 hover:bg-orange-500/90';
    return 'bg-[#FF8A00] border border-[#FF8A00]/40 hover:scale-105';
  };

  return (
    <div className="bg-[#0B1023]/80 border border-white/[0.08] backdrop-blur-xl p-6 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#FF8A00] flex items-center gap-1.5">
            <Calendar size={14} className="text-[#FF8A00]" />
            <span>AtCoder Solving Streak Density</span>
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Yearly submission frequency and coding intensity</p>
        </div>

        <div className="flex gap-4 text-[9px] font-bold">
          <div className="flex flex-col">
            <span className="text-gray-500 uppercase leading-none mb-0.5">Active Days</span>
            <span className="text-white font-mono">{activeDaysCount} Days</span>
          </div>
          <div className="w-[1px] h-6 bg-white/5" />
          <div className="flex flex-col">
            <span className="text-gray-500 uppercase leading-none mb-0.5">Peak Streak</span>
            <span className="text-amber-400 font-mono">{yearlyStreak} Days</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 py-4 select-none overflow-x-auto relative">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-full">
          {activityData.map((day, idx) => (
            <motion.div
              key={day.date}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Math.min(idx * 0.001, 0.4) }}
              className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-pointer relative ${getColor(day.count)}`}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            />
          ))}
        </div>

        {hoveredDay && (
          <div className="absolute top-0 right-6 bg-[#0B1023] border border-white/10 p-2 rounded-xl text-[9px] text-white shadow-xl backdrop-blur-md z-30 flex items-center gap-1.5">
            <Info size={10} className="text-[#FF8A00]" />
            <span>{hoveredDay.count} Submissions on <span className="font-bold font-mono">{hoveredDay.date}</span></span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[8px] font-bold text-gray-500 border-t border-white/[0.03] pt-3">
        <span>Less</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#161B22]/60" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-amber-600/30" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-orange-500/70" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#FF8A00]" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
