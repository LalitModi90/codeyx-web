"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopNavbar from '../../../components/shared/TopNavbar';
import { useUser, SignInButton } from '@clerk/nextjs';
import { 
  ChevronRight, Play, CheckCircle2, Circle, Bookmark, 
  Edit3, ExternalLink, Code2, Target, TrendingUp, AlertCircle, 
  ChevronDown, ChevronUp, FileCode2, Clock, Users, Star,
  Search, Shield, Zap, Sparkles, Activity, Flame, Lock
} from 'lucide-react';
import Link from 'next/link';
import { striverA2ZData } from '../../../data/striverA2Z';

const sheetMetadata: Record<string, { title: string, desc: string, total: number, stats: { solved: number, remaining: number, revision: number, progress: number } }> = {
  'striver-a2z': {
    title: 'Striver A2Z DSA Sheet',
    desc: 'The ultimate roadmap to master Data Structures and Algorithms from scratch.',
    total: 455,
    stats: { solved: 328, remaining: 127, revision: 45, progress: 72 }
  },
  'love-babbar': {
    title: 'Love Babbar Sheet',
    desc: '450 selected questions to build strong problem solving skills.',
    total: 450,
    stats: { solved: 184, remaining: 266, revision: 12, progress: 41 }
  },
  'neetcode-150': {
    title: 'Neetcode 150',
    desc: 'The most popular 150 LeetCode patterns for FAANG interviews.',
    total: 150,
    stats: { solved: 52, remaining: 98, revision: 5, progress: 35 }
  },
  'blind-75': {
    title: 'Blind 75',
    desc: 'Curated list of 75 Leetcode questions to land a job at top tech companies.',
    total: 75,
    stats: { solved: 21, remaining: 54, revision: 0, progress: 28 }
  },
  'top-interview-150': { title: 'Top Interview 150', desc: 'Must-do questions directly recommended by top tech companies.', total: 150, stats: { solved: 0, remaining: 150, revision: 0, progress: 0 } },
  'striver-sde': { title: 'Striver SDE Sheet', desc: 'Top 190 questions for last-minute SDE interview preparation.', total: 190, stats: { solved: 0, remaining: 190, revision: 0, progress: 0 } },
  'dp-master': { title: 'DP Master Sheet', desc: 'Handpicked DP questions to become a DP master.', total: 120, stats: { solved: 0, remaining: 120, revision: 0, progress: 0 } },
  'system-design': { title: 'System Design Sheet', desc: 'Learn system design with real-world case studies and problems.', total: 85, stats: { solved: 0, remaining: 85, revision: 0, progress: 0 } },
};

