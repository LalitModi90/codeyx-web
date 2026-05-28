"use client";

import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { Target, Activity, Flame, ShieldCheck } from 'lucide-react';

interface AccuracyAnalyticsProps {
  totalSubmissions?: number;
  acSubmissions?: number;
  accuracy?: number;
  easyCount?: number;
  mediumCount?: number;
  hardCount?: number;
}

export default function AccuracyAnalytics({
  totalSubmissions = 0,
  acSubmissions = 0,
  accuracy = 0,
  easyCount = 0,
  mediumCount = 0,
  hardCount = 0
}: AccuracyAnalyticsProps) {
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

  const brandColors = {
    theme: '#FF8A00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  useEffect(() => {
    const ctrl = animate(0, accuracy, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate: v => setAnimatedAccuracy(parseFloat(v.toFixed(1)))
    });
    return () => ctrl.stop();
  }, [accuracy]);

  const hasData = totalSubmissions > 0;

  if (!hasData) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg py-12 flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <Activity className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">No solved problems available</h3>
        <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
          Sync your profile to load analytics
        </p>
      </div>
    );
  }

  // Calculate coordinates for SVG circular progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />

      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#FF8A00] flex items-center gap-1.5">
          <Activity size={14} className="text-[#FF8A00]" />
          <span>AtCoder Attempt Accuracy</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Ratio of successful AC responses to total compile submissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Circle Progress Bar */}
        <div className="lg:col-span-4 flex justify-center relative select-none">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-white/[0.03] fill-transparent"
                strokeWidth="10"
              />
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-[#FF8A00] fill-transparent"
                strokeWidth="10"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white font-mono">{animatedAccuracy}%</span>
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Accuracy</span>
            </div>
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
              <span className="text-gray-500 text-[8px] font-black uppercase tracking-wider">Total Attempts</span>
              <p className="text-white font-black font-mono text-base">{totalSubmissions}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
              <span className="text-emerald-400 text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={9} />
                <span>Accepted Tasks</span>
              </span>
              <p className="text-white font-black font-mono text-base">{acSubmissions}</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Estimated Difficulty Range</span>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col p-2.5 rounded-xl bg-[#0B1023] border border-white/5 items-center justify-center">
                <span className="text-[8px] text-emerald-400 font-extrabold uppercase">Easy</span>
                <span className="text-white font-black font-mono mt-1 text-sm">{easyCount}</span>
              </div>
              <div className="flex flex-col p-2.5 rounded-xl bg-[#0B1023] border border-white/5 items-center justify-center">
                <span className="text-[8px] text-amber-400 font-extrabold uppercase">Medium</span>
                <span className="text-white font-black font-mono mt-1 text-sm">{mediumCount}</span>
              </div>
              <div className="flex flex-col p-2.5 rounded-xl bg-[#0B1023] border border-white/5 items-center justify-center">
                <span className="text-[8px] text-orange-400 font-extrabold uppercase">Hard</span>
                <span className="text-white font-black font-mono mt-1 text-sm">{hardCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
