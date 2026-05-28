"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Target, CheckCircle2, Circle } from 'lucide-react';

interface DivisionProgressionProps {
  rating: number;
}

export default function DivisionProgression({ rating = 1157 }: DivisionProgressionProps) {
  const brandColors = {
    gold: '#D4A017',
    brown: '#8B5E3C',
    accent: '#FFB84D',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const divisions = [
    { name: 'Division 4', range: '< 1400', min: 0, max: 1399, id: 4 },
    { name: 'Division 3', range: '1400 - 1599', min: 1400, max: 1599, id: 3 },
    { name: 'Division 2', range: '1600 - 1999', min: 1600, max: 1999, id: 2 },
    { name: 'Division 1', range: '≥ 2000', min: 2000, max: 5000, id: 1 },
  ];

  // Calculate current division and target
  const details = useMemo(() => {
    let currentDiv = divisions[0];
    let nextDiv: { name: string; range: string; min: number; max: number; id: number; } | null = divisions[1];

    if (rating >= 2000) {
      currentDiv = divisions[3];
      nextDiv = null;
    } else if (rating >= 1600) {
      currentDiv = divisions[2];
      nextDiv = divisions[3];
    } else if (rating >= 1400) {
      currentDiv = divisions[1];
      nextDiv = divisions[2];
    }

    let progressPct = 0;
    let pointsNeeded = 0;

    if (nextDiv) {
      const totalRange = nextDiv.min - currentDiv.min;
      const currentProgress = rating - currentDiv.min;
      progressPct = Math.max(Math.min(Math.round((currentProgress / totalRange) * 100), 100), 0);
      pointsNeeded = nextDiv.min - rating;
    } else {
      progressPct = 100;
    }

    return { currentDiv, nextDiv, progressPct, pointsNeeded };
  }, [rating]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Division Roadmap</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Track your rank tier advancement across CodeChef rating divisions</p>
        </div>

        {details.nextDiv && (
          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-xl">
            <Target className="w-3.5 h-3.5 text-[#FFB84D]" />
            <span className="text-[9px] font-bold text-gray-300">
              Next Goal: <span className="text-white font-black">{details.nextDiv.name}</span> in <span className="text-[#FFB84D] font-mono">{details.pointsNeeded} pts</span>
            </span>
          </div>
        )}
      </div>

      {/* Progress slider bar */}
      {details.nextDiv && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-gray-400">Progression Level</span>
            <span className="text-[#FFB84D]">{details.progressPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/[0.03] p-0.5 overflow-hidden border border-white/5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#8B5E3C] to-[#D4A017] transition-all duration-1000"
              style={{ 
                width: `${details.progressPct}%`,
                boxShadow: `0 0 12px ${brandColors.gold}50`
              }}
            />
          </div>
        </div>
      )}

      {/* Timeline nodes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
        {divisions.map((div) => {
          const isPassed = rating >= div.min;
          const isCurrent = rating >= div.min && rating <= div.max;
          
          return (
            <div 
              key={div.id} 
              className={`p-4 rounded-xl border relative flex flex-col justify-between transition-all duration-300 ${
                isCurrent 
                  ? 'border-[#D4A017] bg-[#D4A017]/[0.03] shadow-[0_0_15px_rgba(212,160,23,0.06)]' 
                  : (isPassed ? 'border-white/10 bg-white/[0.01]' : 'border-white/5 opacity-35 bg-transparent')
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[9px] font-black uppercase tracking-wider ${
                  isCurrent ? 'text-[#FFB84D]' : (isPassed ? 'text-emerald-400' : 'text-gray-500')
                }`}>
                  {div.name}
                </span>

                {isCurrent ? (
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide bg-[#D4A017] text-black">
                    Current
                  </span>
                ) : (
                  isPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-gray-600" />
                )}
              </div>

              <div>
                <span className="text-xs font-black text-white font-mono leading-none">{div.range}</span>
                <span className="text-[8px] text-gray-500 font-bold block mt-1 uppercase tracking-widest">Rating Range</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
