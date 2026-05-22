"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Globe, Calendar, CalendarDays, Flag, User,
  Users, Building2, ChevronDown, CheckSquare, Settings, ArrowRight,
  TrendingUp, Code2, Flame, Award, Medal, Crown, Star,
  Search, Shield, Activity, BarChart3, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import TopNavbar from '@/components/shared/TopNavbar';

export default function LeaderboardPage() {
  const [activeLeaderboard, setActiveLeaderboard] = useState('Global Leaderboard');
  const [activeSubTab, setActiveSubTab] = useState('Global');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const baseDataArray = [
    { user: 'aryan_singh', rating: 2845, problems: 5342, contests: 156, winRate: 68.2, isVerified: true },
    { user: 'code_wizard', rating: 2791, problems: 4987, contests: 142, winRate: 64.8, isVerified: false },
    { user: 'algorithm_king', rating: 2743, problems: 4765, contests: 138, winRate: 63.1, isVerified: true },
    { user: 'its_me_sam', rating: 2689, problems: 4321, contests: 126, winRate: 61.9, isVerified: true },
    { user: 'the_debugger', rating: 2632, problems: 4105, contests: 118, winRate: 59.3, isVerified: true },
    { user: 'array_master', rating: 2598, problems: 3912, contests: 111, winRate: 57.7, isVerified: false },
    { user: 'code_banker', rating: 2567, problems: 3765, contests: 104, winRate: 55.8, isVerified: true },
    { user: 'logic_lord', rating: 2531, problems: 3542, contests: 98, winRate: 54.1, isVerified: true },
    { user: 'binary_beast', rating: 2498, problems: 3421, contests: 95, winRate: 52.6, isVerified: false },
    { user: 'machine_hack', rating: 2467, problems: 3210, contests: 91, winRate: 50.3, isVerified: true },
  ];

  // Generate 100 users for pagination
  const baseData = Array.from({ length: 100 }).map((_, i) => {
    const template = baseDataArray[i % 10];
    // Slightly decrease stats to make rank ordering realistic
    return {
      user: i < 10 ? template.user : `${template.user}_${i}`,
      rating: template.rating - (i * 5),
      problems: template.problems - (i * 10),
      contests: template.contests - i,
      winRate: (template.winRate - (i * 0.1)).toFixed(1),
      isVerified: template.isVerified,
    };
  });

  // Derive data based on active sections to simulate changing data
  const getDisplayData = () => {
    let data = [...baseData];
    
    // Simulate Left Sidebar changes
    if (activeLeaderboard === 'Monthly Leaderboard') data = [...data.slice(2), ...data.slice(0, 2)];
    if (activeLeaderboard === 'Weekly Leaderboard') data = [...data.slice(4), ...data.slice(0, 4)];
    if (activeLeaderboard === 'Contest Leaderboard') data = [...data.slice(6), ...data.slice(0, 6)];
    if (activeLeaderboard === 'University Leaderboard') data = data.filter((_, i) => i % 2 !== 0);
    if (activeLeaderboard === 'Friends Leaderboard') data = data.filter((_, i) => i % 3 === 0);

    // Simulate Top Tab changes
    if (activeSubTab === 'Country') data.reverse();
    if (activeSubTab === 'University') data = [...data.slice(1), data[0]];
    if (activeSubTab === 'Friends') data = data.filter((_, i) => i % 2 === 0);

    // Re-assign ranks and badges to make it look realistic for the new #1, #2, #3
    const rankedData = data.map((item, index) => {
      const rank = index + 1;
      let badge = 'shield';
      let badgeColor = 'text-blue-500';
      
      if (rank === 1) { badge = 'crown'; badgeColor = 'text-yellow-500'; }
      else if (rank === 2) { badge = 'crown'; badgeColor = 'text-purple-500'; }
      else if (rank === 3) { badge = 'crown'; badgeColor = 'text-[#FF8A00]'; }
      else if (rank <= 6) { badge = 'diamond'; badgeColor = 'text-emerald-500'; }

      return { 
        ...item, 
        rank, 
        badge, 
        badgeColor,
        rating: item.rating.toString(),
        problems: item.problems.toLocaleString(),
        contests: item.contests.toString(),
        winRate: `${item.winRate}%`
      };
    });
    
    return rankedData;
  };

  const fullData = getDisplayData();
  const topUser = fullData[0] || baseData[0];
  
  // Pagination Logic
  const totalPages = Math.ceil(fullData.length / rowsPerPage);
  const displayData = fullData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleTabChange = (tabId: string) => {
    setActiveLeaderboard(tabId);
    setCurrentPage(1);
  };

  const handleSubTabChange = (tabId: string) => {
    setActiveSubTab(tabId);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#050816] font-sans selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />
      
      {/* Abstract Glowing Backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FF8A00]/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      <main className="max-w-[1600px] mx-auto px-6 pt-8 grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT SIDEBAR (xl:col-span-2) */}
        <aside className="xl:col-span-2 flex flex-col gap-6 sticky top-24 h-fit hidden xl:flex">
          
          {/* Navigation */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-2">Leaderboard</span>
            {[
              { id: 'Global Leaderboard', icon: Globe },
              { id: 'Monthly Leaderboard', icon: CalendarDays },
              { id: 'Weekly Leaderboard', icon: Calendar },
              { id: 'Contest Leaderboard', icon: Trophy },
              { id: 'University Leaderboard', icon: Building2 },
              { id: 'Friends Leaderboard', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all relative group ${
                  activeLeaderboard === tab.id 
                    ? 'text-[#FF8A00] bg-[#FF8A00]/10 border border-[#FF8A00]/20 shadow-[0_0_15px_rgba(255,138,0,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <tab.icon size={16} className={activeLeaderboard === tab.id ? 'text-[#FF8A00]' : 'text-gray-500'} strokeWidth={2.5} />
                <span className="relative z-10 truncate">{tab.id}</span>
                {activeLeaderboard === tab.id && (
                  <motion.div layoutId="lbIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/2 bg-[#FF8A00] rounded-r shadow-[0_0_10px_#FF8A00]" />
                )}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-2">Filters</span>
            
            <div className="flex flex-col gap-3">
              {[
                { label: 'Time Period', value: 'This Month', icon: Calendar },
                { label: 'Platform', value: 'All Platforms', icon: CalendarDays },
                { label: 'Country', value: 'All Countries', icon: ChevronDown },
                { label: 'Skill', value: 'All Skills', icon: ChevronDown }
              ].map((filter, i) => (
                <div key={i} className="flex flex-col gap-1.5 px-1">
                  <span className="text-[10px] font-bold text-gray-500">{filter.label}</span>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all">
                    <span className="text-xs font-bold text-white">{filter.value}</span>
                    <filter.icon size={14} className="text-gray-500" />
                  </div>
                </div>
              ))}
              
              <label className="flex items-center gap-3 cursor-pointer mt-4 group px-1">
                <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover:border-[#FF8A00] transition-colors">
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">Show Only Friends</span>
              </label>
            </div>
          </div>

          {/* Climb the Ranks Card */}
          <div className="mt-4 bg-gradient-to-br from-[#FF8A00]/10 to-[#FF8A00]/5 border border-[#FF8A00]/20 rounded-2xl p-5 shadow-[0_10px_30px_rgba(255,138,0,0.1)] relative overflow-hidden group flex flex-col items-center text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#FF8A00]/10 rounded-full blur-[40px] group-hover:bg-[#FF8A00]/20 transition-all" />
            <Crown size={32} className="text-[#FF8A00] mb-3 relative z-10" />
            <h4 className="text-sm font-black text-white relative z-10 mb-1.5">Climb the ranks!</h4>
            <p className="text-[10px] text-gray-400 font-semibold mb-5 relative z-10 leading-relaxed px-2">
              Solve more problems, participate in contests and improve your rank.
            </p>
            <button className="w-full py-2 rounded-xl border border-[#FF8A00]/50 hover:bg-[#FF8A00]/10 text-[#FF8A00] text-xs font-black transition-all relative z-10 flex items-center justify-center gap-2">
              View My Progress <ArrowRight size={14} />
            </button>
          </div>
        </aside>

        {/* MIDDLE MAIN CONTENT (xl:col-span-7) */}
        <div className="xl:col-span-7 min-w-0 flex flex-col gap-6">
          
          {/* Header Row */}
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                {activeLeaderboard} <Trophy size={28} className="text-yellow-500" />
              </h1>
              <p className="text-sm font-semibold text-gray-400">
                Top coders across the world based on problem solving performance.
              </p>
              
              {/* Sub Navigation */}
              <div className="flex items-center gap-6 mt-6 border-b border-white/10 pb-px">
                {['Global', 'Country', 'University', 'Friends'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => handleSubTabChange(tab)}
                    className={`text-sm font-bold pb-3 relative transition-colors ${activeSubTab === tab ? 'text-[#FF8A00]' : 'text-gray-400 hover:text-white'}`}
                  >
                    {tab}
                    {activeSubTab === tab && (
                      <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#FF8A00] shadow-[0_0_10px_#FF8A00]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Mini Card */}
            <div className="bg-[#101014] border border-purple-500/20 rounded-2xl p-4 flex flex-col relative overflow-hidden xl:w-64 shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.05)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px]" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h4 className="text-[11px] font-black text-white">Leaderboard updates in real-time</h4>
                <Crown size={14} className="text-yellow-500 shrink-0" />
              </div>
              <p className="text-[9px] text-gray-500 font-semibold relative z-10 w-2/3">Keep solving problems and stay on top!</p>
              {/* Mini Graph Approximation */}
              <div className="absolute bottom-3 right-3 flex items-end gap-1 opacity-80">
                <div className="w-1.5 h-3 bg-purple-500/30 rounded-full" />
                <div className="w-1.5 h-5 bg-purple-500/40 rounded-full" />
                <div className="w-1.5 h-4 bg-purple-500/50 rounded-full" />
                <div className="w-1.5 h-7 bg-purple-500/60 rounded-full" />
                <div className="w-1.5 h-6 bg-purple-500/80 rounded-full" />
                <div className="w-1.5 h-9 bg-purple-500 shadow-[0_0_10px_#a855f7] rounded-full relative">
                   <div className="absolute -top-1 -right-0.5 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {[
              { label: 'Total Coders', value: '1.2M+', icon: Trophy, color: '#FF8A00', bg: 'bg-[#FF8A00]/10' },
              { label: 'Problems Solved', value: '24.5M', icon: Code2, color: '#22c55e', bg: 'bg-emerald-500/10' },
              { label: 'Contests Held', value: '856', icon: CalendarDays, color: '#3b82f6', bg: 'bg-blue-500/10' },
              { label: 'Active Today', value: '72', icon: Flame, color: '#d946ef', bg: 'bg-fuchsia-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#101014] border border-white/5 rounded-2xl p-4 flex flex-col justify-center gap-3 relative overflow-hidden group hover:border-white/10 transition-all">
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-20 ${stat.bg.replace('/10', '')}`} />
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} border border-white/5 shrink-0`} style={{ color: stat.color }}>
                    <stat.icon size={16} />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xl font-black text-white leading-none">{stat.value}</div>
                  </div>
                </div>
                <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main Table */}
          <div className="bg-[#101014] border border-white/5 rounded-2xl flex flex-col overflow-hidden mt-2 relative">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF8A00]/30 to-transparent" />
             
             {/* Table Header */}
             <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-4 flex items-center gap-2"><Star size={12}/> User</div>
                <div className="col-span-2 flex items-center gap-1 justify-end">Rating <Search size={10} className="opacity-50"/></div>
                <div className="col-span-2 text-right">Problems Solved</div>
                <div className="col-span-1 text-right">Contests</div>
                <div className="col-span-1 text-right">Win Rate</div>
                <div className="col-span-1 text-center">Badge</div>
             </div>

             {/* Table Body */}
             <div className="flex flex-col">
                {displayData.map((row, i) => (
                  <div key={i} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${row.rank <= 3 ? 'bg-gradient-to-r from-transparent via-white/[0.01] to-transparent' : ''}`}>
                    
                    {/* Rank Badge */}
                    <div className="col-span-1 flex justify-center">
                       {row.rank === 1 ? (
                         <div className="w-7 h-7 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(234,179,8,0.4)] relative">
                           <Crown size={12} className="absolute -top-2 text-yellow-400 drop-shadow-[0_0_2px_black]" />
                           1
                         </div>
                       ) : row.rank === 2 ? (
                         <div className="w-7 h-7 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(156,163,175,0.4)]">
                           2
                         </div>
                       ) : row.rank === 3 ? (
                         <div className="w-7 h-7 rounded-full bg-gradient-to-b from-orange-400 to-orange-700 flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                           3
                         </div>
                       ) : (
                         <span className="text-sm font-bold text-gray-400">{row.rank}</span>
                       )}
                    </div>
                    
                    {/* User */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden relative shrink-0 border border-white/10">
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full bg-blue-500/20 flex items-center justify-center">
                          <User size={14} className="text-white" />
                        </div>
                        {row.rank === 1 && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-black rounded-full" />}
                      </div>
                      <span className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                        {row.user} 
                        {row.isVerified && <CheckSquare size={14} className="text-blue-500 shrink-0" />}
                      </span>
                    </div>
                    
                    {/* Rating */}
                    <div className="col-span-2 text-right font-black text-[15px]" style={{ color: row.rank === 1 ? '#eab308' : row.rank === 2 ? '#c084fc' : row.rank === 3 ? '#FF8A00' : '#3b82f6' }}>
                      {row.rating}
                    </div>
                    
                    {/* Problems */}
                    <div className="col-span-2 text-right text-sm font-bold text-gray-300">
                      {row.problems}
                    </div>

                    {/* Contests */}
                    <div className="col-span-1 text-right text-sm font-bold text-gray-300">
                      {row.contests}
                    </div>

                    {/* Win Rate */}
                    <div className="col-span-1 text-right text-sm font-bold text-gray-300">
                      {row.winRate}
                    </div>

                    {/* Badge */}
                    <div className="col-span-1 flex justify-center items-center">
                      {row.badge === 'crown' && <Crown size={18} className={row.badgeColor} />}
                      {row.badge === 'diamond' && <div className={`w-3.5 h-3.5 rotate-45 border-2 border-current ${row.badgeColor}`} />}
                      {row.badge === 'shield' && <Shield size={16} className={row.badgeColor} />}
                    </div>

                  </div>
                ))}
             </div>

             {/* Pagination */}
             <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-black/20">
               <div className="text-xs font-semibold text-gray-500">
                 Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, fullData.length)} of {fullData.length} entries
               </div>
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                   disabled={currentPage === 1}
                   className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentPage === 1 ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                 >
                   <ChevronLeft size={16} />
                 </button>
                 
                 {[1, 2, 3].map(num => (
                   num <= totalPages && (
                     <button 
                       key={num}
                       onClick={() => setCurrentPage(num)}
                       className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                         currentPage === num 
                           ? 'bg-[#FF8A00]/20 border border-[#FF8A00]/50 text-[#FF8A00]' 
                           : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-transparent'
                       }`}
                     >
                       {num}
                     </button>
                   )
                 ))}
                 
                 {totalPages > 4 && <span className="text-gray-600 px-1">...</span>}
                 
                 {totalPages > 3 && (
                   <button 
                     onClick={() => setCurrentPage(totalPages)}
                     className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                       currentPage === totalPages 
                         ? 'bg-[#FF8A00]/20 border border-[#FF8A00]/50 text-[#FF8A00]' 
                         : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-transparent'
                     }`}
                   >
                     {totalPages}
                   </button>
                 )}
                 
                 <button 
                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                   disabled={currentPage === totalPages}
                   className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentPage === totalPages ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                 >
                   <ChevronRight size={16} />
                 </button>
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                 Rows per page: 
                 <select 
                   value={rowsPerPage} 
                   onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                   className="bg-white/5 border border-white/10 rounded px-2 py-1 cursor-pointer focus:outline-none text-white"
                 >
                   <option value={10}>10</option>
                   <option value={25}>25</option>
                   <option value={50}>50</option>
                 </select>
               </div>
             </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (xl:col-span-3) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Top User Profile Card */}
          <div className="bg-[#101014] border border-[#FF8A00]/20 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden shadow-[0_10px_40px_rgba(255,138,0,0.05)]">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF8A00]/10 rounded-full blur-[60px]" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF8A00] to-transparent opacity-50" />
            
            <div className="relative mt-2 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-[#FF8A00] p-1 shadow-[0_0_20px_rgba(255,138,0,0.3)]">
                <div className="w-full h-full rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden">
                   {/* Avatar Placeholder */}
                   <User size={32} className="text-white opacity-50" />
                </div>
              </div>
              <div className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 border-2 border-[#101014] flex items-center justify-center shadow-lg">
                <Crown size={14} className="text-yellow-900" fill="currentColor" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-6 text-lg font-black text-white">
              {topUser.user} {topUser.isVerified && <CheckSquare size={16} className="text-blue-500" />}
            </div>

            <div className="w-full flex items-center justify-between px-2 mb-6">
              <div className="flex flex-col gap-1 items-center">
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Global Rank</span>
                <span className="text-xl font-black text-[#FF8A00] flex items-center gap-1"><Medal size={16}/> #{topUser.rank}</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col gap-1 items-center">
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Rating</span>
                <span className="text-xl font-black text-[#FF8A00]">{topUser.rating}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex flex-col gap-2 mb-6">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-400">Next Rank (Legend)</span>
                <span className="text-gray-300">{topUser.rating} / 3000</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[94%] bg-gradient-to-r from-[#FF8A00] to-yellow-400 rounded-full shadow-[0_0_10px_#FF8A00]" />
              </div>
            </div>

            <button className="w-full py-2.5 rounded-xl border border-[#FF8A00]/50 hover:bg-[#FF8A00]/10 text-[#FF8A00] text-xs font-black transition-all">
              View Profile
            </button>
          </div>

          {/* Statistics Card (Radar Chart Placeholder) */}
          <div className="bg-[#101014] border border-white/5 rounded-2xl p-6 flex flex-col">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-black text-white">Your Statistics</h3>
               <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded cursor-pointer">
                 This Month <ChevronDown size={10} />
               </div>
             </div>

             {/* Radar Chart SVG Approximation */}
             <div className="w-full aspect-square relative flex items-center justify-center py-4">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  {/* Web lines */}
                  <polygon points="50,10 90,35 75,85 25,85 10,35" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <polygon points="50,25 75,42 65,70 35,70 25,42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  <polygon points="50,40 60,48 55,58 45,58 40,48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  
                  {/* Spokes */}
                  <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="90" y2="35" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="75" y2="85" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="25" y2="85" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                  <line x1="50" y1="50" x2="10" y2="35" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                  {/* Data Polygon */}
                  <polygon points="50,15 80,40 65,80 35,75 15,45" fill="rgba(255,138,0,0.15)" stroke="#FF8A00" strokeWidth="1" />
                  
                  {/* Points */}
                  <circle cx="50" cy="15" r="1.5" fill="#FF8A00" />
                  <circle cx="80" cy="40" r="1.5" fill="#FF8A00" />
                  <circle cx="65" cy="80" r="1.5" fill="#FF8A00" />
                  <circle cx="35" cy="75" r="1.5" fill="#FF8A00" />
                  <circle cx="15" cy="45" r="1.5" fill="#FF8A00" />
                </svg>

                {/* Labels */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center text-center -mt-2">
                  <span className="text-[9px] font-bold text-gray-500">Problem Solving</span>
                  <span className="text-[10px] font-black text-emerald-400">92%</span>
                </div>
                <div className="absolute top-[30%] right-0 flex flex-col items-center text-center -mr-2">
                  <span className="text-[9px] font-bold text-gray-500">Speed</span>
                  <span className="text-[10px] font-black text-red-400">78%</span>
                </div>
                <div className="absolute bottom-[10%] right-[10%] flex flex-col items-center text-center -mr-4">
                  <span className="text-[9px] font-bold text-gray-500">Accuracy</span>
                  <span className="text-[10px] font-black text-blue-400">85%</span>
                </div>
                <div className="absolute bottom-[10%] left-[10%] flex flex-col items-center text-center -ml-4">
                  <span className="text-[9px] font-bold text-gray-500">Consistency</span>
                  <span className="text-[10px] font-black text-yellow-400">88%</span>
                </div>
                <div className="absolute top-[30%] left-0 flex flex-col items-center text-center -ml-2">
                  <span className="text-[9px] font-bold text-gray-500">Contest</span>
                  <span className="text-[10px] font-black text-red-500">75%</span>
                </div>
             </div>
          </div>

          {/* Top Contributors Card */}
          <div className="bg-[#101014] border border-white/5 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
               <h3 className="text-sm font-black text-white">Top Contributors</h3>
               <span className="text-xs font-bold text-[#FF8A00] cursor-pointer hover:underline">View All</span>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { name: 'aryan_singh', pts: '12,453 pts' },
                { name: 'code_wizard', pts: '11,234 pts' },
                { name: 'algorithm_king', pts: '10,987 pts' },
              ].map((user, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 w-3">{i + 1}</span>
                  <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                    <User size={12} className="text-gray-400" />
                  </div>
                  <span className="text-xs font-bold text-gray-300 flex-1 truncate">{user.name}</span>
                  <span className="text-xs font-semibold text-gray-500">{user.pts}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
