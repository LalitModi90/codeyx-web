"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface DifficultyChartProps {
  easySolved: number;
  easyTotal?: number;
  mediumSolved: number;
  mediumTotal?: number;
  hardSolved: number;
  hardTotal?: number;
  acceptanceRate?: number;
}

export default function DifficultyChart({
  easySolved = 0,
  easyTotal = 830,
  mediumSolved = 0,
  mediumTotal = 1680,
  hardSolved = 0,
  hardTotal = 750,
  acceptanceRate = 0
}: DifficultyChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  
  const finalEasyTotal = easyTotal || 830;
  const finalMediumTotal = mediumTotal || 1680;
  const finalHardTotal = hardTotal || 750;

  const totalSolved = easySolved + mediumSolved + hardSolved;
  const grandTotal = finalEasyTotal + finalMediumTotal + finalHardTotal;

  const data = [
    { name: 'Easy', value: easySolved, fill: '#10B981', total: finalEasyTotal },
    { name: 'Medium', value: mediumSolved, fill: '#F59E0B', total: finalMediumTotal },
    { name: 'Hard', value: hardSolved, fill: '#EF4444', total: finalHardTotal }
  ];

  return (
    <div className="bg-[#0B1023]/80 border border-white/[0.08] backdrop-blur-xl p-6 rounded-2xl flex flex-col justify-between h-[360px] shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#FFA116]">Difficulty Breakdown</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Problems solved and acceptance rates</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] text-[9px] font-bold">
          <span>{acceptanceRate}% AC</span>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-6 py-2">
        <div className="w-44 h-44 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={(_, index) => setHoveredSegment(data[index].name)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    style={{
                      filter: hoveredSegment === entry.name ? `drop-shadow(0 0 8px ${entry.fill}80)` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0B1023] border border-white/10 p-2.5 rounded-xl text-[10px] text-white">
                        <span className="font-bold" style={{ color: d.fill }}>{d.name}</span>: {d.value} solved
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-2xl font-black tracking-tight text-white">{totalSolved}</span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Solved</span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {data.map((d) => {
            const pct = Math.round((d.value / d.total) * 100);
            return (
              <div key={d.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-gray-300">{d.name}</span>
                  </div>
                  <span className="text-gray-400 font-mono">
                    {d.value} <span className="text-gray-600 font-normal">/ {d.total}</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: d.fill }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
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
