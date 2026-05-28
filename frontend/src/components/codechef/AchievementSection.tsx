"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, ShieldCheck, Flame, Star, Trophy } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGlow: string;
  unlocked: boolean;
}

interface AchievementSectionProps {
  stars?: string;
  contestsCount?: number;
  streak?: number;
}

export default function AchievementSection({
  stars = "3★",
  contestsCount = 0,
  streak = 0
}: AchievementSectionProps) {
  const currentStarNum = parseInt(stars.replace(/[^0-9]/g, '')) || 3;

  const achievements: Achievement[] = [
    {
      id: 'star-starter',
      name: 'Star Rising',
      desc: 'Achieved 2★ tier rank on CodeChef',
      icon: Star,
      color: 'text-amber-600',
      bgGlow: 'rgba(160, 90, 44, 0.2)',
      unlocked: currentStarNum >= 2
    },
    {
      id: 'star-intermediate',
      name: 'Elite Competitor',
      desc: 'Achieved 3★ tier rank on CodeChef',
      icon: Award,
      color: 'text-[#D4A017]',
      bgGlow: 'rgba(212, 160, 23, 0.25)',
      unlocked: currentStarNum >= 3
    },
    {
      id: 'star-expert',
      name: 'Grandmaster Coder',
      desc: 'Achieved 5★ tier rank on CodeChef',
      icon: Trophy,
      color: 'text-[#FFB84D]',
      bgGlow: 'rgba(255, 184, 77, 0.3)',
      unlocked: currentStarNum >= 5
    },
    {
      id: 'contest-rookie',
      name: 'Active Gladiator',
      desc: 'Participated in at least 5 rated matches',
      icon: Zap,
      color: 'text-[#FFB84D]',
      bgGlow: 'rgba(255, 184, 77, 0.2)',
      unlocked: contestsCount >= 5
    },
    {
      id: 'contest-veteran',
      name: 'Contest Veteran',
      desc: 'Participated in at least 15 rated matches',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bgGlow: 'rgba(52, 211, 153, 0.2)',
      unlocked: contestsCount >= 15
    },
    {
      id: 'streak-hot',
      name: 'Streaking On Fire',
      desc: 'Maintained a active 30-day coding streak',
      icon: Flame,
      color: 'text-rose-500',
      bgGlow: 'rgba(244, 63, 94, 0.25)',
      unlocked: streak >= 30
    }
  ];

  const brandColors = {
    gold: '#D4A017',
    brown: '#8B5E3C',
    accent: '#FFB84D',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-4`}>
      <div>
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Achievements & Badges</h3>
        <p className="text-[10px] text-gray-400 mt-0.5">Badges unlocked through star rankings, contest records, and solving streaks</p>
      </div>

      {/* Horizontal Scroll wrapper */}
      <div className="flex gap-4 overflow-x-auto pb-3 pt-1 select-none scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
        {achievements.map((ach) => {
          const Icon = ach.icon;
          return (
            <motion.div
              key={ach.id}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`flex-shrink-0 w-52 p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                ach.unlocked 
                  ? 'border-white/10 bg-[#0B1023]/90 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' 
                  : 'border-white/5 bg-white/[0.01] opacity-45'
              }`}
              style={{
                boxShadow: ach.unlocked ? `0 0 25px ${ach.bgGlow}` : 'none'
              }}
            >
              {ach.unlocked && (
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl transition-all" style={{ backgroundColor: ach.color + '20' }} />
              )}

              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  ach.unlocked 
                    ? 'border-white/10 bg-white/[0.03]' 
                    : 'border-white/5 bg-transparent'
                }`}
                style={{ color: ach.unlocked ? ach.color : '#64748b' }}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  ach.unlocked 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-white/5 text-gray-500 border border-white/5'
                }`}>
                  {ach.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              <div>
                <h4 className={`text-xs font-black tracking-tight ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>{ach.name}</h4>
                <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">{ach.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
