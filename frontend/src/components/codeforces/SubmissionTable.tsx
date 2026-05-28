"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, ExternalLink } from 'lucide-react';

interface Submission {
  id: string | number;
  problemName: string;
  contestId: number;
  problemIndex: string;
  difficulty: number;
  language: string;
  runtime: string;
  memory: string;
  status: 'OK' | 'WRONG_ANSWER' | 'COMPILATION_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | string;
  submittedTime: string;
}

interface SubmissionTableProps {
  submissions: Submission[];
}

export default function SubmissionTable({ submissions = [] }: SubmissionTableProps) {
  const [search, setSearch] = useState('');

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => 
      s.problemName.toLowerCase().includes(search.toLowerCase()) || 
      String(s.id).includes(search)
    );
  }, [submissions, search]);

  if (!submissions || submissions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl border bg-[#0B1023]/70 border-white/[0.08] backdrop-blur-md shadow-2xl h-72 flex flex-col items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-transparent pointer-events-none" />
        <ClipboardList className="w-10 h-10 text-gray-500 mb-3 group-hover:scale-110 transition-transform duration-500" />
        
        <span className="text-xs font-black uppercase tracking-wider text-gray-300">No recent submissions found</span>
        <span className="text-[10px] text-gray-500 mt-1 max-w-[340px] text-center px-4 leading-relaxed font-medium">
          Only real submissions will be displayed. Verify your handle sync status to pull your solution history.
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
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#4DA3FF] flex items-center gap-1.5">
            <ClipboardList size={14} className="text-[#4DA3FF]" />
            <span>Submission Log</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Live execution history audit log from Codeforces API</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems or ID..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-[#4DA3FF] text-white transition-all font-bold"
          />
        </div>
      </div>

      <div className="overflow-x-auto select-none">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-gray-500">
              <th className="pb-3 pl-2">Submission ID</th>
              <th className="pb-3">Problem Name</th>
              <th className="pb-3 text-center">Verdict</th>
              <th className="pb-3 text-center">Language</th>
              <th className="pb-3 text-center">Runtime</th>
              <th className="pb-3 text-center">Memory</th>
              <th className="pb-3 text-right pr-2">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub) => {
              const isOK = sub.status === 'OK';
              return (
                <tr key={sub.id} className="border-b border-white/[0.02] last:border-none hover:bg-white/[0.01] transition-colors text-xs font-bold">
                  <td className="py-4 pl-2 font-mono text-gray-400">#{sub.id}</td>
                  <td className="py-4 text-white max-w-[200px] truncate">
                    <a
                      href={`https://codeforces.com/contest/${sub.contestId}/problem/${sub.problemIndex}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#4DA3FF] inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{sub.problemName}</span>
                      <ExternalLink size={10} className="text-gray-500" />
                    </a>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      isOK 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    }`}>
                      {sub.status === 'OK' ? 'Accepted' : sub.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-center text-gray-300 font-mono text-[10px]">{sub.language}</td>
                  <td className="py-4 text-center text-gray-400 font-mono text-[10px]">{sub.runtime}</td>
                  <td className="py-4 text-center text-gray-400 font-mono text-[10px]">{sub.memory}</td>
                  <td className="py-4 text-right pr-2 text-gray-500 text-[10px] font-medium">{sub.submittedTime}</td>
                </tr>
              );
            })}
            {filteredSubmissions.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500 font-bold uppercase tracking-wider text-xs">
                  No matching submissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
