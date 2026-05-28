"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, BadgeCheck, AlertTriangle } from 'lucide-react';

interface BadgeItem {
  name: string;
  stars: number;
  category: string;
  unlockedDate: string;
  color: string;
}

interface BadgesSectionProps {
  badges?: BadgeItem[];
}

export default function BadgesSection({ badges = [] }: BadgesSectionProps) {
  const hasData = badges && badges.length > 0;
  const brandColors = {
    primary: '#00EA64',
    secondary: '#00C853',
    accent: '#39FF14',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#00EA64] flex items-center gap-1.5">
          <BadgeCheck size={14} className="text-[#00EA64]" />
          <span>Badges & Milestones</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Earned star ratings and competitive milestones</p>
      </div>

      {!hasData ? (
        <div className={`p-8 rounded-3xl border ${brandColors.card} text-center flex flex-col items-center justify-center space-y-3`}>
          <AlertTriangle size={32} className="text-gray-600/40 animate-pulse" />
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-white block">No Badges Unlocked Yet (N/A)</span>
            <p className="text-[10px] text-gray-500 max-w-sm leading-relaxed mx-auto">
              Solve domain problems in Algorithms, SQL, or Java to earn stars. Dynamic badges will populate automatically when unlocked!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className={`p-5 rounded-3xl border ${brandColors.card} hover:border-[#00EA64]/40 flex items-center gap-4 hover:shadow-[0_0_20px_rgba(0,234,100,0.06)] transition-all duration-300 relative group`}
            >
              <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center relative group-hover:border-[#00EA64]/30 transition-colors">
                <Star className="w-6 h-6" style={{ fill: badge.color, color: badge.color }} />
                <span className="text-[7px] font-black text-white absolute bottom-1 font-mono">
                  {badge.stars}★
                </span>
              </div>

              <div>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block">{badge.category}</span>
                <h4 className="font-extrabold text-xs text-white group-hover:text-[#00EA64] transition-colors mt-0.5">{badge.name} Badge</h4>
                <span className="text-[8px] text-gray-400 font-semibold block mt-0.5">Unlocked: {badge.unlockedDate}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
