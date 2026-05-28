"use client";

import React, { useMemo } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIInsightsProps {
  solvedCount: number;
  rating: number;
  maxRating: number;
}

export default function AIInsights({
  solvedCount = 0,
  rating = 0,
  maxRating = 0
}: AIInsightsProps) {

  const insights = useMemo(() => {
    if (solvedCount === 0) {
      return {
        strongest: "Needs more submissions",
        weakest: "Needs more submissions",
        recommendations: [
          "Sync your Codeforces handle to allow the AI optimizer to identify skill gaps.",
          "Solve standard Div. 3 problems to build basic logic and syntax speed.",
          "Target greedy and implementation topics to begin your competitive roadmap."
        ]
      };
    }

    let strongest = "Implementation & Math";
    let weakest = "Dynamic Programming & Graphs";
    let recommendations = [
      "Improve speed on Easy (< 1200) tasks to secure constant rating updates in contest rounds.",
      "Incorporate daily 1-hour practice runs focusing entirely on DP state transpositions.",
      "Participate in virtual rounds to get familiar with Codeforces time frames and stress factors."
    ];

    if (rating >= 1400) {
      strongest = "Greedy Strategies & Binary Searches";
      weakest = "Number Theory & Advanced Geometry";
      recommendations = [
        "Focus on rating level 1400-1600 problems to prepare for Expert tier promos.",
        "Practice constructive algorithms which represent high-scoring slots in Div 2 rounds.",
        "Deepen your library of templated algorithms (Segment Trees, DSU, DFS tree traversal)."
      ];
    }

    if (rating >= 1900) {
      strongest = "Graph Networks & Segment Trees";
      weakest = "Combinatorics & Hard Probabilities";
      recommendations = [
        "Stress-test advanced data structures and practice optimization logic for extreme memory bounds.",
        "Solve high-tier past Div. 1 challenges to enhance abstract reasoning.",
        "Review editorial solutions for hard problems immediately after live contests."
      ];
    }

    return { strongest, weakest, recommendations };
  }, [solvedCount, rating]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#4DA3FF] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#4DA3FF]" />
            <span>AI Performance Insights</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Automatic performance auditor & skill optimization tips</p>
        </div>

        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest animate-pulse">
          <span>AI Engine Online</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Strongest Skills */}
        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider leading-none block">Strongest Category</span>
            <span className="text-xs font-bold text-white block">{insights.strongest}</span>
            <span className="text-[8px] text-gray-400 leading-normal block">Highest solve velocity and maximum speed index scores.</span>
          </div>
        </div>

        {/* Focus Areas / Weakest */}
        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider leading-none block">Primary Growth Focus</span>
            <span className="text-xs font-bold text-white block">{insights.weakest}</span>
            <span className="text-[8px] text-gray-400 leading-normal block">Identified category gap. Spend 20% more training duration here.</span>
          </div>
        </div>

      </div>

      {/* Recommendations List */}
      <div className="space-y-3 pt-2">
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Actionable Recommendations</span>
        <div className="space-y-2">
          {insights.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2 text-xs">
              <ArrowRight className="w-3.5 h-3.5 text-[#4DA3FF] flex-shrink-0 mt-0.5" />
              <span className="text-gray-300 font-medium leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
