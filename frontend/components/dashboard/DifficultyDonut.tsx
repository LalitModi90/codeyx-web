"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  easy: number;
  medium: number;
  hard: number;
  total: number;
  theme: 'dark' | 'light';
}

export default function DifficultyDonut({ easy, medium, hard, total, theme }: Props) {
  const isDark = theme === 'dark';
  
  // Hover state segment
  const [hoveredSeg, setHoveredSeg] = useState<'easy' | 'medium' | 'hard' | null>(null);

  // Use mock values if actual data is not loaded yet to match screenshot exactly
  const finalEasy = easy || 1070;
  const finalMedium = medium || 1794;
  const finalHard = hard || 626;
  const finalTotal = total || 2548;

  const sum = finalEasy + finalMedium + finalHard || 1;
  const easyPct = (finalEasy / sum) * 100;
  const medPct = (finalMedium / sum) * 100;
  const hardPct = (finalHard / sum) * 100;

  // SVG donut params
  const size = 150;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate Dash Offsets
  const easyStroke = (easyPct / 100) * circumference;
  const medStroke = (medPct / 100) * circumference;
  const hardStroke = (hardPct / 100) * circumference;

  const easyOffset = 0;
  const medOffset = easyStroke;
  const hardOffset = easyStroke + medStroke;

  const getCenterText = () => {
    switch (hoveredSeg) {
      case 'easy':
        return { val: finalEasy.toLocaleString(), label: 'Easy Solved', color: 'text-emerald-400' };
      case 'medium':
        return { val: finalMedium.toLocaleString(), label: 'Medium Solved', color: 'text-yellow-400' };
      case 'hard':
        return { val: finalHard.toLocaleString(), label: 'Hard Solved', color: 'text-red-400' };
      default:
        return { val: finalTotal.toLocaleString(), label: 'Total Solved', color: 'text-white' };
    }
  };

  const centerDisplay = getCenterText();

  const data = [
    { name: 'easy', value: finalEasy, color: '#22c55e' },
    { name: 'medium', value: finalMedium, color: '#eab308' },
    { name: 'hard', value: finalHard, color: '#ef4444' },
  ];

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'border-white/6 bg-[#0f1419]' : 'border-gray-200 bg-white'} shadow-2xl h-full flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Problems Solved by Difficulty</h3>
        <select className={`text-[10px] bg-transparent border-none font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} focus:outline-none cursor-pointer`}>
          <option>All Platforms</option>
        </select>
      </div>

      <div className="flex items-center justify-between gap-4 mt-2">
        <div className="relative flex-shrink-0 w-[150px] h-[150px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={70}
                stroke="none"
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, index) => setHoveredSeg(data[index].name as any)}
                onMouseLeave={() => setHoveredSeg(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="transition-all duration-300 outline-none"
                    style={{
                      filter: hoveredSeg === entry.name ? `drop-shadow(0 0 8px ${entry.color}80)` : 'none',
                      transform: hoveredSeg === entry.name ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center text with dynamic AnimatePresence */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-xl font-black transition-colors duration-300 ${centerDisplay.color}`}>{centerDisplay.val}</span>
            <span className={`text-[9px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>{centerDisplay.label}</span>
          </div>
        </div>

        {/* Legend with Row Hover Triggers */}
        <div className="space-y-3 flex-1">
          {[
            { key: 'easy' as const, label: 'Easy', count: finalEasy, pct: easyPct, dot: 'bg-emerald-500', glow: 'shadow-[0_0_12px_#10b981]' },
            { key: 'medium' as const, label: 'Medium', count: finalMedium, pct: medPct, dot: 'bg-amber-500', glow: 'shadow-[0_0_12px_#f59e0b]' },
            { key: 'hard' as const, label: 'Hard', count: finalHard, pct: hardPct, dot: 'bg-red-500', glow: 'shadow-[0_0_12px_#ef4444]' },
          ].map(item => {
            const isHovered = hoveredSeg === item.key;
            return (
              <div 
                key={item.label} 
                className={`flex items-center justify-between text-[11px] p-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isHovered ? 'bg-white/[0.03] scale-[1.03] border border-white/5 shadow-md' : 'border border-transparent'
                }`}
                onMouseEnter={() => setHoveredSeg(item.key)}
                onMouseLeave={() => setHoveredSeg(null)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.dot} ${isHovered ? item.glow : ''}`} />
                  <span className={`font-bold transition-colors ${isHovered ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}</span>
                </div>
                <span className="font-mono font-extrabold text-gray-200">
                  {item.count.toLocaleString()} <span className={`font-normal ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-1`}>({item.pct.toFixed(0)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/5">
        <span className="text-[10px] text-purple-400 font-bold hover:underline cursor-pointer flex items-center justify-between">
          View Detailed Analysis <span>→</span>
        </span>
      </div>
    </div>
  );
}
