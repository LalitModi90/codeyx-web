"use client";

import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

interface PerformanceInsightsProps {
  strongestTopic?: string;
  weakestTopic?: string;
  recommendations?: string[];
  platformName?: string;
  brandColors?: {
    orange: string;
    yellow: string;
    accent: string;
    card: string;
  };
}

export default function PerformanceInsights({
  strongestTopic = "",
  weakestTopic = "",
  recommendations = [],
  platformName = "LeetCode",
  brandColors = {
    orange: '#FFA116',
    yellow: '#FFD43B',
    accent: '#FF8C00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  }
}: PerformanceInsightsProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg h-full flex flex-col items-center justify-center relative overflow-hidden group py-12 transition-all duration-300`}>
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ background: `radial-gradient(circle at 100% 100%, ${brandColors.orange}08, transparent)` }}
        />
        <Sparkles className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500 animate-pulse" />
        <span className="text-[11px] font-bold text-gray-900 dark:text-white">No AI Insights Available</span>
        <span className="text-[9px] text-gray-600 dark:text-gray-500 mt-1 max-w-[220px] text-center px-4 leading-relaxed font-semibold">
          Solve more {platformName} problems to unlock dynamic study paths and concept gap analysis!
        </span>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6 h-full flex flex-col justify-between transition-all duration-300`}>
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5" style={{ color: brandColors.orange }}>
            <Sparkles size={14} className="animate-pulse" style={{ color: brandColors.orange }} />
            <span>AI Performance Insights</span>
          </h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">Custom DSA learning path recommendations</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-1 transition-colors duration-300">
            <div className="flex items-center gap-1.5 text-[#10B981] text-[9px] font-black uppercase tracking-wider">
              <TrendingUp size={10} />
              <span>Strongest Domain</span>
            </div>
            <p className="text-gray-900 dark:text-white font-extrabold text-[10px]">{strongestTopic}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-1 transition-colors duration-300">
            <div className="flex items-center gap-1.5 text-[#EF4444] text-[9px] font-black uppercase tracking-wider">
              <AlertCircle size={10} />
              <span>Gaps Identified</span>
            </div>
            <p className="text-gray-900 dark:text-white font-extrabold text-[10px]">{weakestTopic}</p>
          </div>
        </div>

        <div className="space-y-3.5 pt-2">
          <span className="text-[8px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest block">Actionable Items</span>
          
          <div className="space-y-2.5">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 text-[10px] leading-relaxed text-gray-700 dark:text-gray-300 font-bold bg-black/[0.02] dark:bg-white/[0.02] p-2.5 rounded-xl border border-black/5 dark:border-white/5 transition-colors duration-300">
                <Lightbulb size={12} className="shrink-0 mt-0.5 animate-pulse" style={{ color: brandColors.orange }} />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
