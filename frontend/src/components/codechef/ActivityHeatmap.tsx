"use client";

import React, { useMemo, useState } from 'react';
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
  yearlyStreak = 112,
  activeDaysCount = 148
}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  // Generate mock 365 days if activityData is empty
  const calendarGrid = useMemo(() => {
    if (activityData.length > 0) return activityData;

    const days: HeatmapDay[] = [];
    const today = new Date();
    // 52 weeks = 364 days
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      // Randomly populate values to simulate realistic solve logs
      const randomValue = Math.random() < 0.32 ? Math.floor(Math.random() * 5) : 0;
      days.push({
        date: d.toISOString().split('T')[0],
        count: randomValue
      });
    }
    return days;
  }, [activityData]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-[#161B22]/60 hover:bg-[#1E2530]';
    if (count <= 1) return 'bg-[#8B5E3C]/30 border border-[#8B5E3C]/10 hover:bg-[#8B5E3C]/50';
    if (count <= 3) return 'bg-[#D4A017]/40 border border-[#D4A017]/20 hover:bg-[#D4A017]/60';
    if (count <= 5) return 'bg-[#FFB84D]/60 border border-[#FFB84D]/30 hover:bg-[#FFB84D]/80';
    return 'bg-[#FFB84D] border border-[#FFB84D]/40 hover:scale-105';
  };

  return (
    <div className="bg-[#0B1023]/80 border border-white/[0.08] backdrop-blur-xl p-6 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#FFB84D] flex items-center gap-1.5">
            <Calendar size={14} className="text-[#D4A017]" />
            <span>Problem Solving Activity Heatmap</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Coding streak density over the past 365 days</p>
        </div>

        <div className="flex gap-4 text-[9px] font-bold">
          <div className="flex flex-col">
            <span className="text-gray-500 uppercase leading-none mb-0.5">Active Days</span>
            <span className="text-white font-mono">{activeDaysCount} Days</span>
          </div>
          <div className="w-[1px] h-6 bg-white/5" />
          <div className="flex flex-col">
            <span className="text-gray-500 uppercase leading-none mb-0.5">Yearly Peak Streak</span>
            <span className="text-amber-400 font-mono">{yearlyStreak} Days</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 py-4 select-none overflow-x-auto relative">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-full">
          {calendarGrid.map((day, idx) => (
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
            <Info size={10} className="text-[#FFB84D]" />
            <span>{hoveredDay.count} Solved on <span className="font-bold font-mono">{hoveredDay.date}</span></span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[8px] font-bold text-gray-500 border-t border-white/[0.03] pt-3">
        <span>Less</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#161B22]/60" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#8B5E3C]/30" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#D4A017]/40" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#FFB84D]/60" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#FFB84D]" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
