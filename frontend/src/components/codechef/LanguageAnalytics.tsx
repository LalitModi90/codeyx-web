"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { FileCode } from 'lucide-react';

interface LanguageUsage {
  language: string;
  count: number;
}

interface LanguageAnalyticsProps {
  languages?: LanguageUsage[];
}

const getLangColors = (lang: string) => {
  const colors: Record<string, string> = {
    'C++': '#f34b7d',
    'Java': '#b07219',
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Kotlin': '#A97BFF',
  };
  return colors[lang] || '#64748b';
};

export default function LanguageAnalytics({
  languages = []
}: LanguageAnalyticsProps) {
  const brandColors = {
    gold: '#D4A017',
    brown: '#8B5E3C',
    accent: '#FFB84D',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const hasData = languages && languages.length > 0;

  if (!hasData) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-4 flex flex-col items-center justify-center text-center py-12`}>
        <FileCode size={28} className="text-gray-500" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">
          No solved problems available
        </h3>
        <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed">
          Sync your profile to load analytics
        </p>
      </div>
    );
  }

  const safeLanguages = useMemo(() => {
    return languages.map((l) => ({
      language: l.language || (l as any).name || 'Unknown',
      count: l.count || 0
    }));
  }, [languages]);

  const totalSolved = useMemo(() => {
    return safeLanguages.reduce((acc, curr) => acc + curr.count, 0);
  }, [safeLanguages]);

  const pieData = useMemo(() => {
    return safeLanguages.map((l) => ({
      name: l.language,
      value: l.count,
      color: getLangColors(l.language)
    }));
  }, [safeLanguages]);

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#FFB84D] flex items-center gap-1.5">
            <FileCode size={14} className="text-[#D4A017]" />
            <span>Language Usage Distribution</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Coding syntax volumes across submitted challenges</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        <div className="md:col-span-5 h-40 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={3}
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
                      <div className="bg-[#0B1023] border border-white/10 p-2 rounded-xl text-[10px] text-white">
                        <span className="font-bold">{payload[0].name}</span>: {payload[0].value} files
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-7 space-y-3">
          {safeLanguages.map((l) => {
            const pct = totalSolved > 0 ? Math.round((l.count / totalSolved) * 100) : 0;
            const color = getLangColors(l.language);
            return (
              <div key={l.language} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-gray-300">{l.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono">{pct}%</span>
                    <span className="text-gray-600 font-normal">|</span>
                    <span className="text-gray-500 font-mono">{l.count} solved</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
