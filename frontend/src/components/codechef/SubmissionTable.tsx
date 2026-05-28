"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, CheckCircle2, XCircle } from 'lucide-react';

interface Submission {
  id: string;
  problemName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  runtime: string;
  memory: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  submittedTime: string;
}

interface SubmissionTableProps {
  submissions?: Submission[];
}

export default function SubmissionTable({
  submissions = []
}: SubmissionTableProps) {
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Accepted' | 'Failed'>('All');
  const [sortField, setSortField] = useState<keyof Submission>('submittedTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const pName = s.problemName || (s as any).name || '';
      const pLang = s.language || '';
      const pDiff = s.difficulty || (s as any).diff || 'Easy';
      const pStatus = s.status || 'Accepted';

      const matchSearch = pName.toLowerCase().includes(search.toLowerCase()) || 
                          pLang.toLowerCase().includes(search.toLowerCase());
      const matchDiff = diffFilter === 'All' || pDiff === diffFilter;
      const matchStatus = statusFilter === 'All' || (statusFilter === 'Accepted' ? pStatus === 'Accepted' : pStatus !== 'Accepted');
      return matchSearch && matchDiff && matchStatus;
    });
  }, [submissions, search, diffFilter, statusFilter]);

  const handleSort = (field: keyof Submission) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const brandColors = {
    gold: '#D4A017',
    brown: '#8B5E3C',
    accent: '#FFB84D',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#FFB84D]">Submission Logs</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Filter, search, and audit recent code submissions</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="w-full pl-9 pr-4 py-2 text-[10px] bg-white/[0.02] border border-white/5 rounded-xl focus:outline-none focus:border-[#FFB84D] text-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value as any)}
              className="bg-[#0B1023] border border-white/5 rounded-xl px-2.5 py-1.5 text-[9px] font-bold text-gray-400 focus:outline-none focus:border-[#FFB84D]"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#0B1023] border border-white/5 rounded-xl px-2.5 py-1.5 text-[9px] font-bold text-gray-400 focus:outline-none focus:border-[#FFB84D]"
            >
              <option value="All">All Statuses</option>
              <option value="Accepted">Accepted</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto select-none rounded-xl border border-white/[0.02]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-gray-500 bg-white/[0.01]">
              <th className="py-3.5 pl-4 cursor-pointer" onClick={() => handleSort('problemName')}>
                <div className="flex items-center gap-1">
                  <span>Problem Name</span>
                  <ArrowUpDown size={10} />
                </div>
              </th>
              <th className="py-3.5 cursor-pointer" onClick={() => handleSort('difficulty')}>
                <div className="flex items-center gap-1">
                  <span>Difficulty</span>
                  <ArrowUpDown size={10} />
                </div>
              </th>
              <th className="py-3.5">Runtime</th>
              <th className="py-3.5">Memory</th>
              <th className="py-3.5 cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown size={10} />
                </div>
              </th>
              <th className="py-3.5 pr-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredSubmissions.map((s, idx) => {
                const problemName = s.problemName || (s as any).name || 'Unknown Problem';
                const difficulty = s.difficulty || (s as any).diff || 'Easy';
                const language = s.language || 'C++20';
                const runtime = s.runtime || (s as any).executionTime || '0.00s';
                const memory = s.memory || '0B';
                const status = s.status || 'Accepted';
                const submittedTime = s.submittedTime || (s as any).date || 'Recently';

                return (
                  <motion.tr 
                    key={s.id || idx}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="border-b border-white/[0.02] last:border-none hover:bg-white/[0.01] transition-colors text-[10px]"
                  >
                    <td className="py-4 pl-4 font-bold text-white max-w-[200px] truncate">{problemName}</td>
                    <td className="py-4">
                      <span 
                        className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide border"
                        style={{
                          borderColor: difficulty === 'Easy' ? '#10B98130' : (difficulty === 'Medium' ? '#F59E0B30' : '#EF444430'),
                          backgroundColor: difficulty === 'Easy' ? '#10B98108' : (difficulty === 'Medium' ? '#F59E0B08' : '#EF444408'),
                          color: difficulty === 'Easy' ? '#10B981' : (difficulty === 'Medium' ? '#F59E0B' : '#EF4444')
                        }}
                      >
                        {difficulty}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-gray-400 font-mono">{runtime}</td>
                    <td className="py-4 font-semibold text-gray-400 font-mono">{memory}</td>
                    <td className="py-4">
                      <span 
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
                        style={{
                          backgroundColor: status === 'Accepted' ? '#10B98115' : '#EF444415',
                          color: status === 'Accepted' ? '#10B981' : '#EF4444',
                          boxShadow: status === 'Accepted' ? '0 0 10px rgba(16, 185, 129, 0.05)' : 'none'
                        }}
                      >
                        {status === 'Accepted' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        <span>{status}</span>
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right font-medium text-gray-500">{submittedTime}</td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {filteredSubmissions.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500 font-bold uppercase tracking-wider text-[10px]">
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
