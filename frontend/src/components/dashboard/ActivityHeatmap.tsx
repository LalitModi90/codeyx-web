"use client";
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  submissionCalendar?: string;
  theme: 'dark' | 'light';
}

export default function ActivityHeatmap({ submissionCalendar, theme }: Props) {
  const isDark = theme === 'dark';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Year switcher state
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, date: string, count: number } | null>(null);

  // Generate an array of years from current year down to (currentYear - 1)
  const availableYears = useMemo(() => {
    return [currentYear, currentYear - 1];
  }, [currentYear]);

  // Dynamically generate exact Gregorian calendar data grouped by month
  const monthsData = useMemo(() => {
    const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let calendarMap: Record<string, number> = {};
    try {
      if (submissionCalendar) {
        calendarMap = JSON.parse(submissionCalendar);
      }
    } catch {}

    const result: {
      label: string;
      weeks: ({ date: string; count: number; dayOfWeek: number } | null)[][];
    }[] = [];

    // Loop through every month of the selected year
    for (let m = 0; m < 12; m++) {
      const monthLabel = monthsMap[m];
      const firstDay = new Date(selectedYear, m, 1);
      const lastDay = new Date(selectedYear, m + 1, 0);

      const weeksList: ({ date: string; count: number; dayOfWeek: number } | null)[][] = [];
      let currentWeek: ({ date: string; count: number; dayOfWeek: number } | null)[] = Array(7).fill(null);

      let curr = new Date(firstDay);
      while (curr <= lastDay) {
        const dayOfWeek = curr.getDay();
        const dateStr = curr.toISOString().split('T')[0];

        let count = 0;
        for (const [ts, c] of Object.entries(calendarMap)) {
          const tsDate = new Date(parseInt(ts) * 1000).toISOString().split('T')[0];
          if (tsDate === dateStr) {
            count = c as number;
            break;
          }
        }



        // Place cell in its correct weekday index (0 = Sun, 6 = Sat)
        currentWeek[dayOfWeek] = { date: dateStr, count, dayOfWeek };

        // Start a new week column on Saturday or the last day of the month
        if (dayOfWeek === 6 || curr.getTime() === lastDay.getTime()) {
          weeksList.push(currentWeek);
          currentWeek = Array(7).fill(null);
        }

        curr.setDate(curr.getDate() + 1);
      }

      result.push({ label: monthLabel, weeks: weeksList });
    }

    return result;
  }, [submissionCalendar, selectedYear]);

  // Calculate dynamic active days counter based on exact cell counts
  const totalActive = useMemo(() => {
    let activeDays = 0;
    monthsData.forEach(m => {
      m.weeks.forEach(w => {
        w.forEach(cell => {
          if (cell && cell.count > 0) activeDays++;
        });
      });
    });
    return activeDays;
  }, [monthsData]);

  // GitHub Dark Mode Neon Green Color Palette Levels:
  const getColor = (count: number) => {
    if (count === 0) return '#161b22'; // Inactive cell
    
    if (count < 2) return '#0e4429';   // Level 1: Dark forest green
    if (count < 4) return '#006d32';   // Level 2: Medium-dark green
    if (count < 7) return '#26a641';   // Level 3: Medium bright green
    if (count < 9) return '#39d353';   // Level 4: Glowing neon green
    return '#7ee787';                  // Level 5: Electric lime/glowing green
  };

  const days = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Scroll to latest month of the selected year
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [selectedYear]);

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'border-white/6 bg-[#0f1419]' : 'border-gray-200 bg-white'} shadow-2xl h-full flex flex-col justify-between`}>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">Activity Heatmap</h3>
        <div className="flex items-center gap-2">
          {/* Platform Switcher */}
          <select className={`text-[10px] bg-[#161b22] border border-white/5 text-gray-300 font-semibold focus:outline-none cursor-pointer rounded-lg px-2.5 py-1`}>
            <option>All Platforms</option>
          </select>
          {/* Year Switcher */}
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="text-[10px] bg-purple-950/40 border border-purple-500/20 text-purple-400 font-bold focus:outline-none cursor-pointer rounded-lg px-2.5 py-1 hover:bg-purple-900/35 transition-all shadow-[0_0_8px_rgba(139,92,246,0.15)]"
          >
            {availableYears.map(y => (
              <option key={y} value={y} className="bg-[#0f1419] text-white">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid container with elegant horizontal scroll support */}
      <div className="flex gap-2 flex-1 items-start pt-1 overflow-hidden relative">

        {/* Scrollable Month Columns Container */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto scrollbar-custom cursor-grab active:cursor-grabbing select-none"
          style={{
            scrollbarWidth: 'thin',
          }}
        >
          <div className="flex gap-[12px] pb-8 relative"> {/* Elegant spacing gaps between completed months */}
            {monthsData.map((g, gi) => (
              <div key={gi} className="flex flex-col gap-1.5 items-start flex-shrink-0 relative">
                {/* Weekly grid columns for this month */}
                <div className="flex gap-[3px]">
                  {g.weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                      {[0,1,2,3,4,5,6].map(dayIdx => {
                        const cell = week[dayIdx];
                        
                        // If cell is null, it means this weekday belongs to the neighboring month.
                        // We render it completely invisible (bg-transparent) to preserve the exact day count!
                        if (!cell) {
                          return (
                            <div 
                              key={dayIdx} 
                              className="w-[10px] h-[10px] bg-transparent pointer-events-none" 
                            />
                          );
                        }
                        
                        const color = getColor(cell.count);
                        return (
                          <div
                            key={dayIdx}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltip({ 
                                x: rect.left + rect.width / 2, 
                                y: rect.top - 8, 
                                date: cell.date, 
                                count: cell.count 
                              });
                            }}
                            onMouseLeave={() => setTooltip(null)}
                            className="w-[10px] h-[10px] rounded-[2px] transition-all hover:scale-125 hover:ring-1 hover:ring-emerald-400/40 cursor-pointer"
                            style={{ 
                              backgroundColor: color,
                              boxShadow: cell.count > 6 ? `0 0 6px ${color}50` : undefined
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Month Name exactly aligned at the bottom - Brighter and Bolder! */}
                <span className="absolute top-[92px] left-[2px] text-[9px] font-extrabold text-gray-300 select-none whitespace-nowrap tracking-wider">
                  {g.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info & Legend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        {/* Legend */}
        <div className="flex items-center gap-1.5 select-none">
          <span className="text-[9px] text-gray-500">Less</span>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#161b22]" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#0e4429]" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#006d32]" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#26a641]" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#7ee787]" />
          <span className="text-[9px] text-gray-500">More</span>
        </div>

        <span className="text-[10px] text-gray-400">
          Total Active Days in {selectedYear}: <span className="text-white font-extrabold">{totalActive}</span>
        </span>
      </div>

      {/* Floating Interactive Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] bg-[#0f1419] border border-white/10 text-white text-[10px] px-3 py-2 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] pointer-events-none flex flex-col items-center"
            style={{ 
              left: tooltip.x, 
              top: tooltip.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <span className="font-extrabold text-white">
              {tooltip.count === 0 ? 'No' : <span className="text-emerald-400">{tooltip.count}</span>} tasks completed
            </span>
            <span className="text-[8px] text-gray-500 font-mono mt-0.5">{new Date(tooltip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled Neon Scrollbar */}
      <style jsx global>{`
        .scrollbar-custom::-webkit-scrollbar {
          height: 3px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
          border-radius: 99px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.15);
          border-radius: 99px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.35);
        }
      `}</style>
    </div>
  );
}
