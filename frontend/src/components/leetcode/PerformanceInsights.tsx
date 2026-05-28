"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface PerformanceInsightsProps {
  strongestTopic?: string;
  weakestTopic?: string;
  recommendations?: string[];
}

export default function PerformanceInsights({
  strongestTopic = "",
  weakestTopic = "",
  recommendations = []
}: PerformanceInsightsProps) {
  const brandColors = {
    orange: '#FFA116',
    yellow: '#FFD43B',
    accent: '#FF8C00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg h-full flex flex-col items-center justify-center relative overflow-hidden group py-12`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <Sparkles className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500 animate-pulse" />
        <span className="text-[11px] font-bold text-gray-300">No AI Insights Available</span>
        <span className="text-[9px] text-gray-500 mt-1 max-w-[220px] text-center px-4 leading-relaxed">
          Solve more LeetCode problems to unlock dynamic study paths and concept gap analysis!
        </span>
      </div>
    );
  }


  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6 h-full flex flex-col justify-between`}>
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#FFA116] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#FFA116] animate-pulse" />
            <span>AI Performance Insights</span>
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Custom DSA learning path recommendations</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-[#10B981] text-[9px] font-black uppercase tracking-wider">
              <TrendingUp size={10} />
              <span>Strongest Domain</span>
            </div>
            <p className="text-white font-extrabold text-[10px]">{strongestTopic}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-[#EF4444] text-[9px] font-black uppercase tracking-wider">
              <AlertCircle size={10} />
              <span>Gaps Identified</span>
            </div>
            <p className="text-white font-extrabold text-[10px]">{weakestTopic}</p>
          </div>
        </div>

        <div className="space-y-3.5 pt-2">
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Actionable Items</span>
          
          <div className="space-y-2.5">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 text-[10px] leading-relaxed text-gray-300 font-medium bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
                <Lightbulb size={12} className="text-[#FFA116] shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
