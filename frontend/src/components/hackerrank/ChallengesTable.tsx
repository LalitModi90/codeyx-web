"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Play, Award, HelpCircle, ChevronRight, ExternalLink, AlertTriangle } from 'lucide-react';

interface ChallengeRow {
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  domain: string;
  language: string;
  verdict: 'Accepted' | 'Wrong Answer' | 'Runtime Error';
  runtime: string;
  time: string;
  link: string;
}

interface ChallengesTableProps {
  challenges?: ChallengeRow[];
}

export default function ChallengesTable({ challenges = [] }: ChallengesTableProps) {
  const hasData = challenges && challenges.length > 0;

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [verdictFilter, setVerdictFilter] = useState('All');

  const filteredChallenges = useMemo(() => {
    if (!hasData) return [];
    return challenges.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.domain.toLowerCase().includes(search.toLowerCase());
      const matchesDiff = difficultyFilter === 'All' || item.difficulty === difficultyFilter;
      const matchesVerdict = verdictFilter === 'All' || item.verdict === verdictFilter;
      return matchesSearch && matchesDiff && matchesVerdict;
    });
  }, [challenges, hasData, search, difficultyFilter, verdictFilter]);

  const brandColors = {
    primary: '#00EA64',
    secondary: '#00C853',
    accent: '#39FF14',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  return (
    <div className={`p-6 rounded-3xl border ${brandColors.card} space-y-6 shadow-xl`}>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#00EA64] flex items-center gap-1.5">
            <Play size={14} className="text-[#00EA64]" />
            <span>Recent Challenges & Practices</span>
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Execution logs and active solved compilation history</p>
        </div>

        {/* Search & Filter tools */}
        {hasData && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search challenges..."
                className="pl-9 pr-4 py-2 w-full text-[10px] bg-black/40 border border-white/5 rounded-xl focus:outline-none focus:border-[#00EA64] text-white transition-all font-bold placeholder-gray-600"
              />
            </div>

            <select 
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 text-[9px] bg-black/40 border border-white/5 rounded-xl text-gray-300 focus:outline-none focus:border-[#00EA64] font-bold cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select 
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              className="px-3 py-2 text-[9px] bg-black/40 border border-white/5 rounded-xl text-gray-300 focus:outline-none focus:border-[#00EA64] font-bold cursor-pointer"
            >
              <option value="All">All Verdicts</option>
              <option value="Accepted">Accepted</option>
              <option value="Wrong Answer">Wrong Answer</option>
              <option value="Runtime Error">Runtime Error</option>
            </select>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
          <AlertTriangle size={32} className="text-gray-600/40 animate-pulse" />
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-white block">No Recent Solved Challenges Available (N/A)</span>
            <p className="text-[10px] text-gray-500 max-w-sm leading-relaxed mx-auto">
              No recent challenge compilation logs found on this connected account. Active solved exercises will dynamically populate here.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto select-none scrollbar-thin scrollbar-thumb-white/5 pb-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-gray-500">
                <th className="pb-3 pl-2">Challenge Name</th>
                <th className="pb-3 text-center">Difficulty</th>
                <th className="pb-3 text-center">Domain</th>
                <th className="pb-3 text-center">Language</th>
                <th className="pb-3 text-center">Verdict</th>
                <th className="pb-3 text-center">Runtime</th>
                <th className="pb-3 text-right pr-2">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.01]">
              <AnimatePresence>
                {filteredChallenges.map((row) => {
                  const isAccepted = row.verdict === 'Accepted';
                  return (
                    <motion.tr 
                      key={row.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/[0.01] transition-colors text-[10px] group"
                    >
                      <td className="py-3.5 pl-2 font-bold text-white max-w-[200px] truncate">{row.name}</td>
                      
                      <td className="py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          row.difficulty === 'Easy' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                            : row.difficulty === 'Medium' 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                        }`}>
                          {row.difficulty}
                        </span>
                      </td>

                      <td className="py-3.5 text-center font-bold text-gray-400">{row.domain}</td>
                      <td className="py-3.5 text-center font-mono font-bold text-gray-500">{row.language}</td>
                      
                      <td className="py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          isAccepted 
                            ? 'bg-[#00EA64]/10 text-[#00EA64] border border-[#00EA64]/20 shadow-[0_0_8px_rgba(0,234,100,0.1)]' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {row.verdict}
                        </span>
                      </td>

                      <td className="py-3.5 text-center font-mono text-gray-500">{row.runtime}</td>
                      
                      <td className="py-3.5 text-right pr-2">
                        <a 
                          href={row.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-0.5 text-gray-500 group-hover:text-[#00EA64] transition-colors cursor-pointer"
                        >
                          <span className="font-extrabold">Open</span>
                          <ExternalLink size={10} />
                        </a>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              
              {filteredChallenges.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-bold uppercase tracking-wider text-xs">
                    No matching challenges found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
