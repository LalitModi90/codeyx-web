"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface Topic {
  subject: string;
  solved: number;
  category: string;
}

interface TopicMasteryProps {
  topics?: Topic[];
  selectedTopic?: string | null;
  onSelectTopic?: (topic: string | null) => void;
}

export default function TopicMastery({
  topics = [],
  selectedTopic = null,
  onSelectTopic
}: TopicMasteryProps) {
  const brandColors = {
    gold: '#D4A017',
    brown: '#8B5E3C',
    accent: '#FFB84D',
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

  // Merge database topics into the list
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
    'dynamic programming', 'graph theory', 'segment tree', 'trie', 'disjoint set union', 
    'advanced data structures', 'flow network', 'dp', 'graphs', 'dfs and similar', 'shortest paths', 'flows'
  ]);

  const intermediateTags = new Set([
    'greedy algorithms', 'binary search', 'tree algorithms', 'math & number theory', 
    'two pointers', 'recursion', 'bit manipulation', 'constructive algorithms',
    'greedy', 'trees', 'strings', 'string suffix structures', 'sorting & arrays', 'sorting & search'
  ]);

  const mappedTopics = safeTopics.map(t => {
    const nameLower = (t.subject || '').toLowerCase();
    let category = t.category;
    
    // Dynamically classify for perfect UI parity across platforms
    if (advancedTags.has(nameLower)) {
      category = 'Advanced';
    } else if (intermediateTags.has(nameLower)) {
      category = 'Intermediate';
    } else {
      category = 'Fundamental';
    }
    return { ...t, category };
  });

  const categories = {
    Advanced: mappedTopics.filter(t => t.category === 'Advanced' || t.category === 'advanced'),
    Intermediate: mappedTopics.filter(t => t.category === 'Intermediate' || t.category === 'intermediate'),
    Fundamental: mappedTopics.filter(t => t.category === 'Fundamental' || t.category === 'fundamental'),
  };

  const groupMeta = [
    {
      name: 'Advanced Mastery',
      list: categories.Advanced,
      color: 'text-rose-400',
      bulletBg: 'bg-rose-400',
      borderHover: 'hover:border-rose-500/30 hover:bg-rose-500/[0.02]',
    },
    {
      name: 'Intermediate Techniques',
      list: categories.Intermediate,
      color: 'text-[#FFB84D]',
      bulletBg: 'bg-[#FFB84D]',
      borderHover: 'hover:border-amber-500/30 hover:bg-amber-500/[0.02]',
    },
    {
      name: 'Fundamental Core',
      list: categories.Fundamental,
      color: 'text-emerald-400',
      bulletBg: 'bg-emerald-400',
      borderHover: 'hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]',
    },
  ];

  return (
    <div className={`p-6 rounded-2xl border ${brandColors.card} shadow-lg space-y-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
            Topic Mastery Analytics
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Categorized breakdown of solved concept tags • Click tag to filter</p>
        </div>
      </div>

      <div className="space-y-6">
        {groupMeta.map((group) => {
          if (group.list.length === 0) return null;

          return (
            <div key={group.name} className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-black ${group.color}`}>•</span>
                <h4 className="text-[11px] font-bold text-gray-300">
                  {group.name}
                </h4>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {group.list.map((topic) => {
                  const isSelected = selectedTopic?.toLowerCase() === topic.subject.toLowerCase();
                  return (
                    <div 
                      key={topic.subject} 
                      onClick={() => onSelectTopic && onSelectTopic(isSelected ? null : topic.subject)}
                      className="flex items-center gap-2 cursor-pointer group/pill"
                    >
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className={`px-3.5 py-1.5 rounded-full border text-[10px] font-bold tracking-wide transition-all duration-300 ${
                          isSelected 
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(255,184,77,0.15)]' 
                            : 'bg-white/[0.03] border-white/[0.06] text-gray-300 hover:bg-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        {topic.subject}
                      </motion.div>
                      <span className={`text-[10px] font-semibold font-mono transition-colors ${
                        isSelected ? 'text-amber-400 font-bold' : 'text-gray-500 group-hover/pill:text-gray-300'
                      }`}>
                        x{topic.solved}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTopic && (
        <div className="flex justify-end pt-1">
          <button 
            onClick={() => onSelectTopic && onSelectTopic(null)}
            className="text-[8px] font-black text-amber-500 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
          >
            [ Clear Topic Filter ]
          </button>
        </div>
      )}
    </div>
  );
}
