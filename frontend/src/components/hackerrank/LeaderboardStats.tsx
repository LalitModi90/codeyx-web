"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Trophy, Landmark, Percent } from 'lucide-react';

interface LeaderboardStatsProps {
  globalRank?: number;
  countryRank?: number;
  score?: number;
  universityRank?: number;
}

export default function LeaderboardStats({
  globalRank = 0,
  countryRank = 0,
  score = 0,
  universityRank = 0
}: LeaderboardStatsProps) {
  const brandColors = {
    primary: '#00EA64',
    secondary: '#00C853',
    accent: '#39FF14',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const ranks = [
    { name: "Global Standing", value: globalRank > 0 ? `#${globalRank.toLocaleString()}` : 'N/A', icon: Globe, detail: globalRank > 0 ? "Verified standing" : "No global rank logged" },
    { name: "Country Standing", value: countryRank > 0 ? `#${countryRank.toLocaleString()}` : 'N/A', icon: Trophy, detail: countryRank > 0 ? "Regional standing" : "No country rank logged" },
    { name: "University Rank", value: universityRank > 0 ? `#${universityRank}` : 'N/A', icon: Landmark, detail: universityRank > 0 ? "Campus standing" : "No campus rank logged" },
    { name: "Global Percentile", value: globalRank > 0 ? "Top 4.2%" : 'N/A', icon: Percent, detail: globalRank > 0 ? "Competitive threshold" : "Percentile not calculated" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`p-6 rounded-3xl border ${brandColors.card} space-y-6 shadow-xl`}
    >
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#00EA64] flex items-center gap-1.5">
          <Globe size={14} className="text-[#00EA64]" />
          <span>Leaderboard & Rankings</span>
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Competitive standings and percentile metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ranks.map((rank, index) => (
          <motion.div
            key={rank.name}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-[#00EA64]/20 transition-all duration-300 relative group"
          >
            <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center group-hover:border-[#00EA64]/30 transition-colors">
              <rank.icon className="w-5 h-5 text-[#00EA64]" />
            </div>

            <div>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block">{rank.name}</span>
              <span className="text-sm font-black text-white block mt-0.5 font-mono group-hover:text-[#39FF14] transition-colors">{rank.value}</span>
              <span className="text-[8px] text-gray-400 font-semibold block mt-0.5">{rank.detail}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
