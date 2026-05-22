"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';

interface Props {
  theme: 'dark' | 'light';
}

export default function ProblemsSolvedBarChart({ theme }: Props) {
  const isDark = theme === 'dark';
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const bars = [
    { label: '17-23 May', val: 280 },
    { label: '24-30 May', val: 500 },
    { label: '31 May - 6 Jun', val: 530 },
    { label: '7-13 Jun', val: 710 },
    { label: '14-16 Jun', val: 760 },
  ];

  const maxVal = 800;

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'border-white/6 bg-[#0f1419]' : 'border-gray-200 bg-white'} shadow-2xl h-full flex flex-col justify-between relative overflow-hidden group`}>
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Problems Solved Over Time</h3>
        <select className={`text-[10px] bg-transparent border-none font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} focus:outline-none cursor-pointer`}>
          <option>All Platforms</option>
        </select>
      </div>

      <div className="h-[150px] relative mt-2 pt-2 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#6b7280' : '#9ca3af', fontSize: 8, fontWeight: 600 }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 8 }}
              domain={[0, maxVal]}
              ticks={[0, 200, 400, 600, 800]}
            />
            <RechartsTooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-purple-950/95 border border-purple-500/40 text-purple-200 font-mono text-[10px] px-2 py-1 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                      {payload[0].value}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="val"
              radius={[4, 4, 0, 0]}
              onMouseEnter={(_, index) => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {bars.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={hoveredIdx === index ? '#8B5CF6' : '#6d28d9'}
                  className="transition-all duration-300"
                  style={{
                    filter: hoveredIdx === index ? 'brightness(1.2) drop-shadow(0 0 8px rgba(139,92,246,0.5))' : 'none',
                    transform: hoveredIdx === index ? 'scaleY(1.05)' : 'scaleY(1)',
                    transformOrigin: 'bottom'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-3 border-t border-white/5 text-right">
        <span className="text-[10px] text-purple-400 font-bold hover:underline cursor-pointer">
          View Detailed History
        </span>
      </div>
    </div>
  );
}
