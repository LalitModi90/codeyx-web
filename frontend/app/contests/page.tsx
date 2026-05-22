"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Calendar, PlayCircle, History, User, Bookmark, 
  Search, ChevronDown, CheckSquare, Settings, ArrowRight,
  MonitorPlay, Code2, Shield, CalendarDays, Users, LayoutList,
  Filter, Star, TrendingUp, Clock, Plus, CalendarPlus, BellRing, Lock
} from 'lucide-react';
import TopNavbar from '@/components/shared/TopNavbar';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export default function ContestsPage() {
  const [activeTab, setActiveTab] = useState('All Contests');
  const [openCalendarId, setOpenCalendarId] = useState<number | null>(null);
  const [isCalendarView, setIsCalendarView] = useState(false);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Starts at May 2026

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const [contestsList, setContestsList] = useState([
    { name: 'Codeforces Round 954 (Div. 2)', plat: 'Codeforces', type: 'Rated', diff: 'Medium', diffColor: 'text-[#FF8A00]', part: '12.4K', date: '12 May, 2024', time: '17:35', iconColor: 'text-blue-500', status: 'Past', isBookmarked: true, isMyContest: true },
    { name: 'LeetCode Biweekly Contest 120', plat: 'LeetCode', type: 'Rated', diff: 'Easy', diffColor: 'text-emerald-400', part: '23.8K', date: '11 May, 2024', time: '20:30', iconColor: 'text-yellow-500', status: 'Past', isBookmarked: false, isMyContest: false },
    { name: 'AtCoder Beginner Contest 344', plat: 'AtCoder', type: 'Rated', diff: 'Easy', diffColor: 'text-emerald-400', part: '8.7K', date: '11 May, 2024', time: '14:00', iconColor: 'text-gray-300', status: 'Upcoming', isBookmarked: false, isMyContest: false },
    { name: 'CodeChef Starters 163', plat: 'CodeChef', type: 'Rated', diff: 'Medium', diffColor: 'text-[#FF8A00]', part: '15.2K', date: '10 May, 2024', time: '13:00', iconColor: 'text-[#FF8A00]', status: 'Live', isBookmarked: true, isMyContest: true },
    { name: 'Google Kickstart Round C', plat: 'Google', type: 'Rated', diff: 'Hard', diffColor: 'text-red-500', part: '45.1K', date: '15 Jun, 2024', time: '18:00', iconColor: 'text-blue-400', status: 'Upcoming', isBookmarked: true, isMyContest: false }
  ]);

  const filteredContests = contestsList.filter(contest => {
    if (activeTab === 'All Contests') return true;
    if (activeTab === 'Upcoming') return contest.status === 'Upcoming';
    if (activeTab === 'Live Contests' || activeTab === 'Live') return contest.status === 'Live';
    if (activeTab === 'Past Contests' || activeTab === 'Past') return contest.status === 'Past';
    if (activeTab === 'My Contests') return contest.isMyContest;
    if (activeTab === 'Bookmarked') return contest.isBookmarked;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050816] font-sans selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />
      
      {/* Abstract Glowing Backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-900/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-[#FF8A00]/5 blur-[120px]" />
      </div>

      <main className="max-w-[1600px] mx-auto px-6 pt-8 grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT SIDEBAR (xl:col-span-2) */}
        {!isCalendarView && (
        <aside className="xl:col-span-2 flex flex-col gap-6 sticky top-24 h-fit hidden xl:flex">
          
          {/* Contests Navigation */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-2">Contests</span>
            {[
              { id: 'All Contests', icon: Trophy, isPrivate: false },
              { id: 'Upcoming', icon: CalendarDays, isPrivate: false },
              { id: 'Live Contests', icon: PlayCircle, isPrivate: false },
              { id: 'Past Contests', icon: History, isPrivate: false },
              { id: 'My Contests', icon: User, isPrivate: true },
              { id: 'Bookmarked', icon: Bookmark, isPrivate: true },
            ].map(tab => (
              <React.Fragment key={tab.id}>
                <SignedIn>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all relative group ${
                      activeTab === tab.id 
                        ? 'text-[#FF8A00] bg-[#FF8A00]/10 border border-[#FF8A00]/20 shadow-[0_0_15px_rgba(255,138,0,0.1)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <tab.icon size={16} className={activeTab === tab.id ? 'text-[#FF8A00]' : 'text-gray-500'} strokeWidth={2.5} />
                    <span className="relative z-10">{tab.id}</span>
                    {activeTab === tab.id && (
                      <motion.div layoutId="contestsTabIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-[#FF8A00] rounded-r shadow-[0_0_10px_#FF8A00]" />
                    )}
                  </button>
                </SignedIn>
                <SignedOut>
                  {tab.isPrivate ? (
                    <Link href="/login">
                      <button className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all relative group text-gray-600 hover:text-gray-400 hover:bg-white/[0.02] border border-transparent cursor-pointer">
                        <div className="flex items-center gap-3">
                          <tab.icon size={16} className="text-gray-600" strokeWidth={2.5} />
                          <span>{tab.id}</span>
                        </div>
                        <Lock size={14} className="text-gray-600 group-hover:text-gray-400" />
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all relative group ${
                        activeTab === tab.id 
                          ? 'text-[#FF8A00] bg-[#FF8A00]/10 border border-[#FF8A00]/20 shadow-[0_0_15px_rgba(255,138,0,0.1)]'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <tab.icon size={16} className={activeTab === tab.id ? 'text-[#FF8A00]' : 'text-gray-500'} strokeWidth={2.5} />
                      <span className="relative z-10">{tab.id}</span>
                      {activeTab === tab.id && (
                        <motion.div layoutId="contestsTabIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-[#FF8A00] rounded-r shadow-[0_0_10px_#FF8A00]" />
                      )}
                    </button>
                  )}
                </SignedOut>
              </React.Fragment>
            ))}
          </div>

          {/* Contest Stats */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-2">Contest Stats</span>
            <SignedIn>
              <div className="bg-[#101014] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                {[
                  { label: 'Contests Participated', value: '42' },
                  { label: 'Global Rank', value: '# 2,345', highlight: true },
                  { label: 'Rating', value: '1854', highlightGreen: true },
                  { label: 'Highest Rating', value: '1967' },
                  { label: 'Problems Solved', value: '612' }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">{stat.label}</span>
                    <span className={`text-xs font-black ${stat.highlight ? 'text-[#FF8A00]' : stat.highlightGreen ? 'text-emerald-400' : 'text-white'}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </SignedIn>
            <SignedOut>
              <Link href="/login">
                <div className="bg-[#101014] border border-white/5 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors group text-center">
                  <Lock size={20} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-gray-400">Login to view your stats</span>
                </div>
              </Link>
            </SignedOut>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-2">Filters</span>
            <div className="bg-[#101014] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
              {[
                { label: 'Contest Type', value: 'All' },
                { label: 'Difficulty', value: 'All' },
                { label: 'Platform', value: 'All' }
              ].map((filter, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all">
                  <span className="text-xs font-bold text-gray-400">{filter.label}</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    {filter.value} <ChevronDown size={12} className="text-gray-500" />
                  </div>
                </div>
              ))}
              
              <SignedIn>
                <label className="flex items-center gap-2 cursor-pointer mt-2 group">
                  <div className="w-4 h-4 rounded bg-white/5 border border-white/20 flex items-center justify-center group-hover:border-[#FF8A00] transition-colors">
                  </div>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">Show Bookmarked Only</span>
                </label>
              </SignedIn>
              <SignedOut>
                <Link href="/login">
                  <label className="flex items-center justify-between cursor-pointer mt-2 group opacity-50 hover:opacity-100">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-white/5 border border-white/20 flex items-center justify-center transition-colors">
                      </div>
                      <span className="text-xs font-bold text-gray-500 transition-colors">Show Bookmarked Only</span>
                    </div>
                    <Lock size={12} className="text-gray-500" />
                  </label>
                </Link>
              </SignedOut>
            </div>
          </div>

          {/* Contest Calendar Action Card */}
          <div className="mt-2 bg-gradient-to-br from-[#FF8A00]/10 to-transparent border border-[#FF8A00]/20 rounded-2xl p-4 shadow-[0_10px_30px_rgba(255,138,0,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8A00]/10 rounded-full blur-[40px] group-hover:bg-[#FF8A00]/20 transition-all" />
            <div className="flex items-center justify-between mb-2 relative z-10">
              <h4 className="text-sm font-black text-white">Contest Calendar</h4>
              <Calendar size={16} className="text-[#FF8A00]" />
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mb-4 relative z-10 leading-relaxed">
              Never miss a contest. View all upcoming contests in calendar.
            </p>
            <button onClick={() => setIsCalendarView(true)} className="w-full py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black text-xs font-black shadow-[0_0_15px_rgba(255,138,0,0.4)] transition-all relative z-10 flex items-center justify-center gap-2">
              View Calendar <CalendarDays size={14} />
            </button>
          </div>
        </aside>
        )}

        {/* MAIN CONTENT AREA */}
        <div className={`${isCalendarView ? 'xl:col-span-12' : 'xl:col-span-10'} min-w-0 flex flex-col gap-8`}>
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                Contests <Trophy size={28} className="text-[#FF8A00]" />
              </h1>
              <p className="text-sm font-semibold text-gray-400">
                Compete, challenge and improve your problem solving skills.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => setIsCalendarView(!isCalendarView)} className="flex items-center gap-2 bg-[#101014] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 transition-all">
                {isCalendarView ? <LayoutList size={16} /> : <CalendarDays size={16} />} {isCalendarView ? 'List View' : 'Calendar View'}
              </button>
            </div>
          </div>

          {isCalendarView ? (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start animate-in fade-in zoom-in-95 duration-300">
              {/* Left List */}
              <div className="xl:col-span-1 bg-[#101014] border border-white/5 rounded-2xl p-4 flex flex-col">
                <h3 className="text-lg font-black text-white mb-2">Upcoming Contests</h3>
                <p className="text-xs text-gray-500 mb-6">Don't miss scheduled events</p>
                
                <div className="flex flex-col gap-6">
                  {[1, 2, 3, 4, 5].map((sectionIndex) => (
                    <div key={sectionIndex} className="flex flex-col gap-6">
                      <div>
                        <div className="text-xs font-bold text-gray-400 mb-3">5/{23 + sectionIndex}/2026</div>
                        <div className="bg-[#18181f] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                             <div className="w-2 h-2 rounded-full bg-[#FF8A00]" /> {23 + sectionIndex}-05-2026 12:00 AM
                          </div>
                          <div className="text-sm font-black text-white flex items-center gap-2">
                            <Trophy size={14} /> Weekend Dev Challenge
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline cursor-pointer mt-1">
                            <CalendarPlus size={12} /> Add to Calendar
                          </div>
                        </div>
                        
                        <div className="bg-[#18181f] border border-white/5 rounded-xl p-3 flex flex-col gap-2 mt-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                             <div className="w-2 h-2 rounded-full bg-[#FF8A00]" /> {23 + sectionIndex}-05-2026 8:00 PM
                          </div>
                          <div className="text-sm font-black text-white flex items-center gap-2">
                            <TrendingUp size={14} className="text-blue-500" /> Biweekly Contest 183
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline cursor-pointer mt-1">
                            <CalendarPlus size={12} /> Add to Calendar
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs font-bold text-gray-400 mb-3">5/{24 + sectionIndex}/2026</div>
                        <div className="bg-[#18181f] border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                             <div className="w-2 h-2 rounded-full bg-[#FF8A00]" /> {24 + sectionIndex}-05-2026 8:00 AM
                          </div>
                          <div className="text-sm font-black text-white flex items-center gap-2">
                            <TrendingUp size={14} className="text-yellow-500" /> Weekly Contest 503
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline cursor-pointer mt-1">
                            <CalendarPlus size={12} /> Add to Calendar
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right Grid */}
              <div className="xl:col-span-3 sticky top-24 bg-[#101014] border border-white/5 rounded-2xl flex flex-col overflow-hidden h-[700px]">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-black text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"><ChevronDown className="rotate-90" size={16}/></button>
                    <button onClick={handleNextMonth} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"><ChevronDown className="-rotate-90" size={16}/></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 border-b border-white/5 bg-black/20 text-center text-xs font-bold text-gray-500 py-3">
                  <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                
                <div className="flex-1 grid grid-cols-7 grid-rows-5">
                  {Array.from({ length: 35 }).map((_, i) => {
                     const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
                     const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                     const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
                     
                     const dayNum = i - firstDayOfMonth + 1; 
                     const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                     const displayNum = isCurrentMonth ? dayNum : (dayNum <= 0 ? daysInPrevMonth + dayNum : dayNum - daysInMonth);
                     
                     const isMay2026 = currentDate.getMonth() === 4 && currentDate.getFullYear() === 2026;
                     
                     return (
                       <div key={i} className={`border-r border-b border-white/5 p-1.5 flex flex-col gap-1 min-h-0 overflow-hidden ${!isCurrentMonth ? 'opacity-30' : ''} ${dayNum === 21 && isMay2026 ? 'bg-blue-900/20' : 'hover:bg-white/[0.02]'}`}>
                         <div className="text-right text-[10px] font-bold text-gray-400 mb-1">{displayNum}</div>
                         
                         {isMay2026 && dayNum === 4 && (
                           <div className="px-1.5 py-1 bg-white/5 rounded text-[9px] font-bold text-white truncate flex items-center gap-1">
                             <TrendingUp size={10} className="text-gray-400" /> Monday Munch
                           </div>
                         )}
                         {isMay2026 && dayNum === 5 && (
                           <div className="px-1.5 py-1 bg-white/5 rounded text-[9px] font-bold text-white truncate flex items-center gap-1">
                             <Trophy size={10} className="text-gray-400" /> Next DP Contest
                           </div>
                         )}
                         {isMay2026 && dayNum === 6 && (
                           <>
                             <div className="px-1.5 py-1 bg-blue-500/10 text-blue-400 rounded text-[9px] font-bold truncate flex items-center gap-1">
                               <TrendingUp size={10} /> Codeforces Round 955
                             </div>
                             <div className="px-1.5 py-1 bg-[#FF8A00]/10 text-[#FF8A00] rounded text-[9px] font-bold truncate flex items-center gap-1">
                               <Trophy size={10} /> Starters 237
                             </div>
                           </>
                         )}
                         {isMay2026 && dayNum === 20 && (
                           <div className="px-1.5 py-1 bg-[#FF8A00]/10 text-[#FF8A00] rounded text-[9px] font-bold truncate flex items-center gap-1">
                             <Trophy size={10} /> Starters 239
                           </div>
                         )}
                         {isMay2026 && dayNum === 21 && (
                           <div className="px-1.5 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded text-[9px] font-bold truncate flex items-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                             <TrendingUp size={10} /> Codeforces Round 956
                           </div>
                         )}
                         {isMay2026 && dayNum === 23 && (
                           <>
                             <div className="px-1.5 py-1 bg-white/5 rounded text-[9px] font-bold text-white truncate flex items-center gap-1">
                               <Trophy size={10} className="text-gray-400" /> Weekend Dev
                             </div>
                             <div className="px-1.5 py-1 bg-blue-500/10 text-blue-400 rounded text-[9px] font-bold truncate flex items-center gap-1">
                               <TrendingUp size={10} /> Spectral Cup 2026
                             </div>
                           </>
                         )}
                       </div>
                     );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
          {/* Top Tabs */}
          <div className="flex items-center gap-6 border-b border-white/10 pb-px">
            {['All Contests', 'Upcoming', 'Live', 'Past'].map((tab) => {
              // Map Top Tabs to corresponding sidebar tab states
              const tabIdMap: Record<string, string> = {
                'All Contests': 'All Contests',
                'Upcoming': 'Upcoming',
                'Live': 'Live Contests',
                'Past': 'Past Contests'
              };
              const isActive = activeTab === tabIdMap[tab] || activeTab === tab;
              return (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tabIdMap[tab] || tab)}
                  className={`text-sm font-bold pb-3 relative transition-colors ${isActive ? 'text-[#FF8A00]' : 'text-gray-400 hover:text-white'}`}
                >
                  {tab}
                  {isActive && (
                    <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#FF8A00] shadow-[0_0_10px_#FF8A00]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Upcoming', value: '12', sub: 'Contests', icon: CalendarDays, color: '#a855f7', bg: 'bg-purple-500/10' },
              { label: 'Live Now', value: '3', sub: 'Contests', icon: PlayCircle, color: '#22c55e', bg: 'bg-emerald-500/10' },
              { label: 'Participated', value: '42', sub: 'Contests', icon: TrendingUp, color: '#FF8A00', bg: 'bg-orange-500/10' },
              { label: 'Current Rating', value: '1854', sub: 'Global Rank #2,345', icon: Star, color: '#3b82f6', bg: 'bg-blue-500/10' },
              { label: 'Highest Rating', value: '1967', sub: 'Achieved on 12 Feb 2024', icon: Trophy, color: '#d946ef', bg: 'bg-fuchsia-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#101014]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-all shadow-xl">
                <div className={`w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center ${stat.bg} border border-white/5`} style={{ color: stat.color, boxShadow: `0 0 20px ${stat.color}20` }}>
                  <stat.icon size={20} />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <div className="text-2xl font-black text-white leading-none mb-1">{stat.value}</div>
                  <div className="text-[10px] font-extrabold text-gray-300 uppercase tracking-widest truncate">{stat.label}</div>
                  <div className="text-[9px] font-bold text-gray-500 truncate mt-0.5">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {activeTab === 'All Contests' && (
            <>
          {/* Featured Grid Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Live Now Card */}
            <div className="xl:col-span-2 relative bg-[#101014] border border-[#FF8A00]/20 rounded-2xl p-6 overflow-hidden shadow-[0_10px_30px_rgba(255,138,0,0.05)]">
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-[#FF8A00]/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Live Now 
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] uppercase tracking-widest rounded ml-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" /> LIVE
                  </span>
                </h3>
              </div>

              <div className="flex flex-col gap-5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#18181f] rounded-xl flex items-center justify-center border border-[#FF8A00]/20 shadow-xl overflow-hidden shrink-0">
                    <Code2 size={32} className="text-[#FF8A00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-black text-white truncate">CodeChef Starters 164 <CheckSquare size={16} className="inline text-blue-400 ml-1" /></h2>
                      <Bookmark size={20} className="text-[#FF8A00] shrink-0 cursor-pointer hover:fill-[#FF8A00] transition-colors" />
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm font-bold text-gray-400">CodeChef</span>
                      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Users size={14} /> 12.5K</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                    <MonitorPlay size={16} className="text-gray-500" /> Started 00:30:15 ago
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#FF8A00]">
                    <Clock size={16} /> Ends in 01:29:45
                  </div>
                  <div className="flex-1" />
                  <SignedIn>
                    <button className="px-8 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-black text-sm font-black shadow-[0_0_20px_rgba(255,138,0,0.3)] transition-all">
                      Participate
                    </button>
                  </SignedIn>
                  <SignedOut>
                    <Link href="/login">
                      <button className="px-8 py-2.5 rounded-xl bg-[#101014] border border-white/10 hover:border-white/20 text-gray-400 text-sm font-black transition-all">
                        Login to Participate
                      </button>
                    </Link>
                  </SignedOut>
                </div>

                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1.5 bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00] text-xs font-bold rounded-lg">33 Problems</span>
                  <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold rounded-lg">100 Points</span>
                  <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold rounded-lg">Rated</span>
                  <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold rounded-lg">Div. 2 -</span>
                  <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-bold rounded-lg">Virtual</span>
                  <div className="flex-1" />
                  <Bookmark size={18} className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Upcoming Contests List */}
            <div className="xl:col-span-1 bg-[#101014] border border-white/5 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white">Upcoming Contests</h3>
                <span className="text-xs font-bold text-[#FF8A00] cursor-pointer hover:underline">View All</span>
              </div>
              
              <div className="flex flex-col gap-4 flex-1 justify-between">
                {[
                  { name: 'Codeforces Round 955 (Div. 2)', plat: 'Codeforces', date: '18 May, 2024', time: '17:35', iconColor: 'text-blue-500' },
                  { name: 'LeetCode Weekly Contest 386', plat: 'LeetCode', date: '19 May, 2024', time: '20:30', iconColor: 'text-yellow-500' },
                  { name: 'AtCoder Beginner Contest 345', plat: 'AtCoder', date: '20 May, 2024', time: '14:00', iconColor: 'text-gray-300' }
                ].map((contest, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                    <div className="w-10 h-10 rounded-lg bg-[#18181f] flex items-center justify-center border border-white/10 shrink-0">
                      <TrendingUp size={20} className={contest.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{contest.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-semibold text-gray-400">{contest.plat}</span>
                        <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1"><CalendarDays size={10}/> {contest.date}</span>
                        <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1"><Clock size={10}/> {contest.time}</span>
                      </div>
                    </div>
                    <SignedIn>
                      <button className="px-4 py-1.5 rounded-lg bg-[#FF8A00]/10 hover:bg-[#FF8A00]/20 border border-[#FF8A00]/20 text-[#FF8A00] text-xs font-bold transition-all shrink-0">
                        Register
                      </button>
                    </SignedIn>
                    <SignedOut>
                      <Link href="/login">
                        <button className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-xs font-bold transition-all shrink-0">
                          Login
                        </button>
                      </Link>
                    </SignedOut>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 text-center">
                 <button className="text-xs font-bold text-[#FF8A00] hover:text-[#FF8A00]/80 flex items-center justify-center gap-2 w-full transition-colors">
                    View All Upcoming Contests <ArrowRight size={14} />
                 </button>
              </div>
            </div>
          </div>
          </>
          )}

          {/* All Contests Table Area */}
          <div className="bg-[#101014] border border-white/5 rounded-2xl flex flex-col mt-4">
            {/* Table Controls */}
            <div className="p-4 border-b border-white/10 flex flex-wrap items-center gap-4 justify-between bg-black/20 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-black text-white">{activeTab === 'All Contests' || activeTab === 'Upcoming' || activeTab === 'Live' || activeTab === 'Past' ? activeTab : activeTab}</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-bold text-gray-400">{filteredContests.length}</span>
                <div className="relative ml-2">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" placeholder="Search contests..." className="w-64 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {['All Platforms', 'All Types', 'All Difficulty'].map((filter, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 cursor-pointer hover:border-white/20 transition-all text-xs font-bold text-gray-300">
                    {filter} <ChevronDown size={12} className="text-gray-500" />
                  </div>
                ))}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 cursor-pointer hover:border-white/20 transition-all text-xs font-bold text-gray-300 ml-2">
                  <Filter size={12} className="text-[#FF8A00]" /> Sort By: Newest <ChevronDown size={12} className="text-gray-500" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Contest Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Platform</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Difficulty</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Participants</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Start Time</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredContests.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp size={16} className={row.iconColor} />
                          <span className="text-sm font-bold text-white group-hover:text-[#FF8A00] transition-colors cursor-pointer">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${row.plat === 'Codeforces' ? 'bg-blue-500' : row.plat === 'LeetCode' ? 'bg-yellow-500' : row.plat === 'AtCoder' ? 'bg-gray-400' : 'bg-[#FF8A00]'}`} />
                           <span className="text-xs font-bold text-gray-300">{row.plat}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-gray-400">{row.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${row.diffColor}`}>{row.diff}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-gray-300">{row.part}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-300">{row.date}</span>
                          <span className="text-[10px] font-semibold text-gray-500">{row.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all">
                            View
                          </button>
                          
                          <div className="relative">
                            <SignedIn>
                              <button 
                                onClick={() => setOpenCalendarId(openCalendarId === i ? null : i)}
                                className={`p-1.5 rounded-lg border transition-all ${openCalendarId === i ? 'bg-[#FF8A00]/10 border-[#FF8A00]/30 text-[#FF8A00]' : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}
                                title="Set Reminder / Add to Calendar"
                              >
                                <CalendarPlus size={16} />
                              </button>
                              
                              {openCalendarId === i && (
                                <div className="absolute right-0 bottom-[120%] mb-2 w-48 bg-[#18181f] border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 origin-bottom-right animate-in fade-in slide-in-from-bottom-2">
                                  <div className="text-[10px] font-bold text-gray-500 px-2 py-1 uppercase tracking-wider border-b border-white/5 mb-1 text-left">Add Reminder</div>
                                  <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg text-xs font-semibold text-gray-300 transition-colors w-full text-left">
                                    <Calendar size={12} className="text-blue-400" /> Google Calendar
                                  </button>
                                  <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg text-xs font-semibold text-gray-300 transition-colors w-full text-left">
                                    <Calendar size={12} className="text-gray-200" /> Apple Calendar
                                  </button>
                                  <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg text-xs font-semibold text-gray-300 transition-colors w-full text-left">
                                    <Calendar size={12} className="text-blue-500" /> Microsoft Calendar
                                  </button>
                                  <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#FF8A00]/10 rounded-lg text-xs font-semibold text-[#FF8A00] transition-colors w-full text-left border-t border-white/5 mt-1 pt-2">
                                    <BellRing size={12} /> App Notification
                                  </button>
                                </div>
                              )}
                            </SignedIn>
                            <SignedOut>
                              <Link href="/login">
                                <button 
                                  className="p-1.5 rounded-lg border border-transparent bg-transparent text-gray-500 hover:text-[#FF8A00] hover:bg-[#FF8A00]/10 transition-all"
                                  title="Login to Set Reminder"
                                >
                                  <CalendarPlus size={16} />
                                </button>
                              </Link>
                            </SignedOut>
                          </div>

                          <SignedIn>
                            <Bookmark size={16} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
                          </SignedIn>
                          <SignedOut>
                            <Link href="/login">
                              <Bookmark size={16} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
                            </Link>
                          </SignedOut>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}

        </div>
      </main>
    </div>
  );
}
