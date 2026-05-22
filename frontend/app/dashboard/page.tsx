"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import {
  CheckSquare, Square, Play, RotateCcw, FolderGit2, Bot, Calendar, Download, Eye,
  Globe, Trophy, Flame, CheckCircle2, Target, Code2, Layers,
  MonitorSmartphone, Briefcase, ChevronRight, Activity, TrendingUp,
  Zap, BookOpen
} from 'lucide-react';
import ActivityHeatmap from '../../components/dashboard/ActivityHeatmap';
import TopNavbar from '../../components/shared/TopNavbar';

export default function CodeyxDashboard() {
  const [theme, setTheme] = useState('dark');
  const { user, isLoaded } = useUser();
  
  const userName = isLoaded && user?.firstName ? user.firstName : 'Lalit';
  const userImage = isLoaded && user?.imageUrl ? user.imageUrl : null;

  // Theme classes
  const cardBg = "bg-[#101014]";
  const border = "border-white/5";

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-12">
      
      {/* 📌 TOP NAVBAR */}
      <TopNavbar />

      {/* 🏠 MAIN DASHBOARD GRID */}
      <main className="max-w-[1600px] mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* LEFT COLUMN GROUP (3 Cols) */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* ROW 1: Hero & Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1️⃣ Welcome Hero Section */}
              <div className={`lg:col-span-2 ${cardBg} border ${border} rounded-[24px] p-8 relative overflow-hidden flex flex-col justify-between shadow-xl`}>
                <div className="absolute top-0 right-0 w-[400px] h-full opacity-20 pointer-events-none flex items-center justify-end pr-10">
                  {/* Futuristic Code Icon Graphic */}
                  <div className="relative">
                    <Code2 size={160} className="text-[#FF8A00] animate-pulse" strokeWidth={1} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#FF8A00] rounded-full blur-[80px]" />
                  </div>
                </div>

                <div className="relative z-10">
                  <h1 className="text-3xl font-extrabold text-white mb-1 flex items-center gap-2">
                    Good Evening, {userName}! <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
                  </h1>
                  <p className="text-[#A1A1AA] text-sm">Consistency today, success tomorrow.</p>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-10 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Flame className="text-[#FF8A00]" size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Active Streak</p>
                      <p className="text-xl font-black text-white mt-0.5">284 <span className="text-xs text-[#FF8A00] font-bold">days</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="text-emerald-400" size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Problems Solved</p>
                      <p className="text-xl font-black text-white mt-0.5 text-emerald-400">1,342</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <TrendingUp className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Weekly Goal</p>
                      <p className="text-xl font-black text-white mt-0.5 text-blue-400">12 <span className="text-xs text-gray-500 font-bold">/ 25</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2️⃣ Daily Checklist Card */}
              <div className={`${cardBg} border ${border} rounded-[24px] p-6 shadow-xl flex flex-col`}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-sm text-white">Daily Checklist</h3>
                  <span className="text-[10px] font-bold text-[#A1A1AA]">1 of 4 completed</span>
                </div>
                <div className="space-y-4 flex-1">
                  {[
                    { text: "Solve Today's Problems", done: true },
                    { text: "Revise DP Sheet", done: false },
                    { text: "Solve One Contest", done: false },
                    { text: "Update Notes", done: false },
                  ].map((task, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${task.done ? 'bg-[#FF8A00] border-[#FF8A00]' : 'border-white/10 group-hover:border-white/30'}`}>
                        {task.done && <CheckSquare size={12} className="text-white bg-[#FF8A00]" />}
                      </div>
                      <span className={`text-xs font-semibold ${task.done ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white transition-colors'}`}>
                        {task.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 2: Continue Solving & Quick Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              
              {/* 3️⃣ Continue Solving Section */}
              <div className={`xl:col-span-2 ${cardBg} border ${border} rounded-[24px] p-6 shadow-xl relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A00]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FF8A00]/10 transition-colors" />
                
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2 mb-4">
                  <Play size={14} className="text-[#FF8A00]" /> Continue Solving
                </h3>
                
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-2">LeetCode 75</h2>
                    <p className="text-xs text-[#A1A1AA] max-w-[200px] leading-relaxed">Master key coding concepts and frequently asked problems.</p>
                  </div>
                  
                  {/* Progress Ring */}
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-white/5" strokeWidth="6" stroke="currentColor" fill="transparent" r="34" cx="40" cy="40" />
                      <circle className="text-[#FF8A00]" strokeWidth="6" strokeDasharray={214} strokeDashoffset={214 - (214 * 72) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="34" cx="40" cy="40" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-white">72%</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-[10px] font-bold mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-[#FF8A00]">54 / 75 (72%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF8A00] rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-[#FF8A00] hover:bg-orange-500 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,138,0,0.3)] transition-all">
                    Resume Solving <Play size={12} className="fill-current" />
                  </button>
                  <button className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-2.5 text-xs font-bold transition-all">
                    View Sheet
                  </button>
                </div>
              </div>

              {/* 4️⃣ Quick Actions Grid */}
              <div className="xl:col-span-3">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-[#FF8A00]" />
                  <h3 className="font-bold text-sm text-white">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Layers, title: 'Explore Sheets', desc: '450+ curated sheets', color: 'text-blue-400' },
                    { icon: RotateCcw, title: 'Sync Platforms', desc: 'LeetCode, GFG & more', color: 'text-orange-400' },
                    { icon: BookOpen, title: 'My Notes', desc: 'Your personal notes', color: 'text-pink-400' },
                    { icon: FolderGit2, title: 'Projects', desc: 'Track and build projects', color: 'text-emerald-400' },
                    { icon: Bot, title: 'AI Mock Interview', desc: 'Practice & improve', color: 'text-cyan-400' },
                    { icon: Play, title: 'Resume Last Problem', desc: 'Binary Tree Inorder Traversal', color: 'text-green-400' },
                  ].map((action, i) => (
                    <div key={i} className={`${cardBg} border ${border} rounded-[16px] p-4 flex items-center justify-between cursor-pointer group hover:border-[#FF8A00]/30 hover:bg-white/[0.02] transition-all`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${action.color}`}>
                          <action.icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">{action.title}</p>
                          <p className="text-[10px] text-[#A1A1AA] mt-0.5">{action.desc}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-[#FF8A00] transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 3: Topic Analysis */}
            <div className={`${cardBg} border ${border} rounded-[24px] p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-[#FF8A00]" /> Topic Analysis
                </h3>
                <select className="bg-[#09090B] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#A1A1AA] outline-none focus:border-[#FF8A00]/50">
                  <option>This Month</option>
                  <option>All Time</option>
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { name: 'Arrays', val: 76, status: 'Strong', color: 'text-emerald-400', stroke: '#34d399' },
                  { name: 'Strings', val: 62, status: 'Moderate', color: 'text-amber-400', stroke: '#fbbf24' },
                  { name: 'Dynamic Programming', val: 48, status: 'Needs Work', color: 'text-[#FF8A00]', stroke: '#ff7a00' },
                  { name: 'Trees', val: 71, status: 'Strong', color: 'text-emerald-400', stroke: '#34d399' },
                  { name: 'Graphs', val: 39, status: 'Needs Work', color: 'text-rose-500', stroke: '#f43f5e' },
                ].map((topic, i) => (
                  <div key={i} className="bg-[#09090B] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center group hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">{topic.name}</span>
                      <span className="text-gray-600">...</span>
                    </div>
                    
                    <div className="relative w-16 h-16 mb-3">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-white/5" strokeWidth="4" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                        <circle className={topic.color} strokeWidth="4" strokeDasharray={176} strokeDashoffset={176 - (176 * topic.val) / 100} strokeLinecap="round" stroke={topic.stroke} fill="transparent" r="28" cx="32" cy="32" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[11px] font-black text-white">{topic.val}%</span>
                      </div>
                    </div>
                    
                    <span className={`text-[9px] font-bold ${topic.color}`}>{topic.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 4: Coding Activity Heatmap */}
            <div className={`${cardBg} border ${border} rounded-[24px] p-6 shadow-xl`}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity size={16} className="text-[#FF8A00]" />
                    <h3 className="font-bold text-sm text-white">Coding Activity</h3>
                    <span className="text-[10px] text-gray-500 ml-2">Keep the streak alive!</span>
                  </div>
                  {/* Reuse existing component, wrap to fit styling if needed */}
                  <div className="mt-4 opacity-90 hover:opacity-100 transition-opacity">
                    <ActivityHeatmap submissionCalendar="{}" theme="dark" />
                  </div>
                </div>

                <div className="flex md:flex-col gap-6 md:w-32 shrink-0">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Longest Streak</p>
                    <p className="text-xl font-black text-[#FF8A00]">284 <span className="text-[10px] font-bold">days</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Active Days</p>
                    <p className="text-xl font-black text-[#FF8A00]">186 <span className="text-[10px] font-bold">days</span></p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (1 Col) */}
          <div className="space-y-6">
            
            {/* 5️⃣ Upcoming Contests Panel */}
            <div className={`${cardBg} border ${border} rounded-[24px] p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Trophy size={16} className="text-[#FF8A00]" /> Upcoming Contests
                </h3>
                <span className="text-[10px] font-bold text-[#FF8A00] cursor-pointer hover:underline">View all</span>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Codeforces Round 945 (Div. 2)', time: 'Tomorrow, 8:00 PM', status: 'Registered', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                  { title: 'LeetCode Weekly Contest 402', time: 'Sunday, 8:00 AM', status: 'Active', badge: 'bg-[#FF8A00]/10 text-[#FF8A00] border-[#FF8A00]/20' },
                  { title: 'AtCoder Beginner Contest 356', time: 'Saturday, 9:30 AM', status: 'Upcoming', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                ].map((c, i) => (
                  <div key={i} className="group">
                    <h4 className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors mb-1">{c.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">{c.time}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${c.badge}`}>
                        {c.status}
                      </span>
                    </div>
                    {i !== 2 && <div className="h-px bg-white/5 w-full mt-4" />}
                  </div>
                ))}
              </div>

              <button className="w-full mt-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                View Calendar <Calendar size={14} />
              </button>
            </div>

            {/* 6️⃣ Portfolio Analytics */}
            <div className={`${cardBg} border ${border} rounded-[24px] p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm text-white">Portfolio Analytics</h3>
                <select className="bg-transparent border-none text-[10px] text-gray-500 font-bold outline-none cursor-pointer">
                  <option>This month</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Profile Views</span>
                  <span className="text-xs font-bold text-[#FF8A00]">1,284</span>
                </div>
                <div className="h-px bg-white/5 w-full" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Resume Downloads</span>
                  <span className="text-xs font-bold text-[#FF8A00]">42</span>
                </div>
                <div className="h-px bg-white/5 w-full" />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Global Skill Score</span>
                    <span className="text-xs font-bold text-[#FF8A00]">92 / 100</span>
                  </div>
                  <div className="h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-orange-600 to-[#FF8A00] rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 9️⃣ Chrome Extension Card */}
            <div className={`border border-[#FF8A00]/20 bg-gradient-to-br from-[#101014] to-[#1a130c] p-6 rounded-[24px] shadow-2xl relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A00]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FF8A00]/20 transition-colors" />
              
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-[#FF8A00] flex items-center justify-center shadow-[0_0_15px_rgba(255,138,0,0.4)]">
                  <MonitorSmartphone size={16} className="text-white" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Codeyx Chrome Extension</h4>
              </div>
              
              <p className="text-[11px] text-gray-400 leading-relaxed mb-5 relative z-10">
                Sync submissions instantly. Install the extension to auto-track LeetCode & Codeforces.
              </p>
              
              <button className="w-full bg-[#FF8A00] hover:bg-orange-500 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,138,0,0.3)] transition-all relative z-10">
                Install Extension <MonitorSmartphone size={12} />
              </button>
            </div>

            {/* 🔟 Leaderboard Preview */}
            <div className={`${cardBg} border ${border} rounded-[24px] p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm text-white">Leaderboard Preview</h3>
                <span className="text-[10px] font-bold text-[#FF8A00] cursor-pointer hover:underline">View all</span>
              </div>
              
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Aditya Verma', score: 1890, icon: '🌟' },
                  { rank: 2, name: `${userName} (You)`, score: 1680, icon: '🔥', me: true },
                  { rank: 3, name: 'Rishabh Singh', score: 1520, icon: '🥉' },
                ].map(u => (
                  <div key={u.rank} className={`flex items-center justify-between p-2 rounded-xl border ${u.me ? 'border-[#FF8A00]/30 bg-[#FF8A00]/5' : 'border-transparent hover:bg-white/5'} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black text-gray-500 w-4">{u.icon || `#${u.rank}`}</span>
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                        {u.name[0]}
                      </div>
                      <span className={`text-[11px] font-bold ${u.me ? 'text-white' : 'text-gray-300'}`}>{u.name}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#FF8A00]">{u.score}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
