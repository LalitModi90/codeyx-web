"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

interface LanguageCount {
  language: string;
  count: number;
}

interface LanguageAnalyticsProps {
  languages?: LanguageCount[];
}

export default function LanguageAnalytics({
  languages = []
}: LanguageAnalyticsProps) {
  const brandColors = {
    theme: '#FF8A00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const hasLanguages = Array.isArray(languages) && languages.length > 0;

  if (!hasLanguages) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg py-12 flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <Code2 className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">No solved problems available</h3>
        <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
          Sync your profile to load analytics
        </p>
      </div>
    );
  }

  const totalCount = useMemo(() => languages.reduce((sum, item) => sum + item.count, 0), [languages]);

  const sortedLanguages = useMemo(() => {
    return [...languages]
      .sort((a, b) => b.count - a.count)
      .map(item => ({
        ...item,
        percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
      }));
  }, [languages, totalCount]);

  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'c++': return 'from-[#3b82f6] to-[#1d4ed8]';
      case 'python': return 'from-[#f59e0b] to-[#b45309]';
      case 'rust': return 'from-[#ea580c] to-[#9a3412]';
      case 'java': return 'from-[#ef4444] to-[#b91c1c]';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6`}>
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#FF8A00] flex items-center gap-1.5">
          <Code2 size={14} className="text-[#FF8A00]" />
          <span>Language Mastery Breakdown</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Distribution of compiler usage across solved tasks</p>
      </div>

      <div className="space-y-4">
        {sortedLanguages.map((lang, idx) => (
          <div key={lang.language} className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-white">{lang.language}</span>
              <span className="text-gray-400 font-mono">{lang.count} ACs ({lang.percentage}%)</span>
            </div>
            <div className="h-2 w-full bg-white/[0.03] border border-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${lang.percentage}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className={`h-full bg-gradient-to-r ${getLanguageColor(lang.language)} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
