"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Code2 } from 'lucide-react';

interface Lang { language: string; count: number; percentage: number; color: string; }
interface Props { languages: Lang[]; expanded?: boolean; }

export default function TechnologyStack({ languages, expanded }: Props) {
  const top = languages.slice(0, expanded ? 12 : 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] backdrop-blur-md shadow-2xl space-y-5"
    >
      <div className="flex items-center gap-2">
        <Code2 className="w-4 h-4 text-[#58A6FF]" />
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-main)]">Technology Stack</h3>
      </div>

      {top.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-600">
          <Code2 className="w-8 h-8 opacity-40" />
          <p className="text-xs font-bold">No language data available</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Donut */}
          <div className="w-40 h-40 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={top} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={2} dataKey="count">
                  {top.map((l, i) => <Cell key={i} fill={l.color} stroke="transparent" />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0D1117', border: '1px solid #30363D', borderRadius: 8, fontSize: 10 }}
                  formatter={(val: any, name: any, props: any) => [`${props.payload.percentage}%`, props.payload.language]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Language List */}
          <div className="flex-1 space-y-2 w-full">
            {top.map((l, i) => (
              <motion.div
                key={l.language}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                    <span className="text-[11px] font-bold text-[var(--text-main)]">{l.language}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-gray-500">{l.count} repo{l.count !== 1 ? 's' : ''}</span>
                    <span className="text-[10px] font-black" style={{ color: l.color }}>{l.percentage}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${l.percentage}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: l.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
