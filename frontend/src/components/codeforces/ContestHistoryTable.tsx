"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Search } from 'lucide-react';
import { getCFColors } from './ProfileHeader';

interface ContestPoint {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingUpdateTimeSeconds: number;
}

interface ContestHistoryTableProps {
  history: ContestPoint[];
}

export default function ContestHistoryTable({ history = [] }: ContestHistoryTableProps) {
  const [search, setSearch] = useState('');

  const filteredContests = useMemo(() => {
    return [...history].reverse().filter(c => 
      c.contestName.toLowerCase().includes(search.toLowerCase())
    );
  }, [history, search]);

  if (!history || history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl border bg-[#0B1023]/70 border-white/[0.08] backdrop-blur-md shadow-2xl h-72 flex flex-col items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-transparent pointer-events-none" />
        <Trophy className="w-10 h-10 text-gray-500 mb-3 group-hover:scale-110 transition-transform duration-500" />
        
        <span className="text-xs font-black uppercase tracking-wider text-gray-300">No synced contest history</span>
        <span className="text-[10px] text-gray-500 mt-1 max-w-[340px] text-center px-4 leading-relaxed font-medium">
          Verify your Codeforces handle has participated in active competitions.
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl border bg-[#0B1023]/70 border-white/[0.08] backdrop-blur-md shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#FF5C5C] flex items-center gap-1.5">
            <Trophy size={14} className="text-[#FF5C5C]" />
            <span>Contest Standing Logs</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Auditable record of competitive contest events attended</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contests..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-[#4DA3FF] text-white transition-all font-bold"
          />
        </div>
      </div>

      <div className="overflow-x-auto select-none">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-gray-500">
              <th className="pb-3 pl-2">Contest Name</th>
              <th className="pb-3 text-center">Rank</th>
              <th className="pb-3 text-center">Old Rating</th>
              <th className="pb-3 text-center">New Rating</th>
              <th className="pb-3 text-right pr-2">Delta</th>
            </tr>
          </thead>
          <tbody>
            {filteredContests.map((c) => {
              const delta = c.newRating - c.oldRating;
              const isPositive = delta >= 0;
              return (
                <tr key={c.contestId} className="border-b border-white/[0.02] last:border-none hover:bg-white/[0.01] transition-colors text-xs font-bold">
                  <td className="py-4 pl-2 text-white max-w-[280px] truncate">{c.contestName}</td>
                  <td className="py-4 text-center font-mono text-gray-300">#{c.rank}</td>
                  <td className="py-4 text-center font-mono text-gray-500 font-semibold">{c.oldRating}</td>
                  <td className="py-4 text-center font-mono text-white" style={{ color: getCFColors(c.newRating > 1600 ? 'Expert' : 'Pupil').color }}>{c.newRating}</td>
                  <td className={`py-4 text-right pr-2 font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? `+${delta}` : delta}
                  </td>
                </tr>
              );
            })}
            {filteredContests.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500 font-bold uppercase tracking-wider text-xs">
                  No matching contests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
