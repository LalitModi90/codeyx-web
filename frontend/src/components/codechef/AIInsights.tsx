"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, CheckCircle2, ChevronRight, AlertCircle, ArrowUpRight } from 'lucide-react';

interface AIInsightsProps {
  rating: number;
  solvedCount: number;
  topics?: { subject: string; category: string; solved: number }[];
}

export default function AIInsights({ 
  rating = 1157, 
  solvedCount = 0,
  topics = []
}: AIInsightsProps) {
  const brandColors = {
    gold: '#D4A017',
    brown: '#8B5E3C',
    accent: '#FFB84D',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  // Real-time Dynamic AI Analysis from active user statistics
  const { strongTopic, weakTopic, division, nextDivision } = React.useMemo(() => {
    // Determine strongest and weakest topics from real solved statistics
    let strong = 'Implementation';
    let weak = 'Dynamic Programming';
    
    if (topics && topics.length > 0) {
      const sorted = [...topics].sort((a, b) => b.solved - a.solved);
      strong = sorted[0]?.subject || 'Implementation';
      
      const predefined = ['Dynamic Programming', 'Graph Theory', 'Greedy Algorithms', 'Mathematics', 'Sorting & Arrays', 'Implementation'];
      const solvedSubjects = topics.map(t => t.subject);
      const missing = predefined.filter(p => !solvedSubjects.includes(p));
      
      if (missing.length > 0) {
        weak = missing[0];
      } else {
        weak = sorted[sorted.length - 1]?.subject || 'Graph Theory';
      }
    }
    
    // Determine division and target based on CodeChef rating
    let divStr = 'Division 4';
    let nextDivStr = 'Division 3';
    if (rating >= 1850) {
      divStr = 'Division 1';
      nextDivStr = 'Grandmaster Tier';
    } else if (rating >= 1600) {
      divStr = 'Division 2';
      nextDivStr = 'Division 1';
    } else if (rating >= 1400) {
      divStr = 'Division 3';
      nextDivStr = 'Division 2';
    }
    
    return { strongTopic: strong, weakTopic: weak, division: divStr, nextDivision: nextDivStr };
  }, [topics, rating]);

  const insights = [
    {
      title: "Strongest Problem Domain",
      desc: `Excellent proficiency in ${strongTopic}. Your solutions in this domain demonstrate high accuracy and optimal runtime complexity.`,
      type: "strength",
      color: "text-emerald-400",
      bg: "bg-emerald-500/5 border-emerald-500/10"
    },
    {
      title: "Identified Skill Gap",
      desc: `Requires practice in ${weakTopic}. Focus on building fundamental concepts, auditing sample submissions, and practicing medium problems.`,
      type: "weakness",
      color: "text-[#FFB84D]",
      bg: "bg-amber-500/5 border-amber-500/10"
    },
    {
      title: "Contest Rating Growth",
      desc: `Currently competing in ${division} rated matches. Consistent performance and focusing on ${weakTopic} will trigger an elite promotion to ${nextDivision}.`,
      type: "growth",
      color: "text-blue-400",
      bg: "bg-blue-500/5 border-blue-500/10"
    }
  ];

  const recommendations = [
    `Solve 10 medium-level problems in ${weakTopic} to secure intermediate mastery and boost accuracy.`,
    `Participate in the next rated Starters contest to leverage your skills in ${strongTopic} and push past rating ${rating || 1100}.`,
    `Audit top ${nextDivision} submissions in ${weakTopic} to learn optimized algorithmic and traversal styles.`
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${brandColors.card} shadow-2xl space-y-6 relative overflow-hidden`}
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#FFB84D] animate-pulse" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">AI Performance Insights</h3>
        </div>
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#FFB84D] text-[8px] font-black uppercase tracking-widest">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Active Analyser</span>
        </span>
      </div>

      {/* Grid of strength, weakness, growth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((ins, idx) => (
          <div key={idx} className={`p-4 rounded-xl border ${ins.bg} flex flex-col justify-between space-y-3`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider ${ins.color}`}>
                  {ins.title}
                </span>
                {ins.type === 'weakness' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-[#FFB84D]" />
                ) : (
                  <ArrowUpRight className={`w-3.5 h-3.5 ${ins.color}`} />
                )}
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                {ins.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations Checklist */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Recommendations</h4>
        <div className="space-y-2">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-300 font-medium leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
