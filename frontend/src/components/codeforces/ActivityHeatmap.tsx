"use client";

import React, { useState, useMemo } from 'react';
import { Calendar, Flame, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeatmapDay {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  activityData?: HeatmapDay[];
  streak?: number;
  activeDaysCount?: number;
}

export default function ActivityHeatmap({
  activityData = [],
  streak = 0,
  activeDaysCount = 0
}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  const brandColors = {
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const hasData = Array.isArray(activityData) && activityData.length > 0;

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg h-52 flex flex-col items-center justify-center relative overflow-hidden group`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-transparent pointer-events-none" />
        <Calendar className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">Not enough activity data</h3>
        <p className="text-[10px] text-gray-500 mt-1 max-w-xs text-center leading-relaxed">
          Sync your profile to load analytics
        </p>
      </motion.div>
    );
  }

  // Map the last 365 days to ensure exact real data representation
  const calendarCells = useMemo(() => {
    const cellsList = [];
    const dateMap: Record<string, number> = {};
    activityData.forEach(d => {
      dateMap[d.date] = d.count;
    });

    const today = new Date();
    // Start from 364 days ago
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      cellsList.push({
        date: dateStr,
        count: dateMap[dateStr] || 0
      });
    }
    return cellsList;
  }, [activityData]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.05]';
    if (count <= 1) return 'bg-blue-500/20 hover:bg-blue-500/30';
    if (count <= 3) return 'bg-blue-500/45 hover:bg-blue-500/60';
    if (count <= 5) return 'bg-blue-500/70 shadow-[0_0_8px_rgba(59,130,246,0.3)] hover:bg-blue-500/80';
    return 'bg-[#4DA3FF] shadow-[0_0_12px_rgba(77,163,255,0.6)] hover:scale-110';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-5 relative`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#4DA3FF] flex items-center gap-1.5">
            <Calendar size={14} className="text-[#4DA3FF]" />
            <span>Activity Heatmap</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Coding intensity frequency across the calendar year</p>
        </div>

        <div className="flex items-center gap-4 text-[9px] font-bold">
          <div className="flex flex-col">
            <span className="text-gray-500 uppercase leading-none mb-0.5">Active Days</span>
            <span className="text-white font-mono">{activeDaysCount} Days</span>
          </div>
          <div className="w-[1px] h-6 bg-white/5" />
          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-xl">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-gray-300">
              Active streak: <span className="text-white font-black">{streak} days</span>
            </span>
          </div>
        </div>
      </div>

      {/* Calendar grid representation */}
      <div className="overflow-x-auto pb-1 select-none scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent relative">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px]">
          {calendarCells.map((cell, idx) => (
            <motion.div 
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Math.min(idx * 0.0008, 0.3) }}
              className={`w-2.5 h-2.5 rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer ${getColor(cell.count)}`}
              onMouseEnter={() => setHoveredDay(cell)}
              onMouseLeave={() => setHoveredDay(null)}
            />
          ))}
        </div>

        {hoveredDay && (
          <div className="absolute top-0 right-6 bg-[#0B1023] border border-white/10 p-2 rounded-xl text-[9px] text-white shadow-xl backdrop-blur-md z-30 flex items-center gap-1.5">
            <Info size={10} className="text-[#4DA3FF]" />
            <span>{hoveredDay.count} Submissions on <span className="font-bold font-mono">{hoveredDay.date}</span></span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[8px] text-gray-500 uppercase tracking-widest font-black pt-1">
        <span>Less active</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-white/[0.02] border border-white/[0.02]" />
          <div className="w-2 h-2 rounded bg-blue-500/20" />
          <div className="w-2 h-2 rounded bg-blue-500/45" />
          <div className="w-2 h-2 rounded bg-blue-500/70" />
          <div className="w-2 h-2 rounded bg-[#4DA3FF]" />
        </div>
        <span>More active</span>
      </div>
    </motion.div>
  );
}
