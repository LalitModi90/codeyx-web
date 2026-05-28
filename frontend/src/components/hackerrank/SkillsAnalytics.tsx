"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Terminal, Shield, Zap, AlertTriangle } from 'lucide-react';

interface SkillItem {
  subject: string;
  score: number;
  stars: number;
}

interface SkillsAnalyticsProps {
  skills?: SkillItem[];
}

export default function SkillsAnalytics({ skills = [] }: SkillsAnalyticsProps) {
  const hasData = skills && skills.length > 0;
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
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`p-6 rounded-3xl border ${brandColors.card} flex flex-col justify-between h-full min-h-[320px]`}
    >
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#00EA64] flex items-center gap-1.5">
          <Terminal size={14} className="text-[#00EA64]" />
          <span>Skills & Domain Expertise</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Vector radar and domain mastery indices</p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <AlertTriangle size={32} className="text-yellow-500/50 animate-pulse" />
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-white block">No Skills Data Available (N/A)</span>
            <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed">
              Link your HackerRank account and take skill assessments to populate your expertise indexes.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-6">
          {/* Radar Chart */}
          <div className="md:col-span-6 h-56 flex items-center justify-center relative select-none">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skills}>
                <PolarGrid stroke="rgba(255,255,255,0.03)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#64748b', fontSize: 8, fontWeight: 700 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar 
                  name="Proficiency" 
                  dataKey="score" 
                  stroke="#00EA64" 
                  fill="#00EA64" 
                  fillOpacity={0.15} 
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Progress Bars */}
          <div className="md:col-span-6 space-y-3.5">
            {skills.map((skill, index) => (
              <div key={skill.subject} className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Shield size={10} className="text-gray-500" />
                    {skill.subject}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#00EA64] font-mono">{skill.score}%</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-yellow-500 font-mono">{skill.stars}★</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.score}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#00C853] to-[#39FF14]"
                    style={{ boxShadow: '0 0 10px rgba(57, 255, 20, 0.3)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[9px] text-gray-400">
        <span>Mastery Level: {hasData ? 'Verified Competitive Developer' : 'N/A'}</span>
        {hasData && (
          <span className="text-[#00EA64] font-black uppercase tracking-wider flex items-center gap-1">
            <Zap size={10} /> Active Preparation
          </span>
        )}
      </div>
    </motion.div>
  );
}
