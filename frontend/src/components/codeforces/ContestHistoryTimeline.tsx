"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown } from 'lucide-react';
import { getCFColors } from './ProfileHeader';

interface ContestPoint {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingUpdateTimeSeconds: number;
}

interface ContestHistoryTimelineProps {
  history: ContestPoint[];
}

export default function ContestHistoryTimeline({ history = [] }: ContestHistoryTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(5);
  const hasData = history && history.length > 0;

  const chronologicalHistory = useMemo(() => {
    return [...history].reverse();
  }, [history]);

  const displayedHistory = chronologicalHistory.slice(0, visibleCount);

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl border bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl h-64 flex flex-col items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-transparent pointer-events-none" />
        <Calendar className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">No contest timeline synced</span>
        <span className="text-[9px] text-gray-500 mt-1 max-w-[280px] text-center px-4 leading-relaxed font-semibold">
          Participate in rated Codeforces contests and sync your handle to populate the timeline.
        </span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#FF5C5C] flex items-center gap-1.5">
          <Calendar size={14} className="text-[#FF5C5C]" />
          <span>Contest History Timeline</span>
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Vertical milestone progression history</p>
      </div>

      <div className="relative border-l border-white/5 pl-6 ml-4 space-y-6">
        <AnimatePresence>
          {displayedHistory.map((item, index) => {
            const delta = item.newRating - item.oldRating;
            const isPositive = delta >= 0;
            const rankColors = getCFColors(item.newRating > 1600 ? 'Expert' : 'Pupil');
            
            return (
              <motion.div
                key={item.contestId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative group"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#0B1023] border-2 border-white/10 group-hover:border-[#4DA3FF] group-hover:scale-125 transition-all duration-300 shadow-[0_0_8px_rgba(77,163,255,0.4)]" />

                {/* Contest Card */}
                <div className="p-4 rounded-xl border bg-[#0B1023]/70 border-white/[0.04] hover:border-white/10 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bottom-0 w-1.5" style={{ backgroundColor: rankColors.color }} />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-2">
                    <div>
                      <span className="text-[8px] text-gray-500 font-mono font-bold block mb-1">
                        {item.ratingUpdateTimeSeconds
                          ? new Date(item.ratingUpdateTimeSeconds * 1000).toLocaleDateString()
                          : 'Date unknown'}
                      </span>
                      <h4 className="text-xs font-bold text-white max-w-[400px] truncate leading-tight">
                        {item.contestName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest leading-none mb-1">Achieved Rank</span>
                        <span className="text-xs font-black text-gray-300">#{item.rank}</span>
                      </div>

                      <div className="flex flex-col items-end pl-3 border-l border-white/5">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest leading-none mb-1">New Rating</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black" style={{ color: rankColors.color }}>{item.newRating}</span>
                          <span className={`text-[9px] font-extrabold ${isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>
                            ({isPositive ? `+${delta}` : delta})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {chronologicalHistory.length > visibleCount && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount(prev => prev + 5)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <span>Show Older Contests</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
