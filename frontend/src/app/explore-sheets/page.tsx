"use client";
import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import TopNavbar from '../../components/shared/TopNavbar';
import { 
  Sparkles, Code2, Heart, Zap, Target, Briefcase, Brain, Box,
  Play, CheckCircle2, Activity, Bookmark, ChevronDown, Flame
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const tabs = ['All Sheets', 'Company Wise', 'Popular', 'Quick Revision', 'Complete DSA', 'Topic Specific', 'Competitive'];

const sheetsData = [
  { slug: 'striver-a2z', title: 'Striver A2Z DSA Sheet', desc: 'Complete DSA roadmap from beginner to advanced.', problems: 455, progress: 72, icon: Code2, color: 'from-purple-600 to-indigo-600', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  { slug: 'love-babbar', title: 'Love Babbar Sheet', desc: '450 selected questions to build strong problem solving skills.', problems: 450, progress: 41, icon: Heart, color: 'from-emerald-600 to-green-600', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { slug: 'neetcode-150', title: 'Neetcode 150', desc: 'The most popular 150 LeetCode patterns for FAANG interviews.', problems: 150, progress: 35, icon: Zap, color: 'from-blue-600 to-cyan-600', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  { slug: 'blind-75', title: 'Blind 75', desc: 'Curated list of 75 Leetcode questions to land a job at top tech companies.', problems: 75, progress: 28, icon: Target, color: 'from-purple-500 to-fuchsia-600', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
  { slug: 'top-interview-150', title: 'Top Interview 150', desc: 'Must-do questions directly recommended by top tech companies.', problems: 150, progress: 0, icon: Briefcase, color: 'from-violet-600 to-purple-600', text: 'text-violet-400', bg: 'bg-violet-500/10' },
  { slug: 'striver-sde', title: 'Striver SDE Sheet', desc: 'Top 190 questions for last-minute SDE interview preparation.', problems: 190, progress: 0, icon: Code2, color: 'from-orange-600 to-red-600', text: 'text-orange-400', bg: 'bg-orange-500/10' },
  { slug: 'dp-master', title: 'DP Master Sheet', desc: 'Handpicked DP questions to become a DP master.', problems: 120, progress: 0, icon: Brain, color: 'from-pink-600 to-rose-600', text: 'text-pink-400', bg: 'bg-pink-500/10' },
  { slug: 'system-design', title: 'System Design Sheet', desc: 'Learn system design with real-world case studies and problems.', problems: 85, progress: 0, icon: Box, color: 'from-sky-600 to-blue-600', text: 'text-sky-400', bg: 'bg-sky-500/10' },
];

export default function ExploreSheetsPage() {
  const [activeTab, setActiveTab] = useState('All Sheets');

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />
      
      <main className="max-w-[1400px] mx-auto px-6 pt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-[32px] font-extrabold text-white mb-2 flex items-center gap-2">
              Explore Sheets <Sparkles size={24} className="text-[#FF8A00]" />
            </h1>
            <p className="text-sm text-gray-400">
              Curated roadmaps and problem collections to accelerate your coding journey.
            </p>
          </div>
          
          {/* Personalized for You Card */}
          <div className="bg-gradient-to-r from-indigo-950/40 to-purple-900/20 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between w-full md:w-[320px] relative overflow-hidden shadow-[0_10px_30px_rgba(88,28,135,0.1)]">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-600/20 blur-[30px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-white mb-1.5">Personalized for You</h3>
              <p className="text-[10px] text-gray-400 mb-3">Based on your progress and weak topics</p>
              <button className="text-[10px] font-bold text-[#FF8A00] border border-[#FF8A00]/30 bg-[#FF8A00]/10 hover:bg-[#FF8A00]/20 px-4 py-1.5 rounded-lg transition-colors">
                View Recommendations
              </button>
            </div>
            <div className="relative z-10 -mr-2">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-indigo-500/10 border border-purple-400/30 rounded-2xl rotate-12 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <Box size={20} className="text-purple-300 transform -rotate-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full lg:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-[#FF8A00] text-white shadow-[0_0_15px_rgba(255,138,0,0.4)]' 
                    : 'bg-transparent text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            {['All Levels', 'All Topics', 'Sort By'].map((filter, i) => (
              <button key={i} className="flex items-center gap-2 bg-[#111216] border border-white/5 hover:bg-white/[0.02] px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 transition-colors">
                {filter} {filter === 'Sort By' ? <span className="ml-1">↑↓</span> : <ChevronDown size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Sheet Banner */}
        <div className="bg-[#111216]/60 border border-[#FF8A00]/30 rounded-3xl p-8 relative overflow-hidden mb-12 shadow-[0_20px_60px_rgba(255,138,0,0.05)]">
          {/* Orange Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF8A00]/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Content */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00] text-[10px] font-bold mb-4">
                <Flame size={12} className="fill-current" /> Trending This Week
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-3">Striver A2Z DSA Sheet</h2>
              <p className="text-sm text-gray-400 max-w-lg mb-6 leading-relaxed">
                The ultimate roadmap to master Data Structures and Algorithms from basic to advanced.
              </p>
              
              <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-300">Beginner to Advanced</span>
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-300">455 Problems</span>
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-300 flex items-center gap-1.5">👥 125K+ Users</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Link href="/sheets/striver-a2z">
                  <button className="bg-gradient-to-r from-[#FF8A00] to-orange-500 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_8px_25px_rgba(255,138,0,0.3)] hover:scale-105 transition-transform active:scale-95">
                    <Play size={16} className="fill-current" /> Continue Sheet
                  </button>
                </Link>
                <Link href="/sheets/striver-a2z">
                  <button className="bg-transparent border border-white/10 hover:bg-white/5 text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors active:scale-95">
                    View Details
                  </button>
                </Link>
              </div>
            </div>

            {/* Middle Stats */}
            <div className="flex items-center gap-10 bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#FF8A00" strokeWidth="2.5" strokeDasharray="100" strokeDashoffset="28" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center drop-shadow-lg">
                  <span className="text-3xl font-black text-white">72%</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 tracking-wide">Completed</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><CheckCircle2 size={14} className="text-emerald-500"/></div>
                  <div>
                    <div className="text-sm font-black text-white leading-none mb-1">328</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Solved</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/20 flex items-center justify-center"><Target size={14} className="text-[#FF8A00]"/></div>
                  <div>
                    <div className="text-sm font-black text-white leading-none mb-1">127</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Remaining</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Activity size={14} className="text-blue-500"/></div>
                  <div>
                    <div className="text-sm font-black text-white leading-none mb-1">45</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Revision Pending</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="hidden xl:flex w-64 justify-center items-center relative perspective-[1000px]">
               <div className="absolute inset-0 bg-[#FF8A00]/20 blur-[60px] rounded-full pointer-events-none" />
               <div className="relative z-10 transform rotateX-[60deg] rotateZ-[45deg] scale-125 transition-transform duration-1000 hover:rotateZ-[35deg]">
                 <div className="w-32 h-32 bg-gradient-to-tr from-orange-600/10 to-[#FF8A00]/20 border border-[#FF8A00]/40 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,138,0,0.2)]">
                   <div className="w-24 h-24 bg-[#FF8A00]/10 border border-[#FF8A00]/50 rounded-xl flex items-center justify-center translate-z-10 shadow-[0_0_30px_rgba(255,138,0,0.4)] backdrop-blur-md">
                      <div className="transform -rotateZ-[45deg] -rotateX-[60deg] translate-z-20 text-[#FF8A00] font-black text-4xl drop-shadow-[0_0_20px_rgba(255,138,0,1)]">
                        {'</>'}
                      </div>
                   </div>
                 </div>
               </div>
            </div>

          </div>
        </div>

        {/* Grid Section */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white mb-6">All Sheets</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {sheetsData.map((sheet, i) => (
              <Link href={`/sheets/${sheet.slug}`} key={sheet.slug} className="block h-full">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#111216] border border-white/5 hover:border-white/10 rounded-[20px] p-5 relative overflow-hidden group transition-all duration-300 shadow-lg flex flex-col h-full cursor-pointer"
                >
                {/* Accent Line */}
                {sheet.progress > 0 && (
                  <div className="absolute top-0 left-0 h-[2px] bg-[#FF8A00] shadow-[0_0_10px_#FF8A00] transition-all duration-500" style={{ width: `${sheet.progress}%` }} />
                )}
                
                <div className="flex gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-[14px] bg-gradient-to-br ${sheet.color} p-[1px] flex-shrink-0 shadow-lg`}>
                    <div className="w-full h-full bg-[#111216]/90 rounded-[13px] flex items-center justify-center backdrop-blur-sm">
                      <sheet.icon size={22} className={sheet.text} />
                    </div>
                  </div>
                  <div className="flex-1 pt-1.5">
                    <h3 className="font-bold text-sm text-white mb-1.5 leading-tight group-hover:text-[#FF8A00] transition-colors">{sheet.title}</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{sheet.desc}</p>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                      <Box size={12} className="text-gray-500" />
                      <span>{sheet.problems} Problems</span>
                    </div>
                    {sheet.progress > 0 && (
                      <span className="text-xs font-bold text-white">{sheet.progress}%</span>
                    )}
                  </div>
                  
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-6">
                    <div className={`h-full transition-all duration-1000 ${sheet.progress > 0 ? 'bg-[#FF8A00]' : 'bg-transparent'}`} style={{ width: `${sheet.progress}%` }} />
                  </div>

                  <div className="flex items-center gap-3">
                    <button className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      sheet.progress > 0 
                        ? 'bg-[#FF8A00] hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(255,138,0,0.2)]' 
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                    }`}>
                      {sheet.progress > 0 ? 'Continue' : 'Start Sheet'}
                    </button>
                    <button className="w-10 h-10 rounded-xl border border-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0">
                      <Bookmark size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>
        </div>
        
      </main>
    </div>
  );
}
