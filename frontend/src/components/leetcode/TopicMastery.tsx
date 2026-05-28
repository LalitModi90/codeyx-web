"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

interface Topic {
  subject: string;
  solved: number;
  category: string;
}

interface TopicMasteryProps {
  topics?: Topic[];
}

export default function TopicMastery({
  topics = []
}: TopicMasteryProps) {
  const brandColors = {
    orange: '#FFA116',
    yellow: '#FFD43B',
    accent: '#FF8C00',
    card: 'bg-[#0B1023]/80 border-white/[0.08] backdrop-blur-xl',
  };

  const hasData = Array.isArray(topics) && topics.length > 0;

  if (!hasData) {
    return (
      <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-4 flex flex-col items-center justify-center text-center py-12`}>
        <div className="text-gray-500 text-lg font-black font-mono">#</div>
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-300">
          No solved problems available
        </h3>
        <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed">
          Sync your profile to load analytics
        </p>
      </div>
    );
  }

  // Merge database topics
  const mergedMap = new Map<string, any>();

  topics.forEach((t: any) => {
    const key = (t.subject || t.tagName || t.name || '').toLowerCase();
    if (key) {
      const solvedCount = t.solved || t.count || t.problemsSolved || 0;
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key);
        existing.solved = solvedCount || existing.solved;
      } else {
        mergedMap.set(key, {
          subject: t.subject || t.tagName || t.name,
          solved: solvedCount,
          category: t.category || 'Fundamental'
        });
      }
    }
  });

  const safeTopics = Array.from(mergedMap.values());

  const advancedTags = new Set([
    'dynamic programming', 'backtracking', 'monotonic stack', 'divide and conquer', 
    'rolling hash', 'data stream', 'trie', 'monotonic queue', 'segment tree', 
    'union find', 'memoization'
  ]);

  const intermediateTags = new Set([
    'hash table', 'math', 'binary search', 'bit manipulation', 'sliding window', 
    'recursion', 'greedy', 'tree', 'binary tree', 'depth-first search', 
    'breadth-first search', 'heap (priority queue)', 'graph', 'topological sort'
  ]);

  // Determine actual category of each topic
  const mappedTopics = safeTopics.map(t => {
    const nameLower = (t.subject || '').toLowerCase();
    let category = t.category;
    if (!category || category === 'Fundamental' || category === 'fundamental') {
      if (advancedTags.has(nameLower)) {
        category = 'Advanced';
      } else if (intermediateTags.has(nameLower)) {
        category = 'Intermediate';
      } else {
        category = 'Fundamental';
      }
    }
    return { ...t, category };
  });

  // Group topics by category
  const categories = {
    Advanced: mappedTopics.filter(t => t.category === 'Advanced' || t.category === 'advanced'),
    Intermediate: mappedTopics.filter(t => t.category === 'Intermediate' || t.category === 'intermediate'),
    Fundamental: mappedTopics.filter(t => t.category === 'Fundamental' || t.category === 'fundamental'),
  };

  const groupMeta = [
    {
      name: 'Advanced',
      list: categories.Advanced,
      color: 'text-rose-500',
      bulletBg: 'bg-rose-500',
      borderHover: 'hover:border-rose-500/30 hover:bg-rose-500/[0.02]',
    },
    {
      name: 'Intermediate',
      list: categories.Intermediate,
      color: 'text-amber-500',
      bulletBg: 'bg-amber-500',
      borderHover: 'hover:border-amber-500/30 hover:bg-amber-500/[0.02]',
    },
    {
      name: 'Fundamental',
      list: categories.Fundamental,
      color: 'text-emerald-500',
      bulletBg: 'bg-emerald-500',
      borderHover: 'hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]',
    },
  ];

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6`}>
      <div>
        <h3 className="text-[15px] font-semibold text-white tracking-wide">
          Skills
        </h3>
      </div>

      <div className="space-y-6">
        {groupMeta.map((group) => {
          if (group.list.length === 0) return null;

          return (
            <div key={group.name} className="space-y-3">
              {/* Category Title */}
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-black ${group.color}`}>•</span>
                <h4 className="text-[11px] font-bold text-gray-300">
                  {group.name}
                </h4>
              </div>

              {/* Skills Grid */}
              <div className="flex flex-wrap gap-x-5 gap-y-3.5">
                {group.list.map((topic) => (
                  <div key={topic.subject} className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      className={`px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-gray-300 text-[10px] font-bold tracking-wide cursor-default transition-all duration-300 ${group.borderHover}`}
                    >
                      {topic.subject}
                    </motion.div>
                    <span className="text-[10px] font-semibold text-gray-400 font-mono">
                      x{topic.solved}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
