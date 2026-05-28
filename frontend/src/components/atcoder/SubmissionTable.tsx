"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Search, ExternalLink, Calendar, Code, ShieldAlert } from 'lucide-react';

interface Submission {
  id: string;
  name: string;
  date: string;
  status: string;
  language: string;
  success: boolean;
  executionTime: string;
  memory: string;
}

interface SubmissionTableProps {
  submissions?: Submission[];
}

export default function SubmissionTable({
  submissions = []
}: SubmissionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const brandColors = {
    theme: '#FF8A00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const hasSubmissions = Array.isArray(submissions) && submissions.length > 0;

  if (!hasSubmissions) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg py-12 flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <CheckCircle2 className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform duration-500" />
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">No recent submissions found</h3>
        <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-relaxed">
          Sync your profile to load analytics
        </p>
      </div>
    );
  }

  const filteredSubmissions = submissions.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#FF8A00]">Submission Logs</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Real-time status of your recently tested solutions</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search problem, language..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] font-bold text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A00] transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto select-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04] text-[9px] font-black uppercase tracking-wider text-gray-500">
              <th className="pb-3 pl-2">Problem ID</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-center">Language</th>
              <th className="pb-3 text-center">Runtime</th>
              <th className="pb-3 text-center">Memory</th>
              <th className="pb-3 text-right pr-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                className="border-b border-white/[0.02] last:border-none hover:bg-white/[0.01] transition-all text-[11px] font-bold"
              >
                <td className="py-3.5 pl-2 text-white max-w-[200px] truncate">
                  <a
                    href={`https://atcoder.jp/contests/${sub.name.split('_')[0]}/tasks/${sub.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF8A00] transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{sub.name.toUpperCase()}</span>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </td>

                <td className="py-3.5 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${
                    sub.success 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}>
                    {sub.success ? (
                      <CheckCircle2 size={10} />
                    ) : (
                      <XCircle size={10} />
                    )}
                    <span>{sub.status}</span>
                  </span>
                </td>

                <td className="py-3.5 text-center font-mono text-gray-400">{sub.language}</td>
                <td className="py-3.5 text-center font-mono text-gray-300">{sub.executionTime}</td>
                <td className="py-3.5 text-center font-mono text-gray-300">{sub.memory}</td>
                <td className="py-3.5 text-right pr-2 font-mono text-gray-500">{sub.date}</td>
              </motion.tr>
            ))}

            {filteredSubmissions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  No matching submissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
