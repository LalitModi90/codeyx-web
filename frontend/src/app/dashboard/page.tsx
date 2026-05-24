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
import { useSocket } from '../../hooks/useSocket';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { platformService } from '../../services/platform.service';

export default function CodeyxDashboard() {
  const [theme, setTheme] = useState('dark');
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const socket = useSocket();

  const userName = isLoaded && user?.firstName ? user.firstName : 'Lalit';
  const userImage = isLoaded && user?.imageUrl ? user.imageUrl : null;
  const userId = user?.id || 'demo-user-123'; // fallback for testing

  // Listen to Realtime Events
  React.useEffect(() => {
    if (socket) {
      socket.on('SYNC_COMPLETE', (data) => {
        console.log('Got live sync update for', data.platform);
        queryClient.invalidateQueries({ queryKey: ['platformStats'] });
      });
    }
    return () => {
      socket?.off('SYNC_COMPLETE');
    }
  }, [socket, queryClient]);

  // Fetch REAL LeetCode Stats
  const { data: leetcodeRes, isLoading: lcLoading } = useQuery({
    queryKey: ['platformStats', 'leetcode', userId],
    queryFn: () => platformService.getPlatformStats('leetcode', userId),
    enabled: !!userId,
  });

  // Fetch REAL GitHub Stats
  const { data: githubRes, isLoading: gitLoading } = useQuery({
    queryKey: ['platformStats', 'github', userId],
    queryFn: () => platformService.getPlatformStats('github', userId),
    enabled: !!userId,
  });

  // Fetch REAL Codechef Stats
  const { data: codechefRes, isLoading: ccLoading } = useQuery({
    queryKey: ['platformStats', 'codechef', userId],
    queryFn: () => platformService.getPlatformStats('codechef', userId),
    enabled: !!userId,
  });

  // Fixed data paths: interceptor returns response.data → ApiResponse → .data = PlatformStats
  const lcData = leetcodeRes?.data;
  const lcTotalSolved = lcData?.totalSolved || 0;
  const lcRating = lcData?.rating || 0;
  const lcEasy = lcData?.stats?.easy || 0;
  const lcMedium = lcData?.stats?.medium || 0;
  const lcHard = lcData?.stats?.hard || 0;
  const lcRank = lcData?.stats?.rank || 0;
  const lcCalendar = lcData?.stats?.raw?.matchedUser?.userCalendar?.submissionCalendar || '{}';

  const ghData = githubRes?.data;
  const ghRepos = ghData?.stats?.repos || 0;
  const ghStars = ghData?.stats?.totalStars || 0;
  const ghFollowers = ghData?.stats?.followers || 0;

  const ccData = codechefRes?.data;
  const ccRating = ccData?.rating || 0;
  const ccStars = ccData?.stats?.stars || 0;

  // Compute streak from LC calendar
  const calObj: Record<string, number> = (() => { try { return JSON.parse(lcCalendar); } catch { return {}; } })();
  const sortedDays = Object.keys(calObj).map(Number).sort((a, b) => b - a);
  let streak = 0;
  const today = Math.floor(Date.now() / 86400000);
  for (let i = 0; i < sortedDays.length; i++) {
    const dayDiff = today - Math.floor(sortedDays[i] / 86400);
    if (dayDiff === i || dayDiff === i + 1) streak++;
    else break;
  }
  const totalActiveDays = Object.values(calObj).filter(v => v > 0).length;

  // Skill score: weighted avg of available ratings
  const skillScore = lcRating || ccRating
    ? Math.min(100, Math.round(((lcRating || 0) * 0.5 + (ccRating || 0) * 0.5) / 20))
    : 0;

  // Topic breakdown from LC easy/medium/hard
  const totalLC = lcTotalSolved || 1;
  const topicData = lcTotalSolved > 0 ? [
    { name: 'Easy', val: Math.round((lcEasy / totalLC) * 100), color: 'text-emerald-400', stroke: '#34d399' },
    { name: 'Medium', val: Math.round((lcMedium / totalLC) * 100), color: 'text-amber-400', stroke: '#fbbf24' },
    { name: 'Hard', val: Math.round((lcHard / totalLC) * 100), color: 'text-rose-500', stroke: '#f43f5e' },
  ] : [];

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
                      {lcLoading ? <div className="h-6 w-16 bg-white/10 animate-pulse rounded mt-0.5" /> : (
                        <p className="text-xl font-black text-white mt-0.5">{streak} <span className="text-xs text-[#FF8A00] font-bold">days</span></p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="text-emerald-400" size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Problems Solved (LC)</p>
                      {lcLoading ? (
                        <div className="h-6 w-16 bg-white/10 animate-pulse rounded mt-0.5"></div>
                      ) : (
                        <p className="text-xl font-black text-white mt-0.5 text-emerald-400">
                          {lcTotalSolved.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <TrendingUp className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">LC Contest Rating</p>
                      {lcLoading ? (
                        <div className="h-6 w-16 bg-white/10 animate-pulse rounded mt-0.5"></div>
                      ) : (
                        <p className="text-xl font-black text-white mt-0.5 text-blue-400">
                          {lcRating.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2️⃣ Daily Checklist Card */}
              <div className={`${cardBg} border ${border} rounded-[24px] p-6 shadow-xl flex flex-col`}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-sm text-white">Daily Checklist</h3>
                  <span className="text-[10px] font-bold text-[#A1A1AA]">Coming soon</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center py-6 gap-3">
                  <CheckSquare size={28} className="text-white/10" />
                  <p className="text-xs text-gray-600 text-center">Your daily tasks will appear here.<br />Feature coming soon.</p>
                </div>
              </div>
            </div>

            {/* ROW 2: Continue Solving & Quick Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

              {/* 3️⃣ Continue Solving Section */}
              <div className={`xl:col-span-2 ${cardBg} border ${border} rounded-[24px] p-6 shadow-xl relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A00]/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2 mb-4">
                  <Play size={14} className="text-[#FF8A00]" /> Continue Solving
                </h3>
                <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3">
                  <Play size={28} className="text-white/10" />
                  <p className="text-xs text-gray-600 text-center">Start a sheet from<br /><span className="text-[#FF8A00]">Explore Sheets</span> to track progress here.</p>
                  <button className="mt-2 bg-[#FF8A00]/10 hover:bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/20 rounded-xl px-4 py-2 text-xs font-bold transition-all">
                    Browse Sheets
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
                    { icon: RotateCcw, title: 'Sync Platforms', desc: 'LeetCode, GFG & more', color: 'text-orange-400', action: 'sync' },
                    { icon: BookOpen, title: 'My Notes', desc: 'Your personal notes', color: 'text-pink-400' },
                    { icon: FolderGit2, title: 'Projects', desc: 'Track and build projects', color: 'text-emerald-400' },
                    { icon: Bot, title: 'AI Mock Interview', desc: 'Practice & improve', color: 'text-cyan-400' },
                    { icon: Play, title: 'Resume Last Problem', desc: 'Binary Tree Inorder Traversal', color: 'text-green-400' },
                  ].map((actionItem, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        if (actionItem.action === 'sync') {
                          platformService.syncPlatform('leetcode', userId, user?.username || '');
                          platformService.syncPlatform('github', userId, user?.username || '');
                          platformService.syncPlatform('codechef', userId, user?.username || '');
                        }
                      }}
                      className={`${cardBg} border ${border} rounded-[16px] p-4 flex items-center justify-between cursor-pointer group hover:border-[#FF8A00]/30 hover:bg-white/[0.02] transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${actionItem.color}`}>
                          <actionItem.icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">{actionItem.title}</p>
                          <p className="text-[10px] text-[#A1A1AA] mt-0.5">{actionItem.desc}</p>
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
                <select aria-label="Topic Analysis time range" className="bg-[#09090B] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#A1A1AA] outline-none focus:border-[#FF8A00]/50">
                  <option>This Month</option>
                  <option>All Time</option>
                </select>
              </div>

              {lcLoading ? (
                <div className="flex gap-4">{[1, 2, 3].map(i => <div key={i} className="flex-1 h-28 bg-white/5 animate-pulse rounded-2xl" />)}</div>
              ) : topicData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">Sync LeetCode to see topic breakdown</div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {topicData.map((topic, i) => (
                    <div key={i} className="bg-[#09090B] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-400 mb-3">{topic.name}</span>
                      <div className="relative w-16 h-16 mb-3">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle className="text-white/5" strokeWidth="4" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                          <circle strokeWidth="4" strokeDasharray={176} strokeDashoffset={176 - (176 * topic.val) / 100} strokeLinecap="round" stroke={topic.stroke} fill="transparent" r="28" cx="32" cy="32" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[11px] font-black text-white">{topic.val}%</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold ${topic.color}`}>{lcTotalSolved > 0 ? `${i === 0 ? lcEasy : i === 1 ? lcMedium : lcHard} solved` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
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
                    <ActivityHeatmap submissionCalendar={lcCalendar} theme="dark" />
                  </div>
                </div>

                <div className="flex md:flex-col gap-6 md:w-32 shrink-0">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Longest Streak</p>
                    <p className="text-xl font-black text-[#FF8A00]">{lcLoading ? '—' : streak} <span className="text-[10px] font-bold">days</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Active Days</p>
                    <p className="text-xl font-black text-[#FF8A00]">{lcLoading ? '—' : totalActiveDays} <span className="text-[10px] font-bold">days</span></p>
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
                <select aria-label="Portfolio Analytics time range" className="bg-transparent border-none text-[10px] text-gray-500 font-bold outline-none cursor-pointer">
                  <option>This month</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">CodeChef Rating</span>
                  {ccLoading ? (
                    <div className="h-4 w-12 bg-white/10 animate-pulse rounded"></div>
                  ) : (
                    <span className="text-xs font-bold text-[#FF8A00]">{ccRating > 0 ? ccRating : '—'}</span>
                  )}
                </div>
                <div className="h-px bg-white/5 w-full" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">GitHub Stars</span>
                  {gitLoading ? (
                    <div className="h-4 w-12 bg-white/10 animate-pulse rounded"></div>
                  ) : (
                    <span className="text-xs font-bold text-[#FF8A00]">{ghStars}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">GitHub Repos</span>
                  {gitLoading ? <div className="h-4 w-12 bg-white/10 animate-pulse rounded" /> : <span className="text-xs font-bold text-[#FF8A00]">{ghRepos}</span>}
                </div>
                <div className="h-px bg-white/5 w-full" />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Skill Score</span>
                    <span className="text-xs font-bold text-[#FF8A00]">{skillScore > 0 ? `${skillScore} / 100` : 'Sync to calculate'}</span>
                  </div>
                  <div className="h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-orange-600 to-[#FF8A00] rounded-full" style={{ width: `${skillScore}%` }} />
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
                <a href="/leaderboard" className="text-[10px] font-bold text-[#FF8A00] cursor-pointer hover:underline">View all</a>
              </div>
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Trophy size={28} className="text-white/10" />
                <p className="text-xs text-gray-600 text-center">Leaderboard loads after syncing<br />your platforms.</p>
                <a href="/leaderboard" className="mt-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold transition-all">View Full Leaderboard</a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
