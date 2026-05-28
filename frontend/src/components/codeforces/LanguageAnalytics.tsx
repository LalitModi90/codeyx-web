"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Code2, Cpu } from 'lucide-react';

interface Submission {
  language: string;
}

interface LanguageAnalyticsProps {
  submissions: Submission[];
}

export default function LanguageAnalytics({ submissions = [] }: LanguageAnalyticsProps) {
  const hasData = submissions && submissions.length > 0;

  const chartData = useMemo(() => {
    if (!hasData) return [];
    
    const counts: Record<string, number> = {};
    submissions.forEach(s => {
      let lang = s.language || 'Other';
      if (lang.toLowerCase().includes('c++')) lang = 'C++';
      else if (lang.toLowerCase().includes('python')) lang = 'Python';
      else if (lang.toLowerCase().includes('java')) lang = 'Java';
      else if (lang.toLowerCase().includes('kotlin')) lang = 'Kotlin';
      else lang = 'Other';

      counts[lang] = (counts[lang] || 0) + 1;
    });

    const colorsMap: Record<string, string> = {
      'C++': '#4DA3FF',
      'Python': '#FF5C5C',
      'Java': '#facc15',
      'Kotlin': '#a855f7',
      'Other': '#64748b'
    };

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colorsMap[name] || '#64748b'
    })).sort((a, b) => b.value - a.value);
  }, [submissions, hasData]);

  if (!hasData) {
    return (
      <div className="p-6 rounded-2xl border bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl h-64 flex flex-col items-center justify-center relative overflow-hidden group">
        <Code2 className="w-8 h-8 text-gray-600 mb-3" />
        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">No language analytics found</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#4DA3FF] flex items-center gap-1.5">
            <Code2 size={14} className="text-[#4DA3FF]" />
            <span>Language usage analytics</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Breakdown of solution attempts across compiled technologies</p>
        </div>

        <Cpu size={14} className="text-gray-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Pie Chart */}
        <div className="md:col-span-5 h-36 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={26}
                outerRadius={40}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Coding Distribution Bars */}
        <div className="md:col-span-7 space-y-2.5">
          {chartData.map((item, idx) => {
            const pct = Math.round((item.value / submissions.length) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span className="text-gray-300">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-mono">{pct}%</span>
                    <span className="text-gray-600">({item.value})</span>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-white/[0.03] overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
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
