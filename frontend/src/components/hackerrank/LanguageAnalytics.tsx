"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Terminal, Code, AlertTriangle } from 'lucide-react';

interface LanguageItem {
  name: string;
  value: number;
  color: string;
}

interface LanguageAnalyticsProps {
  languages?: LanguageItem[];
}

export default function LanguageAnalytics({ languages = [] }: LanguageAnalyticsProps) {
  const hasData = languages && languages.length > 0;
  const brandColors = {
    primary: '#00EA64',
    secondary: '#00C853',
    accent: '#39FF14',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className={`p-6 rounded-3xl border ${brandColors.card} flex flex-col justify-between h-full min-h-[320px]`}
    >
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#00EA64] flex items-center gap-1.5">
          <Terminal size={14} className="text-[#00EA64]" />
          <span>Language Usage Analytics</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Static code compilation analysis</p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <AlertTriangle size={32} className="text-gray-600/40 animate-pulse" />
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-white block">No Language Data (N/A)</span>
            <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed">
              Solve challenges on HackerRank to map language distributions on this platform.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-6 justify-center flex-1 py-6 select-none">
          <div className="relative w-28 h-28 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languages}
                  innerRadius={32}
                  outerRadius={44}
                  dataKey="value"
                  stroke="none"
                >
                  {languages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-black text-white leading-none">{languages.length}</span>
              <span className="text-[6px] text-gray-500 uppercase font-black tracking-wider mt-0.5">Languages</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {languages.map((lang) => (
              <div key={lang.name} className="flex items-center justify-between text-[9px] font-bold">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lang.color }} />
                  <span className="text-gray-300 capitalize">{lang.name}</span>
                </div>
                <span className="font-mono text-gray-400">{lang.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[9px] text-gray-400">
        <span>Preferred: {hasData ? languages[0]?.name : 'N/A'}</span>
        {hasData && (
          <span className="text-[#00EA64] font-black uppercase tracking-wider flex items-center gap-1">
            <Code size={10} /> Active Compiler
          </span>
        )}
      </div>
    </motion.div>
  );
}
