"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, AlertTriangle } from 'lucide-react';

interface InsightItem {
  title: string;
  detail: string;
  level: string;
}

interface AIInsightsProps {
  insights?: InsightItem[];
}

export default function AIInsights({ insights = [] }: AIInsightsProps) {
  const hasData = insights && insights.length > 0;
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
      transition={{ duration: 0.5, delay: 0.45 }}
      className={`p-6 rounded-3xl border ${brandColors.card} space-y-5 shadow-xl min-h-[300px] flex flex-col justify-between`}
    >
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#00EA64] flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#00EA64] animate-pulse" />
          <span>AI Performance Insights</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Automated skill tracking and mock interview verifications</p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <AlertTriangle size={32} className="text-gray-600/40 animate-pulse" />
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-white block">No AI Recommendations (N/A)</span>
            <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed mx-auto">
              Once you link your profile and start practicing, our sync engine will analyze your solved challenges to generate performance insights.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 flex-1 mt-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-start gap-4 hover:border-[#00EA64]/20 transition-all duration-300">
              <div className="w-8 h-8 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center flex-shrink-0">
                <BrainCircuit className="w-4.5 h-4.5 text-[#00EA64]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white">{insight.title}</span>
                  <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-[#00EA64]/10 text-[#00EA64] border border-[#00EA64]/10">
                    {insight.level}
                  </span>
                </div>
                <p className="text-[9px] text-gray-400 font-semibold leading-relaxed">{insight.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
