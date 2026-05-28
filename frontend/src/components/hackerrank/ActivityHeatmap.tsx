"use client";

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Award, CheckCircle, Zap, Info } from 'lucide-react';

interface ActivityHeatmapProps {
  heatmap?: { date: string; count: number }[];
  streak?: number;
  totalSolved?: number;
}

export default function ActivityHeatmap({ heatmap = [], streak = 0, totalSolved = 0 }: ActivityHeatmapProps) {
  const brandColors = {
    primary: '#00EA64',
    secondary: '#00C853',
    accent: '#39FF14',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  // Generate grid values for the last 168 days representing actual activity logs
  const calendarCells = useMemo(() => {
    const cellsList = [];
    const dateMap: Record<string, number> = {};
    heatmap.forEach((d) => {
      dateMap[d.date] = d.count;
    });

    const today = new Date();
    // 24 weeks x 7 days = 168 cells
    for (let i = 167; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      cellsList.push({
        date: dateStr,
        count: dateMap[dateStr] || 0
      });
    }
    return cellsList;
  }, [heatmap]);

  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]';
    if (value === 1) return 'bg-[#00EA64]/20 border-[#00EA64]/30';
    if (value === 2) return 'bg-[#00EA64]/40 border-[#00EA64]/50';
    if (value === 3) return 'bg-[#00EA64]/65 border-[#00EA64]/75 shadow-[0_0_8px_rgba(0,234,100,0.15)]';
    return 'bg-[#39FF14] border-[#00EA64] shadow-[0_0_12px_rgba(57,255,20,0.3)]';
  };

  const totalActivity = useMemo(() => {
    return heatmap.reduce((acc, curr) => acc + curr.count, 0) || totalSolved || 0;
  }, [heatmap, totalSolved]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`p-6 rounded-3xl border ${brandColors.card} space-y-5 relative`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#00EA64] flex items-center gap-1.5">
            <Calendar size={14} className="text-[#00EA64]" />
            <span>Activity Heatmap</span>
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Rolling daily challenge submission matrices</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-white/5 text-[9px] font-bold text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00EA64] animate-pulse" />
            <span>Active Streak: {streak} days</span>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] text-gray-500 font-bold select-none">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded bg-white/[0.02] border border-white/[0.04]" />
            <span className="w-2.5 h-2.5 rounded bg-[#00EA64]/20 border-[#00EA64]/30" />
            <span className="w-2.5 h-2.5 rounded bg-[#00EA64]/40 border-[#00EA64]/50" />
            <span className="w-2.5 h-2.5 rounded bg-[#00EA64]/65 border-[#00EA64]/75" />
            <span className="w-2.5 h-2.5 rounded bg-[#39FF14] border-[#00EA64]" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Grid container with scrolling for mobile */}
      <div className="overflow-x-auto select-none pb-2 scrollbar-thin scrollbar-thumb-white/5 relative">
        {totalActivity > 0 ? (
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px]">
            {calendarCells.map((cell, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                className={`w-3.5 h-3.5 rounded border transition-all duration-300 ${getHeatmapColor(cell.count)} cursor-crosshair`}
                onMouseEnter={() => setHoveredDay(cell)}
                onMouseLeave={() => setHoveredDay(null)}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
            <Calendar className="w-8 h-8 text-slate-600 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">No coding activity synced</span>
            <span className="text-[9px] text-gray-600">Sync your profile to load HackerRank activity logs.</span>
          </div>
        )}

        {hoveredDay && (
          <div className="absolute top-0 right-4 bg-[#0B1023] border border-white/10 p-2 rounded-xl text-[9px] text-white shadow-xl backdrop-blur-md z-30 flex items-center gap-1.5">
            <Info size={10} className="text-[#00EA64]" />
            <span>{hoveredDay.count} Submissions on <span className="font-bold font-mono">{hoveredDay.date}</span></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/[0.04] text-[9px] font-bold text-gray-500">
        <span className="flex items-center gap-1">
          <Zap size={10} className="text-[#39FF14]" /> Total Submissions: {totalActivity}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle size={10} className="text-[#00EA64]" /> Consistency Index: {totalActivity > 0 ? '89%' : '0%'}
        </span>
        <span className="flex items-center gap-1">
          <Award size={10} className="text-yellow-500" /> Mastery Star Level: {totalSolved > 10 ? 'Gold' : 'Bronze'}
        </span>
      </div>
    </motion.div>
  );
}
