"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, ChevronRight, Lock } from 'lucide-react';
import { getCFColors } from './ProfileHeader';

interface RankAchievementsProps {
  currentRating: number;
  currentRank: string;
}

export default function RankAchievements({
  currentRating = 0,
  currentRank = "Newbie"
}: RankAchievementsProps) {

  const ranksConfig = [
    { name: 'Newbie', threshold: 0, color: '#cccccc' },
    { name: 'Pupil', threshold: 1200, color: '#008000' },
    { name: 'Specialist', threshold: 1400, color: '#03a89e' },
    { name: 'Expert', threshold: 1600, color: '#0000ff' },
    { name: 'Candidate Master', threshold: 1900, color: '#aa00aa' },
    { name: 'Master', threshold: 2100, color: '#ffcc33' },
    { name: 'Grandmaster', threshold: 2400, color: '#ff3333' }
  ];

  const currentIdx = useMemo(() => {
    let index = 0;
    for (let i = 0; i < ranksConfig.length; i++) {
      if (currentRating >= ranksConfig[i].threshold) {
        index = i;
      }
    }
    return index;
  }, [currentRating]);

  const nextRank = useMemo(() => {
    if (currentIdx < ranksConfig.length - 1) {
      return ranksConfig[currentIdx + 1];
    }
    return null;
  }, [currentIdx]);

  const pointsToNext = nextRank ? nextRank.threshold - currentRating : 0;
  const progressPct = nextRank 
    ? Math.round(((currentRating - ranksConfig[currentIdx].threshold) / (nextRank.threshold - ranksConfig[currentIdx].threshold)) * 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#FF5C5C] flex items-center gap-1.5">
            <Award size={14} className="text-[#FF5C5C]" />
            <span>Rank Achievement System</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Platform promotion milestones roadmap</p>
        </div>

        <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
      </div>

      {/* Target Progress Bar */}
      {nextRank && (
        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-gray-400">
              Next Target: <span className="font-black uppercase" style={{ color: nextRank.color }}>{nextRank.name}</span>
            </span>
            <span className="text-gray-400">
              Need <span className="text-white font-mono font-black">{pointsToNext}</span> points
            </span>
          </div>

          <div className="h-2.5 rounded-full bg-white/[0.03] overflow-hidden relative">
            <div 
              className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r"
              style={{ 
                width: `${Math.max(Math.min(progressPct, 100), 4)}%`,
                backgroundImage: `linear-gradient(to right, ${getCFColors(currentRank).color}, ${nextRank.color})`
              }}
            />
          </div>

          <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-500">
            <span>{ranksConfig[currentIdx].name} ({ranksConfig[currentIdx].threshold})</span>
            <span>{progressPct}% Completed</span>
            <span>{nextRank.name} ({nextRank.threshold})</span>
          </div>
        </div>
      )}

      {/* Rank roadmap list */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
        {ranksConfig.map((item, idx) => {
          const isUnlocked = currentIdx >= idx;
          const isCurrent = currentIdx === idx;
          
          return (
            <div 
              key={item.name}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                isCurrent 
                  ? 'bg-white/[0.03] border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.06)]' 
                  : isUnlocked 
                    ? 'bg-white/[0.01] border-white/[0.04]' 
                    : 'bg-black/35 border-transparent opacity-40'
              }`}
            >
              <div 
                className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 border ${
                  isUnlocked ? 'bg-white/[0.03]' : 'bg-transparent'
                }`}
                style={{ borderColor: isUnlocked ? item.color : 'rgba(255,255,255,0.05)' }}
              >
                {isUnlocked ? (
                  <Award className="w-3.5 h-3.5" style={{ color: item.color }} />
                ) : (
                  <Lock className="w-3 h-3 text-gray-600" />
                )}
              </div>

              <span 
                className="text-[8px] font-black uppercase tracking-wider block truncate max-w-full leading-none"
                style={{ color: isUnlocked ? item.color : '#64748b' }}
              >
                {item.name}
              </span>
              <span className="text-[7px] text-gray-500 font-mono mt-1 font-bold">
                ≥ {item.threshold}
              </span>
            </div>
          );
        })}
      </div>

    </motion.div>
  );
}
