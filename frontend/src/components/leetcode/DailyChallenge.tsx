"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, CheckCircle2, Clock, Zap, ExternalLink, ChevronDown, Award, Lightbulb } from 'lucide-react';

interface DailyChallengeProps {
  challengeTitle?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  completed?: boolean;
  rewardPoints?: number;
  problemUrl?: string;
  platformName?: string;
  brandColors?: {
    orange: string;
    yellow: string;
    accent: string;
    card: string;
  };
}

export default function DailyChallenge({
  challengeTitle = "Course Schedule II",
  difficulty = "Medium",
  completed = false,
  rewardPoints = 10,
  problemUrl = "https://leetcode.com/problems/course-schedule-ii/",
  platformName = "LeetCode",
  brandColors = {
    orange: '#FFA116',
    yellow: '#FFD43B',
    accent: '#FF8C00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  }
}: DailyChallengeProps) {
  const [timeLeft, setTimeLeft] = useState('16h 00m 00s');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Dynamically map actual platform metadata, topic tags, and tips based on the challenge title!
  const challengeMeta = useMemo(() => {
    const title = (challengeTitle || "").toLowerCase();
    if (title.includes("special characters")) {
      return {
        tags: ["Hash Table", "String", "Two Pointers"],
        acceptance: "48.5%",
        category: "Algorithms",
        complexity: "O(N) Time • O(1) Space",
        hint: "Track the last occurrence index of each lowercase letter and the first occurrence index of each uppercase letter. A character is special if last_lower[c] < first_upper[c]."
      };
    }
    if (title.includes("course schedule")) {
      return {
        tags: ["Graph", "Topological Sort", "BFS/DFS"],
        acceptance: "61.2%",
        category: "Advanced Graphs",
        complexity: "O(V + E) Time • O(V) Space",
        hint: "Use Kahn's topological sort (BFS in-degrees) or DFS cycle detection. Output the linear ordering of vertices if no cycle exists."
      };
    }
    return {
      tags: ["Algorithms", "Problem Solving", platformName],
      acceptance: "52.4%",
      category: "General Practice",
      complexity: "O(N) Optimal target",
      hint: "Analyze base edge cases, identify pattern matches, and consider dynamic programming or hash mapping to optimize lookup times."
    };
  }, [challengeTitle, platformName]);

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg relative overflow-hidden h-full flex flex-col justify-between min-h-[360px] transition-all duration-300`}>
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-2xl rounded-full pointer-events-none" 
        style={{ background: `radial-gradient(circle at 100% 0%, ${brandColors.orange}1a, transparent)` }}
      />

      <div className="space-y-4">
        {/* Top Header Row */}
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center gap-1 px-2.5 py-0.5 rounded border text-[8px] font-extrabold uppercase tracking-widest"
            style={{
              backgroundColor: `${brandColors.orange}1a`,
              borderColor: `${brandColors.orange}33`,
              color: brandColors.orange
            }}
          >
            <Flame className="w-2.5 h-2.5 animate-pulse" style={{ color: brandColors.orange }} />
            <span>Daily Challenge</span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 dark:text-gray-400">
            <Clock size={11} className="text-gray-500" />
            <span className="font-mono">{timeLeft}</span>
          </div>
        </div>

        {/* Title and Difficulty Block */}
        <div className="space-y-2">
          <h4 className="font-black text-base text-gray-900 dark:text-white tracking-wide leading-tight">{challengeTitle}</h4>
          
          <div className="flex flex-wrap items-center gap-2">
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

            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold flex items-center gap-0.5">
              <Zap size={10} style={{ color: brandColors.orange }} />
              <span>+{rewardPoints} Points</span>
            </span>

            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold">•</span>

            <span className="text-[9px] text-gray-600 dark:text-gray-400 font-bold">
              Acceptance: {challengeMeta.acceptance}
            </span>
          </div>
        </div>

        {/* Dynamic Topic Tags */}
        <div className="pt-1">
          <div className="text-[8px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1.5">Topic Focus</div>
          <div className="flex flex-wrap gap-1.5">
            {challengeMeta.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="px-2 py-0.5 rounded-md bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-orange-500/20 text-gray-700 dark:text-gray-300 text-[9px] font-bold transition-all cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* AI Hint Drawer Accordion */}
        <div className="pt-2">
          <button 
            onClick={() => setShowHint(!showHint)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all text-left group"
          >
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors text-[9px] font-black uppercase tracking-wider">
              <Lightbulb size={11} style={{ color: brandColors.orange }} />
              <span>AI Prep Hint</span>
            </div>
            <ChevronDown 
              size={12} 
              className={`text-gray-500 group-hover:text-black dark:group-hover:text-white transition-transform duration-300 ${showHint ? 'rotate-180' : ''}`} 
            />
          </button>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 rounded-xl bg-emerald-500/5 dark:bg-[#090C1B] border border-black/5 dark:border-white/[0.04] text-[10px] text-gray-700 dark:text-gray-400 space-y-2 leading-relaxed font-semibold">
                  <p>{challengeMeta.hint}</p>
                  <div 
                    className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider pt-1 border-t border-black/5 dark:border-white/[0.03]"
                    style={{ color: brandColors.orange }}
                  >
                    <span>Target Complexity</span>
                    <span>{challengeMeta.complexity}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Streak bonus announcement */}
        <div 
          className="p-2.5 rounded-xl border-l text-[9px] text-gray-600 dark:text-gray-400 flex items-center gap-2 font-bold"
          style={{ 
            borderLeftColor: brandColors.orange,
            backgroundImage: `linear-gradient(to right, ${brandColors.orange}0c, transparent)`
          }}
        >
          <Award size={12} style={{ color: brandColors.orange }} className="shrink-0" />
          <span>Complete this today to lock in your active coding streak!</span>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="border-t border-black/5 dark:border-white/[0.03] pt-4 mt-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
            completed ? 'bg-emerald-500/10 border-emerald-500/20 text-[#10B981]' : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-gray-500'
          }`}>
            <CheckCircle2 size={12} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {completed ? 'Completed' : 'Pending solve'}
          </span>
        </div>

        <a
          href={problemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-[9px] font-black tracking-widest uppercase rounded-xl text-black flex items-center gap-1.5 transition-all shadow-md shrink-0 hover:opacity-90"
          style={{ 
            backgroundColor: brandColors.orange,
            boxShadow: `0 4px 12px ${brandColors.orange}26`
          }}
        >
          <span>Solve Challenge</span>
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
