"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, User, FolderGit2, Layers, BookOpen, FileCode2, ClipboardList,
  Trophy, Settings, LogOut, Sun, Moon, Search, Filter, ChevronDown, 
  CheckCircle2, Circle, Clock, Bookmark, MoreHorizontal, ArrowRight, ArrowLeft,
  Zap, Bell, Search as SearchIcon, ExternalLink, BarChart3, Star,
  TrendingUp, Calendar, List, Shield, HelpCircle, MessageSquare, Globe,
  Play, Target, ChevronRight, Video, FileText, Code, Database, Server, Cpu, Binary, Hash, Network, GitBranch
} from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useClerk, useUser } from '@clerk/nextjs';

export default function ProblemsDashboard() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeSheet, setActiveSheet] = useState('All Problems');
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile } = useClerk();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-[#080710]' : 'bg-[#f4f5f8]';
  const sidebar = isDark ? 'bg-[#0b0a12]' : 'bg-white';
  const card = isDark ? 'bg-[#0f141d] border-white/5' : 'bg-white border-gray-200';
  const border = isDark ? 'border-white/5' : 'border-gray-200';
  const txt = isDark ? 'text-white' : 'text-gray-900';

  // ========== ALL CATEGORIES DATA ==========
  const allCategories = {
    'DSA Sheets': [
      { id: 'Striver A2Z', name: 'A2Z Sheet', desc: 'Master DSA from Basics to Advanced', color: 'orange' },
      { id: 'Blind 75', name: 'Blind 75 Sheet', desc: 'Interview Problems with Video Solutions', color: 'orange' },
      { id: 'SDE Sheet', name: 'SDE Sheet', desc: 'Most Frequently Asked Interview Questions', color: 'orange' },
      { id: 'Striver 79', name: 'Striver 79 Sheet', desc: 'Last Minute Preparation', color: 'orange' },
    ],
    'Core CS Subjects': [
      { id: 'CN Sheet', name: 'CN Sheet', desc: 'Computer Networks Concepts', color: 'blue' },
      { id: 'DBMS Sheet', name: 'DBMS Sheet', desc: 'Database Management Systems', color: 'blue' },
      { id: 'OS Sheet', name: 'OS Sheet', desc: 'Operating System Concepts', color: 'blue' },
    ],
    'System Design': [
      { id: 'System Design', name: 'System Design Sheet', desc: 'Learn LLD & HLD with real examples', color: 'purple' },
    ],
    'DSA Playlist': [
      { id: 'Arrays', name: 'Arrays', desc: 'Learn from Basics to Advanced', color: 'cyan' },
      { id: 'Binary Search', name: 'Binary Search', desc: 'Learn from Basics to Advanced', color: 'cyan' },
      { id: 'Dynamic Programming', name: 'Dynamic Programming', desc: 'Learn from Basics to Advanced', color: 'cyan' },
      { id: 'Graphs', name: 'Graphs', desc: 'Learn from Basics to Advanced', color: 'cyan' },
      { id: 'Linked List', name: 'Linked List', desc: 'Learn from Basics to Advanced', color: 'cyan' },
      { id: 'Recursion', name: 'Recursion', desc: 'Learn from Basics to Advanced', color: 'rose' },
      { id: 'Stack and Queue', name: 'Stack and Queue', desc: 'Learn from Basics to Advanced', color: 'cyan' },
      { id: 'Strings', name: 'Strings', desc: 'Learn from Basics to Advanced', color: 'cyan' },
      { id: 'Trees', name: 'Trees', desc: 'Learn from Basics to Advanced', color: 'cyan' },
    ],
    'Competitive Programming': [
      { id: 'CP Sheet', name: 'CP Sheet', desc: 'Build up your CP skill set', color: 'amber' },
    ],
    'Blogs': [
      { id: 'blog-arrays', name: 'Arrays', desc: 'In-depth articles on array problems', color: 'pink' },
      { id: 'blog-intro-to-dsa', name: 'Introduction to DSA', desc: 'How to start your DSA journey', color: 'pink' },
      { id: 'blog-binary-search', name: 'Binary Search', desc: 'Master Binary Search patterns', color: 'pink' },
      { id: 'blog-bst-tree', name: 'Binary Search Tree', desc: 'BST concepts and problems', color: 'pink' },
      { id: 'blog-binary-tree', name: 'Binary Tree', desc: 'Tree traversal and problems', color: 'pink' },
      { id: 'blog-bit-manipulation', name: 'Bit Manipulation', desc: 'XOR, AND, OR tricks', color: 'pink' },
      { id: 'blog-cs-core', name: 'CS Core', desc: 'Computer Science fundamentals', color: 'pink' },
      { id: 'blog-dp', name: 'Dynamic Programming', desc: 'DP patterns and techniques', color: 'pink' },
      { id: 'blog-graph', name: 'Graph', desc: 'Graph algorithms explained', color: 'pink' },
      { id: 'blog-greedy', name: 'Greedy', desc: 'Greedy algorithm strategies', color: 'pink' },
      { id: 'blog-heap', name: 'Heap', desc: 'Priority Queue and Heap', color: 'pink' },
      { id: 'blog-interview-exp', name: 'Interview Experience', desc: 'Real interview stories', color: 'pink' },
      { id: 'blog-linked-list', name: 'Linked List', desc: 'Singly and Doubly LL', color: 'pink' },
      { id: 'blog-java', name: 'Java', desc: 'Java for competitive coding', color: 'pink' },
    ],
  };

  const accentColors: Record<string, { border: string; bg: string; text: string; btnBg: string; btnText: string }> = {
    orange: { border: 'border-orange-500/30', bg: 'bg-orange-500', text: 'text-orange-400', btnBg: 'bg-[#2a1f1a]', btnText: 'text-[#f97316]' },
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500', text: 'text-blue-400', btnBg: 'bg-[#1a1f2a]', btnText: 'text-blue-400' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500', text: 'text-purple-400', btnBg: 'bg-[#1f1a2a]', btnText: 'text-purple-400' },
    cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500', text: 'text-cyan-400', btnBg: 'bg-[#1a2a2a]', btnText: 'text-cyan-400' },
    rose: { border: 'border-rose-500/30', bg: 'bg-rose-500', text: 'text-rose-400', btnBg: 'bg-[#2a1a1a]', btnText: 'text-rose-400' },
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-500', text: 'text-amber-400', btnBg: 'bg-[#2a2a1a]', btnText: 'text-amber-400' },
    pink: { border: 'border-pink-500/30', bg: 'bg-pink-500', text: 'text-pink-400', btnBg: 'bg-[#2a1a20]', btnText: 'text-pink-400' },
  };

  const stats = [
    { title: 'Total Solved', value: '458', sub: '/ 1200', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Easy', value: '182', sub: '', icon: Circle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Medium', value: '234', sub: '', icon: Circle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Hard', value: '42', sub: '', icon: Circle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { title: 'Current Streak', value: '14', sub: 'days', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { title: 'Revision Pending', value: '28', sub: 'problems', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const sampleProblems = [
    { id: 1, name: 'Two Sum', diff: 'Easy', topic: 'Array', status: 'Solved', last: '2 days ago', platforms: ['leetcode'] },
    { id: 2, name: 'Best Time to Buy and Sell Stock', diff: 'Easy', topic: 'Array', status: 'Solved', last: '1 week ago', platforms: ['leetcode', 'codeforces'] },
    { id: 3, name: 'Longest Substring Without Repeating Characters', diff: 'Medium', topic: 'Sliding Window', status: 'Revision Pending', last: '3 weeks ago', platforms: ['leetcode'] },
    { id: 4, name: 'Median of Two Sorted Arrays', diff: 'Hard', topic: 'Binary Search', status: 'Bookmarked', last: 'Never', platforms: ['leetcode', 'atcoder'] },
    { id: 5, name: 'Merge Intervals', diff: 'Medium', topic: 'Array', status: 'Not Solved', last: 'Never', platforms: ['leetcode', 'codeforces'] },
    { id: 6, name: '3Sum', diff: 'Medium', topic: 'Two Pointers', status: 'Solved', last: '1 month ago', platforms: ['leetcode'] },
    { id: 7, name: 'Trapping Rain Water', diff: 'Hard', topic: 'Two Pointers', status: 'Revision Pending', last: '5 days ago', platforms: ['leetcode'] },
    { id: 8, name: 'Container With Most Water', diff: 'Medium', topic: 'Two Pointers', status: 'Solved', last: '2 days ago', platforms: ['leetcode'] },
  ];

  const [problemsList, setProblemsList] = useState<any[]>(sampleProblems);

  useEffect(() => {
    async function fetchProblems() {
      if (selectedSheet) {
        try {
          const res = await fetch('/data/striver_a2z.json');
          const localData = await res.json();
          setProblemsList(localData);
        } catch (err) {
          console.error("Failed to load data, falling back to mock data", err);
          setProblemsList(sampleProblems);
        }
      } else {
        setProblemsList(sampleProblems);
      }
    }
    
    fetchProblems();
  }, [selectedSheet]);

  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({'Arrays': true});
  const [expandedDiffs, setExpandedDiffs] = useState<Record<string, boolean>>({'Arrays-Easy': true});

  const toggleTopic = (topic: string) => setExpandedTopics(p => ({...p, [topic]: !p[topic]}));
  const toggleDiff = (topicDiff: string) => setExpandedDiffs(p => ({...p, [topicDiff]: !p[topicDiff]}));

  const groupedProblems = problemsList.reduce((acc, prob) => {
    const t = prob.topic || 'Uncategorized';
    if (!acc[t]) acc[t] = { total: 0, solved: 0, byDiff: { Easy: [], Medium: [], Hard: [] } };
    
    acc[t].total += 1;
    if (prob.status === 'Solved') acc[t].solved += 1;
    
    if (acc[t].byDiff[prob.diff]) {
      acc[t].byDiff[prob.diff].push(prob);
    } else {
      acc[t].byDiff.Medium.push(prob); // fallback
    }
    return acc;
  }, {} as Record<string, any>);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Solved': return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'Revision Pending': return <Clock size={14} className="text-orange-400" />;
      case 'Bookmarked': return <Bookmark size={14} className="text-purple-400" />;
      default: return <Circle size={14} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Solved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Revision Pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Bookmarked': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getDiffColor = (diff: string) => {
    switch(diff) {
      case 'Easy': return 'text-emerald-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-rose-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`h-screen flex ${bg} ${txt} transition-colors duration-300 font-sans overflow-hidden max-w-[1920px] mx-auto`}>
      {/* LEFT SIDEBAR */}
      <aside className={`hidden lg:flex flex-col w-56 border-r ${border} ${sidebar} flex-shrink-0 z-30`}>
        <div className="px-5 pt-6 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">CodeSync</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pt-2 scrollbar-none">
          {[
            { icon: Home, label: 'Overview', href: '/dashboard' },
            { icon: FolderGit2, label: 'Platforms', href: '/dashboard/platforms/leetcode' },
            { icon: ClipboardList, label: 'Problems', href: '/dashboard/problems', active: true },
            { icon: Trophy, label: 'Contests', href: '/dashboard/contests' },
            { icon: Zap, label: 'Streaks', href: '/dashboard/streaks' },
            { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
            { divider: true },
            { icon: Layers, label: 'Compare', href: '/dashboard/compare' },
            { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
            { icon: FileCode2, label: 'Notes', href: '/dashboard/notes' },
            { icon: Star, label: 'Achievements', href: '/dashboard/achievements' },
            { icon: BookOpen, label: 'Resume Builder', href: '/dashboard/resume' },
            { icon: Target, label: 'Goals', href: '/dashboard/goals' },
            { icon: Shield, label: 'Projects', href: '/dashboard/projects' },
          ].map((item, idx) => (
            item.divider ? (
              <div key={idx} className="my-3 border-t border-white/[0.05] mx-3" />
            ) : (
              <Link
                key={idx}
                href={item.href || '#'}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  item.active 
                    ? 'bg-purple-600/10 text-purple-400 relative' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                {item.active && (
                  <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                )}
                {item.icon && <item.icon size={16} className={`${item.active ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'}`} />}
                {item.label}
              </Link>
            )
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/[0.02] transition-colors">
            <HelpCircle size={16} className="text-gray-500" /> Help & Docs
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/[0.02] transition-colors">
            <Settings size={16} className="text-gray-500" /> Settings
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* TOP NAVBAR */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-white/5 bg-[#080710]/80 backdrop-blur-md z-20 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-gray-500">
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Dashboard</span>
              <span className="text-gray-700">/</span>
              <span className="text-purple-400">Problems</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All Systems Synced
            </div>

            <div className="w-px h-6 bg-white/10 hidden md:block" />

            <button aria-label="View notifications" className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-[#080710]"></span>
            </button>

            <div className="relative" ref={profileMenuRef}>
              <div 
                className="flex items-center gap-3 cursor-pointer pl-2"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white/10">
                  {isLoaded && isSignedIn && user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    'AK'
                  )}
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#0f141d] shadow-2xl overflow-hidden py-1 z-50">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-bold text-white">Ankit Kumar</p>
                    <p className="text-xs text-gray-500">ankit@example.com</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => openUserProfile()} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5">
                      <User size={14} /> Profile Settings
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
            
            {/* LEFT MAIN AREA */}
            <div className="flex-1 flex flex-col min-w-0">
              
              {/* ========== CONDITIONAL VIEW ========== */}
              {!selectedSheet ? (
                /* ========== LANDING GRID VIEW ========== */
                <div className="flex flex-col gap-8">
                  {/* Header Title */}
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-1">DSA Sheets</h1>
                    <p className="text-xs text-gray-400 font-medium">Track and solve curated coding sheets with analytics and progress tracking.</p>
                  </div>

                  {Object.entries(allCategories).map(([category, items]) => {
                    const firstColor = items[0]?.color || 'orange';
                    const accent = accentColors[firstColor];
                    return (
                      <div key={category}>
                        <h2 className={`text-lg font-extrabold text-white mb-4 tracking-tight`}>{category}</h2>
                        <div className={`grid gap-4 ${
                          items.length === 1 ? 'grid-cols-1 max-w-xs' : 
                          items.length <= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 
                          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        }`}>
                          {items.map((sheet, idx) => {
                            const a = accentColors[sheet.color];
                            return (
                              <div 
                                key={idx} 
                                className={`relative p-4 rounded-xl bg-[#121212] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer group`}
                              >
                                <div className="flex gap-3 mb-4">
                                  <div className={`w-[3px] h-10 ${a.bg} rounded-full flex-shrink-0`} />
                                  <div>
                                    <h3 className="text-sm font-bold text-white mb-1 tracking-wide group-hover:text-white/90">{sheet.name}</h3>
                                    <p className="text-[10px] font-medium text-gray-500 leading-tight pr-2">{sheet.desc}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedSheet(sheet.id); }}
                                    className={`flex-1 py-2 rounded-md ${a.btnBg} ${a.btnText} text-[10px] font-bold hover:opacity-80 transition-colors`}
                                  >
                                    Sheet
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedSheet(sheet.id); }}
                                    className={`flex-1 py-2 rounded-md ${a.btnBg} ${a.btnText} text-[10px] font-bold hover:opacity-80 transition-colors`}
                                  >
                                    Start Learning
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* ========== DETAIL TRACKER VIEW ========== */
                <div className="flex flex-col min-w-0">
                  {/* Back Button + Title */}
                  <div className="mb-6">
                    <button 
                      onClick={() => setSelectedSheet(null)}
                      className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white mb-3 transition-colors group"
                    >
                      <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                      Back to all sheets
                    </button>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-1">{selectedSheet}</h1>
                    <p className="text-xs text-gray-400 font-medium">Track and solve problems from this curated sheet.</p>
                  </div>

              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className={`${card} rounded-2xl p-4 border flex flex-col group relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full blur-2xl -z-10 transition-opacity opacity-50 group-hover:opacity-100`} />
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        <stat.icon size={12} />
                      </div>
                      <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">{stat.title}</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-black text-white">{stat.value}</span>
                      {stat.sub && <span className="text-[10px] text-gray-500 font-bold mb-1">{stat.sub}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Toolbar / Filters */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search problems..." 
                      className="w-full bg-[#080710] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <button aria-label="Toggle filters" className="p-2 rounded-xl bg-[#080710] border border-white/10 text-gray-400 hover:text-white transition-colors md:hidden">
                    <Filter size={16} />
                  </button>
                </div>

                <div className="hidden md:flex flex-wrap items-center gap-2">
                  {['Difficulty', 'Status', 'Topic', 'Platform'].map((filter, idx) => (
                    <button key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080710] border border-white/10 text-[10px] font-bold text-gray-400 hover:text-white hover:border-white/20 transition-all">
                      {filter} <ChevronDown size={12} />
                    </button>
                  ))}
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 hover:bg-purple-500/20 transition-all">
                    <Filter size={12} /> More Filters
                  </button>
                </div>
              </div>

              {/* Main Problems Accordion List */}
              <div className="flex flex-col gap-2">
                {/* Overall Progress Pill */}
                <div className="bg-[#1f1a18] border border-orange-500/20 rounded-xl p-4 flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                        <circle cx="24" cy="24" r="20" stroke="#f97316" strokeWidth="4" fill="none" strokeDasharray="125" strokeDashoffset={125 - (125 * 33) / 100} className="transition-all duration-1000" />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-white">33%</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Overall Progress</h4>
                      <p className="text-[10px] text-gray-400">151 / 458 Solved</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-500" /><span className="text-gray-300">Easy 51/100</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-yellow-500" /><span className="text-gray-300">Medium 80/200</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-rose-500" /><span className="text-gray-300">Hard 20/158</span></div>
                  </div>
                </div>

                {Object.keys(groupedProblems).map(topic => {
                  const isExpanded = expandedTopics[topic] !== false; // Default true for demo
                  const diffs = groupedProblems[topic].byDiff;
                  const total = groupedProblems[topic].total;
                  const solved = groupedProblems[topic].solved;
                  
                  return (
                    <div key={topic} className="flex flex-col">
                      {/* Topic Header */}
                      <div 
                        onClick={() => toggleTopic(topic)}
                        className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.04] transition-colors"
                      >
                         <div className="flex items-center gap-3">
                           <ChevronRight size={16} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                           <span className="text-sm font-bold text-gray-200 tracking-wide">{topic}</span>
                         </div>
                         <div className="flex items-center gap-4">
                           <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{width: `${(solved/total)*100}%`}}></div>
                           </div>
                           <span className="text-xs font-mono text-gray-500">{solved} / {total}</span>
                         </div>
                      </div>

                      {/* Topic Content (Difficulties) */}
                      {isExpanded && (
                        <div className="flex flex-col pl-6 mt-2 mb-4 gap-2 border-l border-white/5 ml-2">
                          {['Easy', 'Medium', 'Hard'].map(diff => {
                            if (!diffs[diff] || diffs[diff].length === 0) return null;
                            const diffKey = `${topic}-${diff}`;
                            const isDiffExpanded = expandedDiffs[diffKey] !== false; // Default true
                            const dTotal = diffs[diff].length;
                            const dSolved = diffs[diff].filter((p:any) => p.status === 'Solved').length;

                            return (
                              <div key={diffKey} className="flex flex-col">
                                {/* Difficulty Header */}
                                <div 
                                  onClick={() => toggleDiff(diffKey)}
                                  className="flex items-center justify-between py-2.5 pr-2 cursor-pointer group"
                                >
                                   <div className="flex items-center gap-2">
                                      <ChevronDown size={14} className={`text-gray-600 transition-transform ${!isDiffExpanded ? '-rotate-90' : ''} group-hover:text-gray-400`} />
                                      <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{diff}</span>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <div className="w-16 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full" style={{width: `${(dSolved/dTotal)*100}%`}}></div>
                                      </div>
                                      <span className="text-[10px] font-mono text-gray-600">{dSolved} / {dTotal}</span>
                                   </div>
                                </div>
                                
                                {/* Difficulty Table */}
                                {isDiffExpanded && (
                                  <div className="overflow-x-auto mt-1 mb-3">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                      <thead>
                                        <tr className="border-b border-white/5">
                                          <th className="py-2.5 px-4 w-12 text-center text-[9px] font-extrabold uppercase tracking-widest text-gray-600">Status</th>
                                          <th className="py-2.5 px-4 text-[9px] font-extrabold uppercase tracking-widest text-gray-600">Problem</th>
                                          <th className="py-2.5 px-4 text-[9px] font-extrabold uppercase tracking-widest text-gray-600 text-center">Article</th>
                                          <th className="py-2.5 px-4 text-[9px] font-extrabold uppercase tracking-widest text-gray-600 text-center">Video</th>
                                          <th className="py-2.5 px-4 text-[9px] font-extrabold uppercase tracking-widest text-gray-600 text-center">Practice</th>
                                          <th className="py-2.5 px-4 text-[9px] font-extrabold uppercase tracking-widest text-gray-600 text-center">Note</th>
                                          <th className="py-2.5 px-4 text-[9px] font-extrabold uppercase tracking-widest text-gray-600 text-center">Revision</th>
                                          <th className="py-2.5 px-4 text-[9px] font-extrabold uppercase tracking-widest text-gray-600 text-right">Difficulty</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {diffs[diff].map((prob:any) => (
                                          <tr key={prob.id} className="border-b border-white/[0.02] last:border-none hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-3 px-4 text-center">
                                              <div className="flex justify-center">
                                                {prob.status === 'Solved' ? (
                                                  <div className="w-3.5 h-3.5 rounded-sm bg-orange-500 flex items-center justify-center">
                                                    <CheckCircle2 size={10} className="text-white" />
                                                  </div>
                                                ) : (
                                                  <div className="w-3.5 h-3.5 rounded-sm border-2 border-gray-600 group-hover:border-orange-500 transition-colors cursor-pointer" />
                                                )}
                                              </div>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className="font-bold text-xs text-gray-300 group-hover:text-white transition-colors cursor-pointer">{prob.name}</span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                              <button aria-label="View notes" className="text-gray-600 hover:text-orange-400 transition-colors inline-flex justify-center"><FileText size={14} /></button>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                              <button aria-label="Watch solution video" className="text-gray-600 hover:text-rose-500 transition-colors inline-flex justify-center"><Video size={14} /></button>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                              <button aria-label="Open problem on LeetCode" className="text-gray-600 hover:text-emerald-400 transition-colors inline-flex justify-center"><ExternalLink size={14} /></button>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                              <button aria-label="View editorial" className="text-gray-600 hover:text-white transition-colors inline-flex justify-center"><BookOpen size={14} /></button>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                              <button aria-label={prob.status === 'Revision Pending' ? 'Remove from revision' : 'Mark for revision'} className={`inline-flex justify-center transition-colors ${prob.status === 'Revision Pending' ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}>
                                                <Star size={14} className={prob.status === 'Revision Pending' ? 'fill-yellow-400' : ''} />
                                              </button>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border border-white/5 ${getDiffColor(prob.diff).replace('text-', 'bg-').replace('400', '500/10')} ${getDiffColor(prob.diff)}`}>
                                                {prob.diff}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

            {/* RIGHT SIDEBAR (Analytics & Quick Actions) — only in detail view */}
            {selectedSheet && (
            <div className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-5">
              
              {/* Sheet Progress Donut */}
              <div className={`${card} border rounded-2xl p-5 flex flex-col relative overflow-hidden`}>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4">{activeSheet} Progress</h3>
                
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Solved', value: 458, fill: '#22c55e' },
                          { name: 'Unsolved', value: 742, fill: 'rgba(255,255,255,0.05)' }
                        ]}
                        innerRadius={45}
                        outerRadius={55}
                        dataKey="value"
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                        cornerRadius={10}
                      >
                        <Cell fill="#22c55e" style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.4))' }} />
                        <Cell fill="rgba(255,255,255,0.05)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">38<span className="text-sm text-gray-500">%</span></span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-500" /><span className="text-white">458 Solved</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-gray-600" /><span className="text-gray-500">742 Left</span></div>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className={`${card} border rounded-2xl p-5 flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">Difficulty</h3>
                  <BarChart3 size={14} className="text-gray-500" />
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: 'Easy', count: 182, total: 300, color: 'bg-emerald-500', bg: 'bg-emerald-500/20' },
                    { label: 'Medium', count: 234, total: 600, color: 'bg-yellow-500', bg: 'bg-yellow-500/20' },
                    { label: 'Hard', count: 42, total: 300, color: 'bg-rose-500', bg: 'bg-rose-500/20' },
                  ].map((diff, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold mb-1.5">
                        <span className="text-gray-300">{diff.label}</span>
                        <span className="font-mono text-gray-400"><span className="text-white">{diff.count}</span> / {diff.total}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(diff.count/diff.total)*100}%` }}
                           transition={{ duration: 1, ease: "easeOut" }}
                           className={`h-full rounded-full ${diff.color}`}
                           style={{ boxShadow: `0 0 10px ${diff.color.includes('emerald') ? '#10b981' : diff.color.includes('yellow') ? '#eab308' : '#ef4444'}` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Analytics */}
              <div className={`${card} border rounded-2xl p-5 flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">Topic Analytics</h3>
                  <BarChart3 size={14} className="text-gray-500" />
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: 'Arrays', count: 45, total: 50, color: 'bg-blue-400' },
                    { label: 'Graphs', count: 12, total: 30, color: 'bg-purple-400' },
                    { label: 'DP', count: 8, total: 40, color: 'bg-pink-400' },
                    { label: 'Trees', count: 25, total: 35, color: 'bg-emerald-400' },
                    { label: 'Binary Search', count: 15, total: 20, color: 'bg-amber-400' },
                  ].map((topic, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold mb-1.5">
                        <span className="text-gray-300">{topic.label}</span>
                        <span className="font-mono text-gray-400"><span className="text-white">{topic.count}</span> / {topic.total}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(topic.count/topic.total)*100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${topic.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Goal */}
              <div className={`${card} border rounded-2xl p-5 relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-purple-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">Daily Goal</h3>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">3/5 Solved</span>
                </div>
                <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden relative z-10">
                  <div className="h-full w-[60%] bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                </div>
                <p className="text-[9px] text-gray-400 font-medium mt-3 relative z-10">Solve 2 more problems to maintain your 14-day streak!</p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-gray-300 text-xs font-bold hover:bg-white/[0.05] transition-all">
                  <ExternalLink size={14} className="text-gray-400" /> Open Original Problem
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-[0_4px_15px_rgba(147,51,234,0.3)] hover:shadow-[0_6px_20px_rgba(147,51,234,0.4)] hover:-translate-y-0.5 transition-all">
                  <Zap size={14} className="fill-white/20" /> Random Problem
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-orange-400 text-xs font-bold hover:bg-orange-500/10 transition-all">
                  <Bookmark size={14} /> Mark Revision
                </button>
              </div>

            </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
