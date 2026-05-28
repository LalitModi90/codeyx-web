"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Sparkles, Star } from 'lucide-react';

interface Badge {
  name: string;
  category: string;
  iconColor: string;
  unlocked: boolean;
  unlockedDate?: string;
  description: string;
}

interface BadgeSectionProps {
  badges?: Badge[];
}

export default function BadgeSection({
  badges = []
}: BadgeSectionProps) {
  const brandColors = {
    orange: '#FFA116',
    yellow: '#FFD43B',
    accent: '#FF8C00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  if (!badges || badges.length === 0) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg py-12 flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <Award className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">No achievements earned</h3>
        <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
          Sync your profile to load analytics
        </p>
      </div>
    );
  }


  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6 overflow-hidden`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#FFA116] flex items-center gap-1.5">
            <Award size={14} className="text-[#FFA116]" />
            <span>Badges & Achievements</span>
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Explore your verified competitive programming accolades</p>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent select-none">
        {badges.map((b) => (
          <motion.div
            key={b.name}
            whileHover={{ scale: b.unlocked ? 1.03 : 1 }}
            className={`min-w-[190px] p-4 rounded-xl border flex flex-col justify-between h-44 transition-all relative ${
              b.unlocked 
                ? 'bg-white/[0.01] border-white/[0.04] hover:border-amber-500/30' 
                : 'bg-black/20 border-white/5 opacity-50'
            }`}
            style={{
              boxShadow: b.unlocked ? '0 4px 20px rgba(0, 0, 0, 0.2)' : 'none'
            }}
          >
            {b.unlocked && (
              <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-[#FFA116]" />
              </div>
            )}

            <div className="space-y-3">
              <div 
                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  b.unlocked 
                    ? 'bg-amber-500/10 border-amber-500/20' 
                    : 'bg-white/[0.02] border-white/5'
                }`}
              >
                {b.unlocked ? (
                  <Star className={`w-5 h-5 ${b.iconColor}`} />
                ) : (
                  <Lock className="w-4 h-4 text-gray-600" />
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-white tracking-wide">{b.name}</h4>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mt-0.5">{b.category}</span>
              </div>
            </div>

            <p className="text-[9px] text-gray-400 font-medium leading-relaxed mt-2 border-t border-white/[0.02] pt-2">
              {b.description}
            </p>

            {b.unlocked && b.unlockedDate && (
              <div className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest mt-2">
                Unlocked: {b.unlockedDate}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
