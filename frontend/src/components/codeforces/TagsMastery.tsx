"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface TagData {
  name: string;
  value: number;
}

interface TagsMasteryProps {
  tags?: TagData[];
  solvedCount: number;
  selectedTag?: string | null;
  onSelectTag?: (tag: string | null) => void;
}

export default function TagsMastery({ 
  tags = [], 
  solvedCount = 0,
  selectedTag = null,
  onSelectTag
}: TagsMasteryProps) {
  const hasEnoughData = solvedCount >= 5 && tags && tags.length > 0;

  const chartData = useMemo(() => {
    if (!hasEnoughData) return [];
    
    const targetTags = [
      { name: 'Greedy', alias: ['greedy'] },
      { name: 'DP', alias: ['dp', 'dynamic programming'] },
      { name: 'Graphs', alias: ['graphs', 'dfs and similar', 'trees', 'shortest paths', 'flows'] },
      { name: 'Math', alias: ['math', 'number theory', 'combinatorics', 'probabilities'] },
      { name: 'Binary Search', alias: ['binary search'] },
      { name: 'Strings', alias: ['strings', 'string suffix structures'] },
      { name: 'Implementation', alias: ['implementation', 'constructive algorithms', 'brute force'] }
    ];

    return targetTags.map(target => {
      let count = 0;
      tags.forEach(t => {
        const lowerName = t.name.toLowerCase();
        if (target.alias.some(alias => lowerName.includes(alias))) {
          count += t.value;
        }
      });
      return { subject: target.name, A: count, fullMark: 25 };
    });
  }, [tags, hasEnoughData]);

  if (!hasEnoughData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl h-64 flex flex-col items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent pointer-events-none" />
        <AlertCircle className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Not enough solved problems for tag analytics</span>
        <span className="text-[9px] text-gray-500 mt-1 max-w-[280px] text-center px-4 leading-relaxed font-semibold">
          Complete at least 5 competitive problems on Codeforces to initialize dynamic radar chart tag mastery.
        </span>
      </motion.div>
    );
  }

  const maxSolve = Math.max(...chartData.map(c => c.A)) || 1;

  const handleTagClick = (tagName: string | null) => {
    if (onSelectTag) {
      onSelectTag(selectedTag === tagName ? null : tagName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#4DA3FF] flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#4DA3FF]" />
            <span>Problem Tags Mastery</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Radar analysis mapping algorithmic topic concentration • Click tag to filter</p>
        </div>
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/20 text-[#00D1FF] text-[8px] font-black uppercase tracking-widest">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Active Skill Profile</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }} />
              <Radar 
                name="Solve rate" 
                dataKey="A" 
                stroke="#4DA3FF" 
                fill={selectedTag ? "rgba(0, 209, 255, 0.15)" : "#4DA3FF"} 
                fillOpacity={0.25} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-6 space-y-3">
          {chartData.map((item, idx) => {
            const pct = Math.round((item.A / maxSolve) * 100);
            const isSelected = selectedTag === item.subject;
            return (
              <motion.div 
                key={idx}
                onClick={() => handleTagClick(item.subject)}
                whileHover={{ x: 4 }}
                className={`space-y-1 cursor-pointer p-1.5 rounded-xl transition-all duration-300 border ${
                  isSelected 
                    ? 'bg-blue-500/[0.06] border-[#4DA3FF]/20 shadow-[0_0_15px_rgba(77,163,255,0.08)]' 
                    : 'border-transparent hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span className={isSelected ? "text-[#4DA3FF]" : "text-gray-300"}>{item.subject}</span>
                  <span className="text-[#4DA3FF] font-mono">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#00D1FF] to-[#4DA3FF] shadow-[0_0_8px_#4DA3FF]' 
                        : 'bg-gradient-to-r from-[#4DA3FF] to-[#00D1FF]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </motion.div>
            );
          })}

          {selectedTag && (
            <div className="flex justify-end pt-1">
              <button 
                onClick={() => handleTagClick(null)}
                className="text-[8px] font-black text-gray-500 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                [ Clear Tag Filter ]
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
