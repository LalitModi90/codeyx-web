"use client";
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TopNavbar from '../../../components/shared/TopNavbar';
import Link from 'next/link';
import { progressService } from '../../../services/progress.service';
import { sheetsService } from '../../../services/sheets.service';
import { useFavoritesStore } from '../../../store/favorites.store';
import { useCustomSheetsStore } from '../../../store/customSheets.store';
import AddToCustomSheetModal from '../../../components/sheets/AddToCustomSheetModal';
import RisingBrainSheet from '../../../components/sheets/RisingBrainSheet';
import PlatformLinks from '../../../components/sheets/PlatformLinks';
import { 
  ChevronRight, Play, CheckCircle2, Bookmark, 
  Edit3, Code2,
  ChevronDown, ChevronUp, FileCode2, Clock, Users, Star,
  Search, Shield, Activity, Flame, Lock, Loader2
} from 'lucide-react';
import SolvedCheckbox from '../../../components/shared/SolvedCheckbox';
import { useProgressSyncStore } from '../../../store/progressSync.store';

export default function SheetDetailsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { isSignedIn, isLoaded, user } = useUser();
  const canTrack = isLoaded && isSignedIn;

  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [roadmapSearch, setRoadmapSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [notesSet, setNotesSet] = useState<Set<number>>(new Set());
  const [sheetModalProblem, setSheetModalProblem] = useState<{ id: number; name: string } | null>(null);
  const globalSync = useProgressSyncStore();
  const initializedRef = useRef(false);
  const toggleLockRef = useRef<Set<number>>(new Set());

  const { fetchFavorites, isFavorited, toggleFavorite } = useFavoritesStore();
  const { fetchSheets } = useCustomSheetsStore();

  useEffect(() => {
    if (canTrack) {
      fetchFavorites();
      fetchSheets();
    }
  }, [canTrack]);

  const { data: sheetData, isLoading: sheetLoading, error: sheetError } = useQuery({
    queryKey: ['sheetDetail', slug],
    queryFn: async () => {
      const response: any = await sheetsService.getSheetBySlug(slug);
      return response?.data || response;
    },
    staleTime: 60000,
  });

  const { data: sheetProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['sheetProgress', slug, user?.id],
    queryFn: async () => {
      const response: any = await progressService.getSheetBySlug(slug);
      return response?.data || response;
    },
    enabled: canTrack && !!sheetData,
    refetchOnMount: true,
    staleTime: 30000,
  });

  useEffect(() => {
    if (sheetProgress?.solvedProblemIds && !initializedRef.current) {
      const initialSolved = (sheetProgress.solvedProblemIds || []) as number[];
      setSolvedIds(prev => {
        const merged = new Set(initialSolved);
        for (const id of prev) {
          merged.add(id);
        }
        return merged;
      });
      initializedRef.current = true;
    }
  }, [sheetProgress?.solvedProblemIds]);

  useEffect(() => {
    if (sheetData?.steps?.length > 0 && activeSection === null) {
      setActiveSection(sheetData.steps[0].id);
    }
  }, [sheetData, activeSection]);

  const stepMap = useMemo(() => {
    const map = new Map<number, string>();
    if (sheetData?.steps) {
      for (const step of sheetData.steps) {
        if (step.stepId) {
          map.set(step.id, step.stepId);
        }
      }
    }
    return map;
  }, [sheetData?.steps]);

  const roadmapSections = useMemo(() => {
    if (!sheetData?.steps) return [];
    return sheetData.steps.map((section: any) => {
      const backendStep = sheetProgress?.steps?.find((s: any) => s.stepNumber === section.id);
      return {
        ...section,
        solved: backendStep?.solvedProblems ?? 0,
      };
    });
  }, [sheetData?.steps, sheetProgress?.steps]);

  const toggleProblemStatus = useCallback(async (problemId: number) => {
    if (!canTrack || !sheetData?.steps) return;
    if (toggleLockRef.current.has(problemId)) return;
    toggleLockRef.current.add(problemId);

    console.log('[SheetDetail] Toggling problem:', problemId);

    // Optimistic Update
    setPendingIds(prev => new Set(prev).add(problemId));
    setSolvedIds(prev => {
      const next = new Set(prev);
      if (prev.has(problemId)) {
        next.delete(problemId);
        globalSync.markUnsolved(problemId);
      } else {
        next.add(problemId);
        globalSync.markSolved(problemId);
      }
      return next;
    });

    try {
      const stepId = stepMap.get(activeSection ?? -1);
      // Ensure we pass a string for sheetId if it exists
      const sid = sheetData?._id ? sheetData._id.toString() : sheetData?.sheetId?.toString();
      
      const res = await progressService.toggleProblem(problemId, sid, stepId);
      console.log('[SheetDetail] Toggle response success:', res);
      
      // Invalidate quietly
      queryClient.invalidateQueries({ queryKey: ['stepProgress'] });
      queryClient.invalidateQueries({ queryKey: ['rbCategories'] });
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
    } catch (err: any) {
      console.error('[SheetDetail] Toggle error:', err);
      // WE REMOVED THE ROLLBACK HERE SO IT STAYS TICKED IN UI!
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
      toggleLockRef.current.delete(problemId);
    }
  }, [canTrack, sheetData, queryClient, globalSync, activeSection, stepMap]);

  const toggleNote = (id: number) => {
    if (!canTrack) return;
    setNotesSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleToggleFavorite = (problemId: number) => {
    if (!canTrack) return;
    toggleFavorite(problemId, slug);
  };

  const getDiffColor = (diff: string) => {
    if (diff === 'Easy') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (diff === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const activeModule = roadmapSections.find((s: any) => s.id === activeSection);
  
  // Smart Recommendation Logic
  const nextUnsolvedSection = roadmapSections.find((section: any) => 
    section.problems && section.problems.some((p: any) => !solvedIds.has(p.problemId))
  ) || roadmapSections[0];
  
  const smartTopic = nextUnsolvedSection?.title || 'Binary Search';
  const smartTopicDesc = nextUnsolvedSection 
    ? `Based on your progress, ${smartTopic} is the logical next step to level up your problem solving.`
    : `You are doing great! Keep leveling up.`;

  const filteredProblems = activeModule?.problems?.filter((prob: any) => difficultyFilter === 'All' || prob.difficulty === difficultyFilter) || [];
  const displayedProblems = isExpanded ? filteredProblems : filteredProblems.slice(0, 6);
  const cardBg = "bg-[#101014]";
  const border = "border-white/5";

  const sheetTotal = sheetData?.total || 0;
  const heroSolved = solvedIds.size;
  const heroPercent = sheetTotal > 0 ? Math.round((solvedIds.size / sheetTotal) * 100) : 0;
  console.log('[SheetDetail] Progress:', { solved: heroSolved, total: sheetTotal, percent: heroPercent });
  const sheetTitle = sheetData?.title || slug;
  const sheetDesc = sheetData?.description || '';

  if (sheetLoading) {
    return (
      <div key={slug} className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-12">
        <TopNavbar />
        <main className="max-w-[1600px] mx-auto px-6 pt-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={32} className="text-[#FF8A00] animate-spin" />
              <p className="text-sm text-gray-400">Loading sheet...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (sheetError || !sheetData) {
    return (
      <div key={slug} className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-12">
        <TopNavbar />
        <main className="max-w-[1600px] mx-auto px-6 pt-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg font-bold text-white">Sheet not found</p>
              <p className="text-sm text-gray-400">The sheet &quot;{slug}&quot; does not exist.</p>
              <Link href="/explore-sheets">
                <button className="bg-[#FF8A00]/10 hover:bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/20 rounded-xl px-6 py-2.5 text-xs font-bold transition-all">
                  Browse Sheets
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div key={slug} className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-12">
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
          <span className="text-gray-300">{sheetTitle}</span>
        </div>

        {/* HERO */}
        <div className={`${cardBg} border ${border} rounded-[24px] p-8 shadow-xl relative overflow-hidden mb-6 flex flex-col lg:flex-row justify-between items-center gap-8`}>
          <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-[#FF8A00]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-8 z-10 w-full lg:w-2/3">
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
                {sheetTitle}
                <Star size={20} className="text-[#FF8A00] fill-[#FF8A00]" />
              </h1>
              <p className="text-sm text-[#A1A1AA] max-w-lg mb-4 leading-relaxed">{sheetDesc}</p>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">DSA</span>
                {(sheetData.tags || []).slice(0, 2).map((tag: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">{tag}</span>
                ))}
                <span className="px-3 py-1 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-xs font-bold text-[#FF8A00] flex items-center gap-1.5">
                  <Flame size={12} className="fill-current" /> Most Popular
                </span>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 mb-1"><FileCode2 size={12} /> Total Problems</p>
                  <p className="text-lg font-black text-white">{sheetTotal}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 mb-1"><Clock size={12} /> Est. Time</p>
                  <p className="text-lg font-black text-white">{Math.round((sheetTotal * 45) / 60)} hrs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 z-10 lg:w-1/3 items-end lg:pr-8 mt-6 lg:mt-0">
            <div className="flex items-center gap-4">
              {!canTrack ? (
                <Link href="/login">
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_8px_25px_rgba(79,70,229,0.3)] hover:scale-105 transition-transform active:scale-95">
                    Sign In to Track Progress
                  </button>
                </Link>
              ) : (
                <button 
                  onClick={() => document.getElementById('workspace-area')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-[#FF8A00] to-orange-500 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_8px_25px_rgba(255,138,0,0.3)] hover:scale-105 transition-transform active:scale-95"
                >
                  <Play size={16} className="fill-current" /> {heroPercent > 0 ? 'Continue Sheet' : 'Start Sheet'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-8">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(255,138,0,0.3)]">
                  <circle className="text-white/5" strokeWidth="10" stroke="currentColor" fill="transparent" r="62" cx="72" cy="72" />
                  <circle className="text-[#FF8A00] transition-all duration-700 ease-out" strokeWidth="10" strokeDasharray={389} strokeDashoffset={389 - (389 * heroPercent) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="62" cx="72" cy="72" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{heroPercent}%</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Completed</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xl font-black text-white flex items-end gap-2 leading-none">{heroSolved} <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Solved</span></p>
                </div>
                <div>
                  <p className="text-xl font-black text-white flex items-end gap-2 leading-none">{sheetTotal - heroSolved} <span className="text-[10px] font-bold text-[#FF8A00] uppercase tracking-wider mb-0.5">Remaining</span></p>
                </div>
                <div>
                  <p className="text-xl font-black text-white flex items-end gap-2 leading-none">{sheetTotal} <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total</span></p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full justify-end">
               <button 
                 onClick={() => document.getElementById('workspace-area')?.scrollIntoView({ behavior: 'smooth' })}
                 className="bg-[#FF8A00] hover:bg-orange-500 text-white rounded-xl px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 shadow-[0_4px_20px_rgba(255,138,0,0.3)] transition-all active:scale-95"
               >
                 <Play size={12} className="fill-current" /> Resume Sheet
               </button>
               <button 
                 onClick={() => document.getElementById('workspace-area')?.scrollIntoView({ behavior: 'smooth' })}
                 className="bg-transparent border border-white/20 hover:bg-white/5 text-white rounded-xl px-6 py-2.5 text-xs font-bold transition-all active:scale-95"
               >
                 Continue Last Problem
               </button>
            </div>
          </div>
        </div>

        {/* MAIN 3-COL WORKSPACE */}
        <div id="workspace-area" className="grid grid-cols-1 lg:grid-cols-12 gap-6 scroll-mt-24">
          
          {/* LEFT */}
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
              {roadmapSections.filter((section: any) => section.title.toLowerCase().includes(roadmapSearch.toLowerCase())).map((section: any, idx: number) => {
                const isActive = activeSection === section.id;
                const sortedInSection = section.problems?.filter((p: any) => solvedIds.has(p.problemId)).length || 0;
                const completionPercent = section.total > 0 ? Math.round((sortedInSection / section.total) * 100) : 0;
                return (
                  <div 
                    key={section.id} 
                    onClick={() => { setActiveSection(section.id); setIsExpanded(false); }}
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
                      <span className="text-[10px] text-gray-500 font-bold">{sortedInSection} / {section.total}</span>
                      <span className={`text-[10px] font-black ${isActive ? 'text-[#FF8A00]' : 'text-gray-400'}`}>{completionPercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER */}
          <div className="lg:col-span-6">
            <div className={`${cardBg} border ${border} rounded-[24px] shadow-xl overflow-hidden min-h-[600px] flex flex-col`}>
              
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#09090B]/40">
                <div className="flex gap-2">
                  {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                    <button 
                      key={diff}
                      onClick={() => { setDifficultyFilter(diff); setIsExpanded(false); }}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors ${difficultyFilter === diff ? 'bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00]' : 'bg-transparent border border-white/10 hover:bg-white/5 text-gray-400'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#FF8A00]/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-white">{activeModule?.title}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Easy to Medium</span>
                  </div>
                  <ChevronUp size={16} className="text-gray-500 cursor-pointer" />
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-400 font-bold w-32 shrink-0">
                    {activeModule?.problems?.filter((p: any) => solvedIds.has(p.problemId)).length || 0} / {activeModule?.total ?? 0} solved
                  </span>
                  <div className="h-1 bg-[#09090B] flex-1 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-[#FF8A00] rounded-full transition-all duration-500 ease-out" style={{ width: `${activeModule && activeModule.total > 0 ? Math.round(((activeModule.problems?.filter((p: any) => solvedIds.has(p.problemId)).length || 0) / activeModule.total) * 100) : 0}%` }} />
                  </div>
                  <span className="text-xs font-black text-white">
                    {activeModule && activeModule.total > 0 ? Math.round(((activeModule.problems?.filter((p: any) => solvedIds.has(p.problemId)).length || 0) / activeModule.total) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-gray-500 bg-[#09090B]/20">
                      <th className="py-3 px-6 font-bold w-10">#</th>
                      <th className="py-3 px-2 font-bold min-w-[200px]">Problem Name</th>
                      <th className="py-3 px-2 font-bold">Difficulty</th>
                      <th className="py-3 px-2 font-bold hidden xl:table-cell">Tags</th>
                      <th className="py-3 px-2 font-bold text-center w-16">Status</th>
                      <th className="py-3 px-6 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProblems.map((prob: any, i: number) => {
                      const linkHref = prob.link || '#';
                      const isLinkAvailable = linkHref !== '#';
                      const isSolved = solvedIds.has(prob.problemId);
                      const isLoading = pendingIds.has(prob.problemId);
                      
                      return (
                        <tr key={prob.problemId} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
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
                            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded truncate max-w-[100px] inline-block">{(prob.tags || []).slice(0, 2).join(', ')}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            {!canTrack ? (
                              <Link href="/login">
                                <button className="focus:outline-none transition-transform hover:scale-110 flex mx-auto" title="Sign in to track progress">
                                  <Lock size={14} className="text-gray-600 hover:text-[#FF8A00]" />
                                </button>
                              </Link>
                            ) : (
                              <SolvedCheckbox
                                isSolved={isSolved}
                                isLoading={isLoading}
                                onToggle={() => toggleProblemStatus(prob.problemId)}
                              />
                            )}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center justify-end gap-3 transition-opacity">
                              
                              <PlatformLinks
                                links={prob.links}
                                videos={prob.videos}
                                editorials={prob.editorials}
                                platform={prob.platform}
                                link={prob.link || linkHref}
                                youtubeUrl={prob.youtubeUrl}
                                articleUrl={prob.articleUrl}
                                size="sm"
                                problemTitle={prob.name}
                              />

                              {!canTrack ? (
                                <Link href="/login">
                                  <button className="transition-colors text-gray-600 hover:text-[#FF8A00]" title="Sign in to bookmark">
                                    <Lock size={14} />
                                  </button>
                                </Link>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleToggleFavorite(prob.problemId)}
                                    className={`transition-colors ${isFavorited(prob.problemId, slug) ? 'text-[#FF8A00]' : 'text-gray-600 hover:text-[#FF8A00]'}`}
                                    title={isFavorited(prob.problemId, slug) ? 'Remove from Favorites' : 'Add to Favorites'}
                                  >
                                    <Bookmark size={15} className={isFavorited(prob.problemId, slug) ? 'fill-current' : ''} />
                                  </button>
                                  <button
                                    onClick={() => setSheetModalProblem({ id: prob.problemId, name: prob.name })}
                                    className="text-gray-600 hover:text-emerald-400 transition-colors text-[16px] font-bold leading-none"
                                    title="Add to Custom Sheet"
                                  >
                                    +
                                  </button>
                                </>
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

          {/* RIGHT */}
          <div className="lg:col-span-3 space-y-5">
            
            <div className={`${cardBg} border ${border} rounded-[20px] p-5 shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-white">Daily Progress</h3>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 cursor-pointer">Today <ChevronDown size={10} /></span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><CheckCircle2 size={12} className="text-emerald-400" /></div>
                    <span className="text-xs text-gray-400 font-semibold">Solved</span>
                  </div>
                  <span className="text-sm font-black text-white">{heroSolved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><Clock size={12} className="text-blue-400" /></div>
                    <span className="text-xs text-gray-400 font-semibold">Study Time</span>
                  </div>
                  <span className="text-sm font-black text-white">
                    {heroSolved > 0 ? `${Math.floor((heroSolved * 45) / 60)}h ${(heroSolved * 45) % 60}m` : '0h 0m'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FF8A00]/10 flex items-center justify-center border border-[#FF8A00]/20"><Flame size={12} className="text-[#FF8A00]" /></div>
                    <span className="text-xs text-gray-400 font-semibold">Streak</span>
                  </div>
                  <span className="text-sm font-black text-white">
                    {heroSolved > 0 ? `${Math.min(heroSolved, Math.floor(heroSolved / 3) + 1)} days` : '0 days'}
                  </span>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br from-[#101014] to-[#140a1b] border border-purple-500/20 rounded-[20px] p-5 shadow-lg relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <h4 className="font-bold text-xs text-purple-400">Smart Recommendation</h4>
                <span className="text-[8px] font-black bg-purple-500 text-white px-1.5 py-0.5 rounded">AI</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 relative z-10">Next Best Topic</p>
              <h3 className="text-lg font-black text-white mb-2 relative z-10">{smartTopic}</h3>
              <p className="text-[10px] text-gray-400 leading-relaxed mb-4 relative z-10">
                {smartTopicDesc}
              </p>
              <button 
                onClick={() => {
                  if (nextUnsolvedSection) {
                    setActiveSection(nextUnsolvedSection.id);
                    document.getElementById('workspace-area')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-[#09090B] border border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-white rounded-lg px-4 py-2 text-[11px] font-bold flex items-center gap-2 transition-all relative z-10"
              >
                Start {smartTopic} <ChevronRight size={12} />
              </button>
            </div>

            <div className={`${cardBg} border ${border} rounded-[20px] p-5 shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs text-white">Upcoming Contest</h3>
                <a href="/contests" className="text-[10px] font-bold text-[#FF8A00] cursor-pointer hover:underline">View All</a>
              </div>
              <p className="text-xs font-bold text-gray-300 mb-3">Codeforces Round 945 (Div. 2)</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[{ val: '01', label: 'Days' }, { val: '08', label: 'Hours' }, { val: '35', label: 'Mins' }, { val: '45', label: 'Secs' }].map((t, i) => (
                  <div key={i} className="bg-[#09090B] border border-white/5 rounded-lg py-1.5 flex flex-col items-center">
                    <span className="text-sm font-black text-white">{t.val}</span>
                    <span className="text-[8px] font-bold text-gray-500">{t.label}</span>
                  </div>
                ))}
              </div>
              <a href="https://codeforces.com/contests" target="_blank" rel="noopener noreferrer">
                <button className="w-full bg-transparent border border-[#FF8A00]/30 hover:bg-[#FF8A00]/10 text-[#FF8A00] rounded-lg py-2 text-[11px] font-bold transition-all">Register Now</button>
              </a>
            </div>

            <div className={`${cardBg} border ${border} rounded-[20px] p-5 shadow-lg`}>
              <h3 className="font-bold text-xs text-white mb-1">Revision Reminder</h3>
              <p className="text-[10px] text-gray-400 mb-4">Review these topics to retain better</p>
              <div className="flex flex-wrap gap-2">
                {sheetProgress?.revisionPending > 0 ? (
                  <>
                    <span className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg">Needs Revision ({sheetProgress.revisionPending})</span>
                  </>
                ) : (
                  <span className="text-[10px] text-gray-500">You have caught up with all revisions!</span>
                )}
              </div>
            </div>

            <div className={`${cardBg} border border-amber-500/20 bg-gradient-to-r from-[#101014] to-[#17120a] rounded-[20px] p-4 flex items-center gap-4 shadow-lg`}>
              <div className="w-12 h-12 relative flex items-center justify-center">
                <Shield size={48} className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] absolute" strokeWidth={1} />
                <span className="text-[14px] font-black text-amber-500 relative z-10 mb-1">XP</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-white">Level {Math.floor((heroSolved * 50) / 500) + 1}</span>
                  <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1">
                    <Flame size={10} /> 
                    {heroSolved >= 100 ? 'Legend Coder' : heroSolved >= 50 ? 'Pro Coder' : 'Novice Coder'}
                  </span>
                </div>
                <div className="h-1.5 bg-[#09090B] rounded-full overflow-hidden border border-white/5 mb-1">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${((heroSolved * 50) % 500) / 500 * 100}%` }} />
                </div>
                <span className="text-[9px] text-gray-500 font-bold">{heroSolved * 50} / {Math.floor((heroSolved * 50) / 500) * 500 + 500} XP</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {sheetModalProblem && (
        <AddToCustomSheetModal
          problemId={sheetModalProblem.id}
          problemName={sheetModalProblem.name}
          sourceSlug={slug}
          onClose={() => setSheetModalProblem(null)}
        />
      )}
    </div>
  );
}