"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, AlertTriangle } from 'lucide-react';

interface LogItem {
  title: string;
  detail: string;
  time: string;
  icon: any;
  glow: string;
}

interface ActivityFeedProps {
  logs?: LogItem[];
}

export default function ActivityFeed({ logs = [] }: ActivityFeedProps) {
  const hasData = logs && logs.length > 0;
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
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`p-6 rounded-3xl border ${brandColors.card} space-y-5 shadow-xl min-h-[300px] flex flex-col justify-between`}
    >
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#00EA64] flex items-center gap-1.5">
          <Terminal size={14} className="text-[#00EA64]" />
          <span>Activity Timeline Logs</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Live execution feed and portfolio checkpoints</p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <AlertTriangle size={32} className="text-gray-600/40 animate-pulse" />
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-white block">No Activity Logs (N/A)</span>
            <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed mx-auto">
              Timeline updates, badge awards, and verified assessments will record dynamic logs here as they occur.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border-l border-white/5 pl-4 ml-2.5 space-y-6 select-none max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 pr-2 flex-1 mt-4">
          {logs.map((log, index) => (
            <div key={index} className="relative group">
              <div 
                className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-black border transition-all duration-300 group-hover:scale-125"
                style={{ borderColor: log.glow, boxShadow: `0 0 8px ${log.glow}` }}
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-white group-hover:text-[#00EA64] transition-colors">{log.title}</span>
                  <span className="font-mono text-gray-500 font-bold">{log.time}</span>
                </div>
                <p className="text-[9px] text-gray-400 font-semibold">{log.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