export default function SheetDetailsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const metadata = sheetMetadata[slug] || sheetMetadata['striver-a2z'];
  const { isSignedIn, isLoaded } = useUser();

  const [activeSection, setActiveSection] = useState<number>(3); // Expand Arrays by default
  const [roadmapSearch, setRoadmapSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [isAdded, setIsAdded] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('activeSheets');
    if (saved) {
      const sheets = JSON.parse(saved);
      if (sheets.find((s: any) => s.id === slug)) {
        setIsAdded(true);
      }
    } else {
      if (metadata.stats.progress > 0) setIsAdded(true);
    }
  }, [slug, metadata.stats.progress]);

  const handleAddWorkspace = () => {
    setIsAdded(true);
    const saved = localStorage.getItem('activeSheets');
    let current = saved ? JSON.parse(saved) : [];
    
    if (!current.find((s: any) => s.id === slug)) {
      current.push({
        id: slug,
        name: metadata.title,
        progress: 0
      });
      localStorage.setItem('activeSheets', JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('workspaceUpdated', { detail: current }));
    }
  };

  const [solvedProblems, setSolvedProblems] = useState<Set<number>>(() => {
    const initialSolved = new Set<number>();
    // For demo purposes, we randomly assign some solved state or leave it based on stats
    striverA2ZData.roadmap.forEach((section, idx) => {
      section.problems?.forEach((p, pIdx) => {
        if (metadata.stats.progress > 0 && Math.random() * 100 < metadata.stats.progress) initialSolved.add(p.id);
      });
    });
    return initialSolved;
  });

  const [notesSet, setNotesSet] = useState<Set<number>>(new Set([301])); // Mock first one has note
  const [bookmarksSet, setBookmarksSet] = useState<Set<number>>(new Set([301])); // Mock first one bookmarked

  const toggleProblemStatus = (id: number) => {
    if (!isLoaded || !isSignedIn) return;
    if (!isAdded) handleAddWorkspace();
    setSolvedProblems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleNote = (id: number) => {
    if (!isLoaded || !isSignedIn) return;
    if (!isAdded) handleAddWorkspace();
    const newSet = new Set(notesSet);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setNotesSet(newSet);
  };

  const toggleBookmark = (id: number) => {
    if (!isLoaded || !isSignedIn) return;
    if (!isAdded) handleAddWorkspace();
    const newSet = new Set(bookmarksSet);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setBookmarksSet(newSet);
  };
  
  const sheetDetails = { ...striverA2ZData, title: metadata.title, desc: metadata.desc, total: metadata.total };
  const roadmapSections = striverA2ZData.roadmap.map(section => ({
    ...section,
    solved: section.problems?.filter(p => solvedProblems.has(p.id)).length || 0,
    total: section.problems?.length || section.total
  }));
  
  const getDiffColor = (diff: string) => {
    if (diff === 'Easy') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (diff === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getPlatformLink = (platform: string, name: string) => {
    const slugName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (platform === 'LeetCode') return `https://leetcode.com/problems/${slugName}/`;
    if (platform === 'CodeStudio') return `https://www.codingninjas.com/studio/problems/${slugName}`;
    if (platform === 'GeeksforGeeks') return `https://practice.geeksforgeeks.org/problems/${slugName}/1`;
    return '#';
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'LeetCode') return <span className="text-amber-500 font-bold font-serif italic text-[14px]">L</span>;
    if (platform === 'GeeksforGeeks') return <span className="text-emerald-500 font-bold font-sans text-[14px]">G</span>;
    if (platform === 'CodeStudio') return <span className="text-orange-500 font-bold font-sans text-[14px]">C</span>;
    return <Code2 size={12} />;
  };

  const activeModule = roadmapSections.find(s => s.id === activeSection);
  const filteredProblems = activeModule?.problems.filter(prob => difficultyFilter === 'All' || prob.difficulty === difficultyFilter) || [];
  const displayedProblems = isExpanded ? filteredProblems : filteredProblems.slice(0, 6);
  const cardBg = "bg-[#101014]";
  const border = "border-white/5";

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-12">
      <TopNavbar />

      <main className="max-w-[1600px] mx-auto px-6 pt-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Activity size={12} /> My Workspace
          </Link>
          <ChevronRight size={12} />
          <Link href="/explore-sheets" className="hover:text-white transition-colors">Sheets</Link>
          <ChevronRight size={12} />
          <span className="text-gray-300">{sheetDetails.title}</span>
        </div>

        {/* 🎯 HERO SECTION */}
        <div className={`${cardBg} border ${border} rounded-[24px] p-8 shadow-xl relative overflow-hidden mb-6 flex flex-col lg:flex-row justify-between items-center gap-8`}>
          {/* Background Glow */}
          <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-[#FF8A00]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-8 z-10 w-full lg:w-2/3">
            {/* Code Illustration */}
            <div className="hidden md:flex flex-col items-center justify-center w-40 h-40 rounded-[20px] bg-gradient-to-br from-[#101014] to-[#1a130c] border border-[#FF8A00]/20 shadow-[0_0_30px_rgba(255,138,0,0.1)] relative">
              <div className="absolute inset-0 bg-[#FF8A00]/5 rounded-[20px] backdrop-blur-md" />
              <Code2 size={48} className="text-[#FF8A00] mb-2 relative z-10 animate-pulse" strokeWidth={1.5} />
              <div className="flex gap-1.5 relative z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
                {sheetDetails.title}
                <Star size={20} className="text-[#FF8A00] fill-[#FF8A00]" />
              </h1>
              <p className="text-sm text-[#A1A1AA] max-w-lg mb-4 leading-relaxed">
                {sheetDetails.desc}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">DSA</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">Beginner to Advanced</span>
                <span className="px-3 py-1 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-xs font-bold text-[#FF8A00] flex items-center gap-1.5">
                  <Flame size={12} className="fill-current" /> Most Popular
                </span>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 mb-1"><FileCode2 size={12} /> Total Problems</p>
                  <p className="text-lg font-black text-white">{sheetDetails.total}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 mb-1"><Clock size={12} /> Est. Time</p>
                  <p className="text-lg font-black text-white">{Math.round(sheetDetails.total / 2)} hrs</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 mb-1"><Users size={12} /> Followers</p>
                  <p className="text-lg font-black text-white">125K</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 mb-1"><Star size={12} /> Rating</p>
                  <p className="text-lg font-black text-[#FF8A00]">4.9</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 z-10 lg:w-1/3 items-end lg:pr-8 mt-6 lg:mt-0">
            <div className="flex items-center gap-4">
              {!isSignedIn ? (
                <Link href="/login">
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_8px_25px_rgba(79,70,229,0.3)] hover:scale-105 transition-transform active:scale-95">
                    Sign In to Track Progress
                  </button>
                </Link>
              ) : isAdded ? (
                <button className="bg-gradient-to-r from-[#FF8A00] to-orange-500 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_8px_25px_rgba(255,138,0,0.3)] hover:scale-105 transition-transform active:scale-95">
                  <Play size={16} className="fill-current" /> Continue Sheet
                </button>
              ) : (
                <button onClick={handleAddWorkspace} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_8px_25px_rgba(79,70,229,0.3)] hover:scale-105 transition-transform active:scale-95">
                  ➕ Add to Workspace
                </button>
              )}
            </div>

            <div className="flex items-center gap-8">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(255,138,0,0.3)]">
                  <circle className="text-white/5" strokeWidth="10" stroke="currentColor" fill="transparent" r="62" cx="72" cy="72" />
                  <circle className="text-[#FF8A00]" strokeWidth="10" strokeDasharray={389} strokeDashoffset={389 - (389 * (isAdded ? metadata.stats.progress : 0)) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="62" cx="72" cy="72" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{isAdded ? metadata.stats.progress : 0}%</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Completed</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xl font-black text-white flex items-end gap-2 leading-none">{isAdded ? metadata.stats.solved : 0} <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Solved</span></p>
                </div>
                <div>
                  <p className="text-xl font-black text-white flex items-end gap-2 leading-none">{isAdded ? metadata.stats.remaining : metadata.total} <span className="text-[10px] font-bold text-[#FF8A00] uppercase tracking-wider mb-0.5">Remaining</span></p>
                </div>
                <div>
                  <p className="text-xl font-black text-white flex items-end gap-2 leading-none">{metadata.total} <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total</span></p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full justify-end">
               <button className="bg-[#FF8A00] hover:bg-orange-500 text-white rounded-xl px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-[0_4px_20px_rgba(255,138,0,0.3)] transition-all active:scale-95">
                 <Play size={12} className="fill-current" /> Resume Sheet
               </button>
               <button className="bg-transparent border border-white/20 hover:bg-white/5 text-white rounded-xl px-6 py-2.5 text-xs font-bold transition-all active:scale-95">
                 Continue Last Problem
               </button>
            </div>
          </div>
        </div>

        {/* 📚 MAIN 3-COL WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ⬅️ LEFT COLUMN: SHEET ROADMAP */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-bold text-sm text-white mb-2">Sheet Roadmap</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                value={roadmapSearch}
                onChange={(e) => setRoadmapSearch(e.target.value)}
                placeholder="Search topic or problem..." 
                className={`w-full bg-[#09090B] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50 transition-all`}
              />
            </div>

            <div className="space-y-2">
              {roadmapSections.filter(section => section.title.toLowerCase().includes(roadmapSearch.toLowerCase())).map((section, idx) => {
                const isActive = activeSection === section.id;
                const completionPercent = Math.round((section.solved / section.total) * 100);
                return (
                  <div 
                    key={section.id} 
                    onClick={() => {
                      setActiveSection(section.id);
                      setIsExpanded(false);
                    }}
                    className={`rounded-xl p-3 cursor-pointer transition-all border ${isActive ? 'bg-[#FF8A00]/5 border-[#FF8A00]/30 shadow-[0_0_15px_rgba(255,138,0,0.05)]' : `${cardBg} border-transparent hover:border-white/10 hover:bg-white/5`}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isActive ? 'bg-[#FF8A00] text-white' : 'bg-white/5 text-gray-400'}`}>
                          {idx + 1}
                        </span>
                        <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{section.title}</span>
                      </div>
                      <ChevronDown size={14} className={isActive ? 'text-[#FF8A00] rotate-180 transition-transform' : 'text-gray-600 transition-transform'} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-bold">{section.solved} / {section.total}</span>
                      <span className={`text-[10px] font-black ${isActive ? 'text-[#FF8A00]' : 'text-gray-400'}`}>{completionPercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ⏺️ CENTER COLUMN: PROBLEM TABLE */}
          <div className="lg:col-span-6">
            <div className={`${cardBg} border ${border} rounded-[24px] shadow-xl overflow-hidden min-h-[600px] flex flex-col`}>
              
              {/* Filter Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#09090B]/40">
                <div className="flex gap-2">
                  {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                    <button 
                      key={diff}
                      onClick={() => {
                        setDifficultyFilter(diff);
                        setIsExpanded(false);
                      }}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors ${difficultyFilter === diff ? 'bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00]' : 'bg-transparent border border-white/10 hover:bg-white/5 text-gray-400'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Header inside Table */}
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#FF8A00]/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-white">{activeModule?.title}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Easy to Medium</span>
                  </div>
                  <ChevronUp size={16} className="text-gray-500 cursor-pointer" />
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-400 font-bold w-32 shrink-0">{activeModule?.solved} / {activeModule?.total} problems solved</span>
                  <div className="h-1 bg-[#09090B] flex-1 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-[#FF8A00] rounded-full" style={{ width: `${Math.round(((activeModule?.solved || 0) / (activeModule?.total || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-black text-white">{Math.round(((activeModule?.solved || 0) / (activeModule?.total || 1)) * 100)}%</span>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-gray-500 bg-[#09090B]/20">
                      <th className="py-3 px-6 font-bold w-10">#</th>
                      <th className="py-3 px-2 font-bold min-w-[200px]">Problem Name</th>
                      <th className="py-3 px-2 font-bold">Difficulty</th>
                      <th className="py-3 px-2 font-bold hidden xl:table-cell">Tags</th>
                      <th className="py-3 px-2 font-bold text-center w-16">Status</th>
                      <th className="py-3 px-2 font-bold text-gray-400 hidden 2xl:table-cell">Last Solved</th>
                      <th className="py-3 px-6 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProblems.map((prob, i) => {
                      const linkHref = (prob as any).link || getPlatformLink(prob.platform, prob.name);
                      const isLinkAvailable = linkHref !== '#';
                      
                      return (
                        <tr key={prob.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="py-3 px-6 text-xs text-gray-500 font-mono font-bold">{i + 1}</td>
                          <td className="py-3 px-2">
                            <span className="text-xs font-bold text-gray-200 group-hover:text-[#FF8A00] transition-colors line-clamp-1">{prob.name}</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${getDiffColor(prob.difficulty)}`}>
                              {prob.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-2 hidden xl:table-cell">
                            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded truncate max-w-[100px] inline-block">
                              Array, HashMap
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            {!isSignedIn ? (
                              <Link href="/login">
                                <button className="focus:outline-none transition-transform hover:scale-110 flex mx-auto" title="Sign in to track progress">
                                  <Lock size={14} className="text-gray-600 hover:text-[#FF8A00]" />
                                </button>
                              </Link>
                            ) : (
                              <button 
                                onClick={() => toggleProblemStatus(prob.id)}
                                className="focus:outline-none transition-transform hover:scale-110 flex mx-auto"
                                title={solvedProblems.has(prob.id) ? "Mark as Unsolved" : "Mark as Solved"}
                              >
                                {solvedProblems.has(prob.id) ? (
                                  <CheckCircle2 size={16} className="text-emerald-400" />
                                ) : (
                                  <Circle size={16} className="text-gray-700 hover:text-gray-400" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-2 text-[10px] text-gray-500 font-bold hidden 2xl:table-cell">
                            {solvedProblems.has(prob.id) ? 'Just now' : '-'}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center justify-end gap-3 transition-opacity">
                              
                              {/* GFG Logo Link */}
                              {prob.platform === 'GeeksforGeeks' && isLinkAvailable ? (
                                <a href={linkHref} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:scale-110 transition-transform" title="Solve on GeeksforGeeks">
                                  <div className="font-bold tracking-tighter flex text-[15px] leading-none">
                                    <span className="transform -scale-x-100">G</span><span className="-ml-0.5">G</span>
                                  </div>
                                </a>
                              ) : (
                                <div className="text-gray-700 cursor-not-allowed" title="Not available on GeeksforGeeks">
                                  <div className="font-bold tracking-tighter flex text-[15px] leading-none">
                                    <span className="transform -scale-x-100">G</span><span className="-ml-0.5">G</span>
                                  </div>
                                </div>
                              )}

                              {/* Youtube Logo Link */}
                              <a 
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(prob.name + ' solution take u forward')}`}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-600 hover:text-red-500 hover:scale-110 transition-all" 
                                title="Search Video Solution on YouTube"
                              >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.134 0 12 0 12s0 3.866.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.866 24 12 24 12s0-3.866-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                              </a>

                              {/* CodeStudio Logo Link */}
                              {prob.platform === 'CodeStudio' && isLinkAvailable ? (
                                <a href={linkHref} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:scale-110 transition-transform" title="Solve on CodeStudio">
                                  <span className="font-sans font-bold text-[15px] leading-none">C</span>
                                </a>
                              ) : (
                                <div className="text-gray-700 cursor-not-allowed" title="Not available on CodeStudio">
                                  <span className="font-sans font-bold text-[15px] leading-none">C</span>
                                </div>
                              )}

                              {/* Notes */}
                              {!isSignedIn ? (
                                <Link href="/login">
                                  <button className="transition-colors text-gray-600 hover:text-white" title="Sign in to add note">
                                    <Lock size={14} />
                                  </button>
                                </Link>
                              ) : (
                                <button 
                                  onClick={() => toggleNote(prob.id)}
                                  className={`transition-colors ${notesSet.has(prob.id) ? 'text-white' : 'text-gray-600 hover:text-white'}`} 
                                  title="Add Note"
                                >
                                  <Edit3 size={15} />
                                </button>
                              )}

                              {/* LeetCode Logo Link */}
                              {prob.platform === 'LeetCode' && isLinkAvailable ? (
                                <a href={linkHref} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:scale-110 transition-transform" title="Solve on LeetCode">
                                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.939 5.939 0 0 0 1.271 1.543l5.096 5.107c.251.242.602.397 1.051.404a1.444 1.444 0 0 0 1.044-.45 1.47 1.47 0 0 0 .436-1.053c-.006-.445-.164-.783-.418-1.04l-5.553-5.555h18.114c.484 0 .918-.17 1.259-.49.341-.322.528-.75.528-1.229 0-.479-.187-.906-.528-1.229-.341-.32-.775-.489-1.259-.489H9.428L13.882 7.02c.287-.281.428-.619.428-.985 0-.367-.141-.705-.428-.986zM20.647 12.025l-2.023-2.022a1.353 1.353 0 0 0-1.921 0 1.365 1.365 0 0 0 0 1.923l2.023 2.022a1.353 1.353 0 0 0 1.921 0 1.365 1.365 0 0 0 0-1.923z"/>
                                  </svg>
                                </a>
                              ) : (
                                <div className="text-gray-700 cursor-not-allowed" title="Not available on LeetCode">
                                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.939 5.939 0 0 0 1.271 1.543l5.096 5.107c.251.242.602.397 1.051.404a1.444 1.444 0 0 0 1.044-.45 1.47 1.47 0 0 0 .436-1.053c-.006-.445-.164-.783-.418-1.04l-5.553-5.555h18.114c.484 0 .918-.17 1.259-.49.341-.322.528-.75.528-1.229 0-.479-.187-.906-.528-1.229-.341-.32-.775-.489-1.259-.489H9.428L13.882 7.02c.287-.281.428-.619.428-.985 0-.367-.141-.705-.428-.986zM20.647 12.025l-2.023-2.022a1.353 1.353 0 0 0-1.921 0 1.365 1.365 0 0 0 0 1.923l2.023 2.022a1.353 1.353 0 0 0 1.921 0 1.365 1.365 0 0 0 0-1.923z"/>
                                  </svg>
                                </div>
                              )}

                              {/* Bookmark */}
                              {!isSignedIn ? (
                                <Link href="/login">
                                  <button className="transition-colors text-gray-600 hover:text-[#FF8A00]" title="Sign in to bookmark">
                                    <Lock size={14} />
                                  </button>
                                </Link>
                              ) : (
                                <button 
                                  onClick={() => toggleBookmark(prob.id)}
                                  className={`transition-colors ${bookmarksSet.has(prob.id) ? 'text-[#FF8A00]' : 'text-gray-600 hover:text-[#FF8A00]'}`} 
                                  title="Bookmark"
                                >
                                  <Bookmark size={15} className={bookmarksSet.has(prob.id) ? "fill-current" : ""} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredProblems.length > 6 && (
                <div className="p-4 bg-[#09090B]/40 flex justify-center border-t border-white/5">
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs font-bold text-[#FF8A00] flex items-center gap-1.5 hover:underline"
                  >
                    {isExpanded ? (
                      <>Show Less <ChevronUp size={14} /></>
                    ) : (
                      <>View All {activeModule?.total} Problems <ChevronRight size={14} /></>
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* ➡️ RIGHT COLUMN: WIDGETS */}
          <div className="lg:col-span-3 space-y-5">
            
            {/* 1️⃣ Daily Progress */}
            <div className={`${cardBg} border ${border} rounded-[20px] p-5 shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-white">Daily Progress</h3>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 cursor-pointer">Today <ChevronDown size={10} /></span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><CheckCircle2 size={12} className="text-emerald-400" /></div>
                    <span className="text-xs text-gray-400 font-semibold">Questions Solved</span>
                  </div>
                  <span className="text-sm font-black text-white">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><Clock size={12} className="text-blue-400" /></div>
                    <span className="text-xs text-gray-400 font-semibold">Study Time</span>
                  </div>
                  <span className="text-sm font-black text-white">2h 45m</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FF8A00]/10 flex items-center justify-center border border-[#FF8A00]/20"><Flame size={12} className="text-[#FF8A00]" /></div>
                    <span className="text-xs text-gray-400 font-semibold">Current Streak</span>
                  </div>
                  <span className="text-sm font-black text-white">28 days</span>
                </div>
              </div>
            </div>

            {/* 2️⃣ Smart Recommendation Card */}
            <div className={`bg-gradient-to-br from-[#101014] to-[#140a1b] border border-purple-500/20 rounded-[20px] p-5 shadow-lg relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
              
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <h4 className="font-bold text-xs text-purple-400">Smart Recommendation</h4>
                <span className="text-[8px] font-black bg-purple-500 text-white px-1.5 py-0.5 rounded">AI</span>
              </div>
              
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 relative z-10">Next Best Topic</p>
              <h3 className="text-lg font-black text-white mb-2 relative z-10">Binary Search</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed mb-4 relative z-10">
                You are doing great in Arrays! Binary Search will level up your problem solving.
              </p>
              
              <button className="bg-[#09090B] border border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-white rounded-lg px-4 py-2 text-[11px] font-bold flex items-center gap-2 transition-all relative z-10">
                Start Binary Search <ChevronRight size={12} />
              </button>
            </div>

            {/* 3️⃣ Upcoming Contest Widget */}
            <div className={`${cardBg} border ${border} rounded-[20px] p-5 shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs text-white">Upcoming Contest</h3>
                <span className="text-[10px] font-bold text-[#FF8A00] cursor-pointer">View All</span>
              </div>
              <p className="text-xs font-bold text-gray-300 mb-3">Codeforces Round 945 (Div. 2)</p>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { val: '01', label: 'Days' },
                  { val: '08', label: 'Hours' },
                  { val: '35', label: 'Mins' },
                  { val: '45', label: 'Secs' },
                ].map((t, i) => (
                  <div key={i} className="bg-[#09090B] border border-white/5 rounded-lg py-1.5 flex flex-col items-center">
                    <span className="text-sm font-black text-white">{t.val}</span>
                    <span className="text-[8px] font-bold text-gray-500">{t.label}</span>
                  </div>
                ))}
              </div>
              <button className="w-full bg-transparent border border-[#FF8A00]/30 hover:bg-[#FF8A00]/10 text-[#FF8A00] rounded-lg py-2 text-[11px] font-bold transition-all">
                Register Now
              </button>
            </div>

            {/* 4️⃣ Revision Reminder */}
            <div className={`${cardBg} border ${border} rounded-[20px] p-5 shadow-lg`}>
              <h3 className="font-bold text-xs text-white mb-1">Revision Reminder</h3>
              <p className="text-[10px] text-gray-400 mb-4">Review these topics to retain better</p>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-rose-500/20 transition-colors">Linked List</span>
                <span className="px-3 py-1.5 bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00] text-[10px] font-bold rounded-lg cursor-pointer hover:bg-[#FF8A00]/20 transition-colors">Stacks</span>
                <span className="px-3 py-1.5 bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00] text-[10px] font-bold rounded-lg cursor-pointer hover:bg-[#FF8A00]/20 transition-colors">Queues</span>
              </div>
            </div>

            {/* 5️⃣ XP / Level System */}
            <div className={`${cardBg} border border-amber-500/20 bg-gradient-to-r from-[#101014] to-[#17120a] rounded-[20px] p-4 flex items-center gap-4 shadow-lg`}>
              <div className="w-12 h-12 relative flex items-center justify-center">
                <Shield size={48} className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] absolute" strokeWidth={1} />
                <span className="text-[14px] font-black text-amber-500 relative z-10 mb-1">XP</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-white">Level 12</span>
                  <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1"><Flame size={10} /> Legend Coder</span>
                </div>
                <div className="h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-white/5 mb-1">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: '70%' }} />
                </div>
                <span className="text-[9px] text-gray-500 font-bold">2450 / 3500 XP</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
