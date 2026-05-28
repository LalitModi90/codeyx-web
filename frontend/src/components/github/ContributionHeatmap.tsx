"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame, Zap } from 'lucide-react';

interface Cell { date: string; count: number; }
interface Props {
  calendarCells: Cell[];
  totalContributions: number;
  streak: number;
  expanded?: boolean;
}

const getColor = (count: number) => {
  if (count === 0) return 'bg-[#161B22]/60 border border-white/[0.03] hover:bg-white/[0.04]';
  if (count <= 2)  return 'bg-[#0E4429] border border-[#006D32]/30 hover:bg-[#006D32]/70';
  if (count <= 5)  return 'bg-[#006D32]/70 border border-[#26A641]/30 hover:bg-[#26A641]/60 shadow-[0_0_4px_rgba(38,166,65,0.15)]';
  if (count <= 10) return 'bg-[#26A641] border border-[#39D353]/40 hover:bg-[#39D353]/80 shadow-[0_0_8px_rgba(57,211,83,0.2)]';
  return 'bg-[#39D353] border border-[#39D353]/60 hover:scale-110 shadow-[0_0_12px_rgba(57,211,83,0.4)]';
};

export default function ContributionHeatmap({ calendarCells, totalContributions, streak, expanded }: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Group into weeks of 7
  const weeks: Cell[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  const activeDays = calendarCells.filter(c => c.count > 0).length;
  const maxCount   = Math.max(...calendarCells.map(c => c.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border bg-[#0D1117]/80 border-[#30363D] backdrop-blur-md shadow-2xl relative overflow-hidden"
    >
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-main)]">Contribution Heatmap</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-lg font-black text-emerald-400 leading-none">{totalContributions.toLocaleString()}</span>
            <p className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5">Total Contributions</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-xs font-black">{streak} day streak</span>
            </div>
          )}
          <div className="text-center">
            <span className="text-lg font-black text-[#58A6FF] leading-none">{activeDays}</span>
            <p className="text-[8px] text-gray-500 uppercase tracking-wider mt-0.5">Active Days</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {calendarCells.length === 0 ? (
        <div className="h-32 flex flex-col items-center justify-center text-gray-600">
          <Zap className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-xs font-bold">No contribution history available</p>
        </div>
      ) : (
        <div className="relative z-10 overflow-x-auto pb-2">
          <div className="flex gap-[3px] min-w-max">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className={`w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-all duration-150 ${getColor(cell.count)}`}
                    onMouseEnter={e => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({ ...cell, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div className="fixed z-50 pointer-events-none" style={{ left: tooltip.x - 60, top: tooltip.y - 52 }}>
              <div className="bg-[#0D1117] border border-[#30363D] px-2.5 py-1.5 rounded-lg shadow-xl text-center">
                <p className="text-[10px] font-black text-[var(--text-main)]">
                  {tooltip.count === 0 ? 'No contributions' : `${tooltip.count} contribution${tooltip.count > 1 ? 's' : ''}`}
                </p>
                <p className="text-[9px] text-gray-500">{tooltip.date}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[9px] text-gray-600">Less</span>
        {[0, 2, 5, 8, 12].map(n => (
          <div key={n} className={`w-3 h-3 rounded-[2px] ${getColor(n)}`} />
        ))}
        <span className="text-[9px] text-gray-600">More</span>
      </div>
    </motion.div>
  );
}
