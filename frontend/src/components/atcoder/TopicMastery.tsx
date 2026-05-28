"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Award, Compass, ShieldAlert } from 'lucide-react';

interface Topic {
  subject: string;
  solved: number;
  category: string;
}

interface TopicMasteryProps {
  topics?: Topic[];
}

export default function TopicMastery({
  topics = []
}: TopicMasteryProps) {
  const brandColors = {
    theme: '#FF8A00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const hasTopics = Array.isArray(topics) && topics.length > 0;

  if (!hasTopics) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg py-12 flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <Target className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">No solved problems available</h3>
        <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
          Sync your profile to load analytics
        </p>
      </div>
    );
  }

  const categoryGroups = useMemo(() => {
    const groups: Record<string, Topic[]> = {
      'Advanced': [],
      'Intermediate': [],
      'Fundamental': []
    };
    topics.forEach(t => {
      const cat = t.category || 'Fundamental';
      if (groups[cat]) {
        groups[cat].push(t);
      } else {
        groups['Fundamental'].push(t);
      }
    });
    return groups;
  }, [topics]);

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6`}>
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#FF8A00] flex items-center gap-1.5">
          <Target size={14} className="text-[#FF8A00]" />
          <span>Topic Mastery Breakdown</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Solve counts classified by task difficulty estimated ratings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(categoryGroups).map(([category, items]) => (
          <div key={category} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                {category === 'Advanced' && <Award size={12} className="text-orange-500" />}
                {category === 'Intermediate' && <Compass size={12} className="text-amber-500" />}
                {category === 'Fundamental' && <Target size={12} className="text-emerald-500" />}
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  category === 'Advanced' ? 'text-orange-400' 
                  : category === 'Intermediate' ? 'text-amber-400' 
                  : 'text-emerald-400'
                }`}>
                  {category}
                </span>
              </div>
              
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] font-semibold text-gray-300">
                    <span>{item.subject}</span>
                    <span className="font-mono text-white bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded">
                      {item.solved} Solved
                    </span>
                  </div>
                ))}
                {items.length === 0 && (
                  <span className="text-[9px] text-gray-600 block italic py-2">No problems solved in this tier</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
