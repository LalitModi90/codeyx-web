"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FileCode, Award, ShieldCheck, Flame } from 'lucide-react';

interface ProblemsAnalyticsProps {
  solvedCount: number;
  easyCount: number; // < 1200
  mediumCount: number; // 1200 - 1600
  hardCount: number; // 1600 - 2000
  eliteCount: number; // >= 2000
}

export default function ProblemsAnalytics({
  solvedCount = 0,
  easyCount = 0,
  mediumCount = 0,
  hardCount = 0,
  eliteCount = 0
}: ProblemsAnalyticsProps) {
  const brandColors = {
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const hasData = solvedCount > 0;

  if (!hasData) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg h-64 flex flex-col items-center justify-center relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <FileCode className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Not enough solved problems</span>
        <span className="text-[9px] text-gray-500 mt-1 max-w-[280px] text-center px-4 leading-relaxed font-semibold">
          Complete problems on Codeforces and sync your profile to render dynamic difficulty analysis.
        </span>
      </div>
    );
  }

  const pieData = useMemo(() => {
    return [
      { name: 'Easy (< 1200)', value: easyCount, color: '#34d399' },
      { name: 'Medium (1200-1600)', value: mediumCount, color: '#4DA3FF' },
      { name: 'Hard (1600-2000)', value: hardCount, color: '#c084fc' },
      { name: 'Elite (≥ 2000)', value: eliteCount, color: '#FF5C5C' }
    ].filter(d => d.value > 0);
  }, [easyCount, mediumCount, hardCount, eliteCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6 flex flex-col justify-between`}
    >
      <div>
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#4DA3FF] flex items-center gap-1.5">
          <FileCode size={14} className="text-[#4DA3FF]" />
          <span>Difficulty Distribution</span>
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Breakdown of solved tasks by rating categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Pie Chart display */}
        <div className="md:col-span-5 h-36 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={42}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0B1023] border border-white/10 p-2 rounded-xl text-[9px] text-white">
                        <span className="font-bold">{payload[0].name}</span>: {payload[0].value} problems
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-sm font-black text-white leading-none">{solvedCount}</span>
            <span className="text-[6px] text-gray-500 font-black uppercase tracking-wider mt-0.5">Solved</span>
          </div>
        </div>

        {/* Data Bars */}
        <div className="md:col-span-7 space-y-2.5">
          {[
            { label: 'Easy (< 1200)', count: easyCount, color: '#34d399' },
            { label: 'Medium (1200-1600)', count: mediumCount, color: '#4DA3FF' },
            { label: 'Hard (1600-2000)', count: hardCount, color: '#c084fc' },
            { label: 'Elite (≥ 2000)', count: eliteCount, color: '#FF5C5C' }
          ].map((item, idx) => {
            const percentage = solvedCount > 0 ? Math.round((item.count / solvedCount) * 100) : 0;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span className="text-gray-300">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-mono">{percentage}%</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-500 font-mono">{item.count} solved</span>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-white/[0.03] overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
}
