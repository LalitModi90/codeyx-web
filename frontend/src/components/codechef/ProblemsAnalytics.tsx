"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { FileCode2, AlertCircle } from 'lucide-react';
import { animate } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ProblemsAnalyticsProps {
  solvedCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  eliteCount?: number;
}

const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) { setCount(0); return; }
    const ctrl = animate(0, value, {
      duration: 1.2, ease: 'easeOut',
      onUpdate: v => setCount(Math.floor(v))
    });
    return () => ctrl.stop();
  }, [value]);
  return <>{count.toLocaleString()}</>;
};

export default function ProblemsAnalytics({
  solvedCount = 0,
  easyCount = 0,
  mediumCount = 0,
  hardCount = 0,
  eliteCount = 0,
}: ProblemsAnalyticsProps) {
  const hasData = solvedCount > 0;

  const chartData = useMemo(() => {
    if (!hasData) return [];
    const items = [
      { name: 'Easy',   value: easyCount,   color: '#22c55e' },
      { name: 'Medium', value: mediumCount,  color: '#f59e0b' },
      { name: 'Hard',   value: hardCount,    color: '#ef4444' },
      { name: 'Elite',  value: eliteCount,   color: '#a855f7' },
    ];
    return items.filter(i => i.value > 0);
  }, [hasData, easyCount, mediumCount, hardCount, eliteCount]);

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border bg-[#150F0A]/80 border-amber-900/20 backdrop-blur-xl h-64 flex flex-col items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <AlertCircle className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">No solved problems yet</span>
        <span className="text-[9px] text-gray-500 mt-1 max-w-[280px] text-center px-4 leading-relaxed font-semibold">
          Sync your CodeChef handle to load your solved problems breakdown and difficulty distribution.
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border bg-[#150F0A]/80 border-amber-900/20 backdrop-blur-xl space-y-5"
    >
      <div>
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#F1C40F] flex items-center gap-1.5">
          <FileCode2 size={14} className="text-[#F1C40F]" />
          <span>Problems Analytics</span>
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Difficulty breakdown across accepted submissions</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut chart */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={52}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="bg-[#150F0A] border border-amber-900/20 p-2 rounded-lg text-[9px] text-white shadow-xl">
                        <span className="font-bold">{payload[0].name}</span>: {payload[0].value}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-base font-extrabold text-white leading-none">
              <AnimatedCounter value={solvedCount} />
            </span>
            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Solved</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 w-full space-y-3">
          {[
            { label: 'Easy',   count: easyCount,   color: '#22c55e', bg: 'bg-emerald-500' },
            { label: 'Medium', count: mediumCount,  color: '#f59e0b', bg: 'bg-amber-500'   },
            { label: 'Hard',   count: hardCount,    color: '#ef4444', bg: 'bg-red-500'     },
            ...(eliteCount > 0 ? [{ label: 'Elite', count: eliteCount, color: '#a855f7', bg: 'bg-purple-500' }] : []),
          ].map(item => {
            const pct = solvedCount > 0 ? Math.round((item.count / solvedCount) * 100) : 0;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span className="text-gray-300">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-white">{item.count}</span>
                    <span className="text-gray-500">({pct}%)</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${item.bg}`}
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
