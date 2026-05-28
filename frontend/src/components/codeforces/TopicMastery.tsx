"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, Award, Sparkles } from 'lucide-react';

interface TagMastery {
  name: string;
  value: number;
}

interface TopicMasteryProps {
  tags?: TagMastery[];
  solvedCount: number;
}

export default function TopicMastery({ tags = [], solvedCount = 0 }: TopicMasteryProps) {
  const brandColors = {
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  // Rule: Only show tags if enough solved problems exist (at least 5 solved problems)
  const isEligible = solvedCount >= 5 && tags && tags.length > 0;

  if (!isEligible) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg h-64 flex flex-col items-center justify-center relative overflow-hidden group`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent pointer-events-none" />
        <AlertCircle className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Not enough solved problems for tag analytics</span>
        <span className="text-[9px] text-gray-500 mt-1 max-w-[280px] text-center px-4 leading-relaxed font-semibold">
          Solve at least 5 unique problems to unlock high-fidelity tags and dynamic category coverage metrics.
        </span>
      </motion.div>
    );
  }

  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => b.value - a.value);
  }, [tags]);

  const maxVal = sortedTags[0]?.value || 1;

  // Categorize tags into advanced, intermediate, fundamental
  const groups = useMemo(() => {
    const advancedTags = ['dp', 'graphs', 'data structures', 'trees', 'flows', 'geometry'];
    const fundamentalTags = ['implementation', 'math', 'brute force', 'greedy', 'constructive algorithms', 'strings'];

    const adv: TagMastery[] = [];
    const inter: TagMastery[] = [];
    const fund: TagMastery[] = [];

    sortedTags.forEach(t => {
      const name = t.name.toLowerCase();
      if (advancedTags.some(tag => name.includes(tag))) {
        adv.push(t);
      } else if (fundamentalTags.some(tag => name.includes(tag))) {
        fund.push(t);
      } else {
        inter.push(t);
      }
    });

    return { adv, inter, fund };
  }, [sortedTags]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#4DA3FF] flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#4DA3FF]" />
            <span>Parsed Topic Mastery</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Distribution of parsed algorithmic skills from accepted challenges</p>
        </div>

        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-widest">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Algorithm Analyzer</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Advanced Algorithms */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Award className="w-4 h-4 text-rose-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Advanced Algorithms</span>
          </div>
          <div className="space-y-3">
            {groups.adv.slice(0, 4).map(t => {
              const pct = Math.round((t.value / maxVal) * 100);
              return (
                <div key={t.name} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-gray-300 capitalize">{t.name}</span>
                    <span className="text-rose-400 font-mono">x{t.value}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.03] overflow-hidden">
                    <div className="h-full rounded-full bg-rose-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {groups.adv.length === 0 && (
              <span className="text-[9px] text-gray-600 font-bold block pt-2">No advanced topics parsed yet</span>
            )}
          </div>
        </div>

        {/* Intermediate Algorithms */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Intermediate Skills</span>
          </div>
          <div className="space-y-3">
            {groups.inter.slice(0, 4).map(t => {
              const pct = Math.round((t.value / maxVal) * 100);
              return (
                <div key={t.name} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-gray-300 capitalize">{t.name}</span>
                    <span className="text-purple-400 font-mono">x{t.value}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.03] overflow-hidden">
                    <div className="h-full rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {groups.inter.length === 0 && (
              <span className="text-[9px] text-gray-600 font-bold block pt-2">No intermediate topics parsed yet</span>
            )}
          </div>
        </div>

        {/* Fundamental Algorithms */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Fundamental Logic</span>
          </div>
          <div className="space-y-3">
            {groups.fund.slice(0, 4).map(t => {
              const pct = Math.round((t.value / maxVal) * 100);
              return (
                <div key={t.name} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-gray-300 capitalize">{t.name}</span>
                    <span className="text-emerald-400 font-mono">x{t.value}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.03] overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {groups.fund.length === 0 && (
              <span className="text-[9px] text-gray-600 font-bold block pt-2">No fundamental topics parsed yet</span>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
