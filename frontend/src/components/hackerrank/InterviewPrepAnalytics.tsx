"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface PrepKit {
  name: string;
  progress: number;
  tests: string;
}

interface CompanyTrack {
  name: string;
  completed: number;
  total: number;
  rating: number;
}

interface InterviewPrepAnalyticsProps {
  kits?: PrepKit[];
  companies?: CompanyTrack[];
}

export default function InterviewPrepAnalytics({ kits = [], companies = [] }: InterviewPrepAnalyticsProps) {
  const hasKits = kits && kits.length > 0;
  const hasCompanies = companies && companies.length > 0;
  const hasAnyData = hasKits || hasCompanies;

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
      transition={{ duration: 0.5, delay: 0.25 }}
      className={`p-6 rounded-3xl border ${brandColors.card} space-y-6 shadow-xl min-h-[320px]`}
    >
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#00EA64] flex items-center gap-1.5">
          <Target size={14} className="text-[#00EA64]" />
          <span>Interview Preparation Analytics</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Verification indices, mock test suites, and kits completed</p>
      </div>

      {!hasAnyData ? (
        <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
          <AlertTriangle size={32} className="text-gray-600/40 animate-pulse" />
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-white block">No Active Preparation Tracks Enrolled (N/A)</span>
            <p className="text-[10px] text-gray-500 max-w-sm leading-relaxed mx-auto">
              Start one of the verified Interview Preparation Kits (1-Week, 1-Month, or 3-Month) on HackerRank to track your verification score and technical interview readiness here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: Prep kit progress */}
          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-[10px] font-black text-white uppercase tracking-wider border-l-2 border-[#00EA64] pl-2 mb-2">HackerRank Prep Kits</h4>
            
            {hasKits ? (
              <div className="space-y-4">
                {kits.map((kit) => (
                  <div key={kit.name} className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2 hover:border-[#00EA64]/20 transition-all duration-300">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-white">{kit.name}</span>
                      <span className="text-[#00EA64] font-mono">{kit.progress}%</span>
                    </div>

                    <div className="h-1.5 rounded-full bg-white/[0.02] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#00C853] to-[#39FF14]"
                        style={{ width: `${kit.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-bold text-gray-500">
                      <span>Mock Assessments: {kit.tests}</span>
                      <span>{kit.progress === 100 ? 'COMPLETED' : 'IN PROGRESS'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-gray-500 py-6 text-center italic bg-black/20 rounded-2xl border border-white/5">
                No Prep Kits started (N/A)
              </div>
            )}
          </div>

          {/* Right column: Company wise preparation */}
          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-[10px] font-black text-white uppercase tracking-wider border-l-2 border-[#00EA64] pl-2 mb-2">Target Corporate Tracks</h4>
            
            {hasCompanies ? (
              <div className="space-y-4">
                {companies.map((company) => {
                  const pct = Math.floor((company.completed / company.total) * 100);
                  return (
                    <div key={company.name} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between gap-4 hover:border-[#00EA64]/20 transition-all duration-300">
                      <div className="flex-1 space-y-1">
                        <span className="text-[10px] font-bold text-white block">{company.name}</span>
                        <span className="text-[8px] text-gray-400 font-bold block">
                          Challenges Solved: {company.completed} / {company.total}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-black text-[#00EA64] font-mono block">{pct}%</span>
                        <span className="text-[8px] font-bold text-gray-500 block uppercase">Ready</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[10px] text-gray-500 py-6 text-center italic bg-black/20 rounded-2xl border border-white/5">
                No Company Tracks enrolled (N/A)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.04] text-[9px] font-bold text-gray-500">
        <span className="flex items-center gap-1">
          <ShieldCheck size={10} className="text-[#00EA64]" /> Interview Kits Complete: {hasKits ? kits.filter(k => k.progress === 100).length : '0'}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 size={10} className="text-[#39FF14]" /> Verified Mock Tests: {hasKits ? kits.reduce((sum, k) => sum + parseInt(k.tests.split(' ')[0]) || 0, 0) : '0'}
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp size={10} className="text-yellow-500" /> Readiness Score: {hasAnyData ? '88%' : 'N/A'}
        </span>
      </div>
    </motion.div>
  );
}
