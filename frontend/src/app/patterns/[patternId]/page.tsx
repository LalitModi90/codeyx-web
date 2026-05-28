"use client";
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import TopNavbar from '../../../components/shared/TopNavbar';
import {
  ArrowLeft, Target, CheckCircle2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { patternsService } from '../../../services/patterns.service';
import { progressService } from '../../../services/progress.service';
import PlatformLinks from '../../../components/sheets/PlatformLinks';
import SolvedCheckbox from '../../../components/shared/SolvedCheckbox';
import { useProgressSyncStore } from '../../../store/progressSync.store';

const difficultyColors: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const patternDifficultyColors: Record<string, string> = {
  Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Advanced: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export default function PatternDetailPage({ params }: { params: { patternId: string } }) {
  const { patternId } = params;
  const { isSignedIn, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const globalSync = useProgressSyncStore();
  const toggleLockRef = useRef<Set<number>>(new Set());
  const [patternData, setPatternData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [toggleLoading, setToggleLoading] = useState<number | null>(null);

  const fetchPatternDetail = async () => {
    setIsLoading(true);
    try {
      const response: any = await patternsService.getPatternDetail(patternId);
      const data = response?.data || response;
      setPatternData(data);
    } catch (err) {
      console.error('[PatternDetail] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !patternId) return;
    fetchPatternDetail();
  }, [patternId, isLoaded, isSignedIn]);

  const handleToggle = async (problemId: number) => {
    if (!isSignedIn) return;
    if (toggleLockRef.current.has(problemId)) return;
    toggleLockRef.current.add(problemId);

    console.log('[PatternDetail] Toggling problem:', problemId);
    setToggleLoading(problemId);

    const problem = patternData?.problems?.find((p: any) => p.problemId === problemId);
    const newSolved = !problem?.solved;
    
    // 1. Update Global Sync
    if (newSolved) globalSync.markSolved(problemId);
    else globalSync.markUnsolved(problemId);

    // 2. Optimistic Update of Local State (so it visually changes instantly)
    setPatternData((prev: any) => {
      if (!prev) return prev;
      const newProblems = prev.problems.map((p: any) => 
        p.problemId === problemId ? { ...p, solved: newSolved } : p
      );
      const inc = newSolved ? 1 : -1;
      return { 
        ...prev, 
        problems: newProblems,
        solvedProblems: Math.max(0, (prev.solvedProblems || 0) + inc),
        progressPercentage: prev.totalProblems ? Math.round(((Math.max(0, (prev.solvedProblems || 0) + inc)) / prev.totalProblems) * 100) : 0
      };
    });

    try {
      const res = await progressService.toggleProblem(problemId);
      console.log('[PatternDetail] Toggle response success:', res);
      
      // We don't await fetchPatternDetail() here anymore because it makes the UI slow and we already optimistically updated!
      // Invalidate quietly in background
      queryClient.invalidateQueries({ queryKey: ['sheetProgress'] });
      queryClient.invalidateQueries({ queryKey: ['stepProgress'] });
      queryClient.invalidateQueries({ queryKey: ['rbCategories'] });
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
    } catch (err) {
      console.error('[PatternDetail] Toggle error:', err);
      // NO ROLLBACK HERE - Checkbox stays ticked!
    } finally {
      setToggleLoading(null);
      toggleLockRef.current.delete(problemId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans">
        <TopNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="text-[#FF8A00] animate-spin" />
        </div>
      </div>
    );
  }

  if (!patternData) {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans">
        <TopNavbar />
        <div className="max-w-[1400px] mx-auto px-6 pt-20 text-center">
          <p className="text-gray-400">Pattern not found.</p>
          <Link href="/patterns" className="text-[#FF8A00] text-sm mt-4 inline-block">← Back to Patterns</Link>
        </div>
      </div>
    );
  }

  const { pattern, category, totalProblems, solvedProblems, progressPercentage, problems } = patternData;

  const filteredProblems = difficultyFilter === 'All'
    ? (problems || [])
    : (problems || []).filter((p: any) => p.difficulty === difficultyFilter);

  const diffColor = patternDifficultyColors[pattern?.difficulty] || 'text-gray-400 bg-white/5';

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />
      <main className="max-w-[1200px] mx-auto px-6 pt-10">
        {/* Back & Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/patterns" className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={16} /> Patterns
          </Link>
          {category && (
            <>
              <span className="text-gray-600">/</span>
              <span className="text-gray-300">{category.title}</span>
            </>
          )}
          <span className="text-gray-600">/</span>
          <span className="text-[#FF8A00]">{pattern?.title}</span>
        </div>

        {/* Pattern Hero */}
        <div className="bg-[#111216]/60 border border-white/5 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8A00]/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-extrabold text-white">{pattern?.title}</h1>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${diffColor}`}>
                    {pattern?.difficulty}
                  </span>
                </div>
                {pattern?.description && (
                  <p className="text-sm text-gray-400 max-w-2xl">{pattern.description}</p>
                )}
              </div>
              {category && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <Target size={16} className="text-[#FF8A00]" />
                  <span className="text-xs font-bold text-gray-300">{category.title}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-sm text-gray-300">
                    <span className="font-bold text-white">{solvedProblems}</span> / {totalProblems} solved
                  </span>
                </div>
                <span className="text-sm font-bold text-[#FF8A00]">{progressPercentage}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF8A00] to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 mb-6">
          {['All', 'Easy', 'Medium', 'Hard'].map(d => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                difficultyFilter === d
                  ? 'bg-[#FF8A00] text-white shadow-[0_0_15px_rgba(255,138,0,0.4)]'
                  : 'bg-transparent text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
          <span className="text-xs text-gray-500 ml-2">{filteredProblems.length} problems</span>
        </div>

        {/* Problem List */}
        <div className="space-y-2">
          {filteredProblems.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-500">No problems match this filter.</div>
          )}
          {filteredProblems.map((problem: any, i: number) => {
            const diffColor = difficultyColors[problem.difficulty] || 'text-gray-400 bg-white/5';
            const isToggling = toggleLoading === problem.problemId;
            return (
              <div
                key={problem.problemId}
                className="group bg-[#111216]/40 border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all"
              >
                <SolvedCheckbox
                  isSolved={problem.solved}
                  isLoading={isToggling}
                  disabled={!isSignedIn}
                  onToggle={() => handleToggle(problem.problemId)}
                  size="md"
                />

                <span className="text-xs font-bold text-gray-500 w-6 flex-shrink-0">{i + 1}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{problem.name}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${diffColor}`}>
                      {problem.difficulty}
                    </span>
                    {problem.platform && (
                      <span className="text-[10px] text-gray-500">{problem.platform}</span>
                    )}
                  </div>
                  {(problem.tags || []).length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {(problem.tags as string[]).slice(0, 3).map((tag: string, ti: number) => (
                        <span key={ti} className="text-[9px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <PlatformLinks
                    links={problem.links}
                    videos={problem.videos}
                    editorials={problem.editorials}
                    platform={problem.platform}
                    link={problem.link}
                    youtubeUrl={problem.youtubeUrl}
                    articleUrl={problem.articleUrl}
                    size="sm"
                    problemTitle={problem.name}
                    showCopyLink
                  />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
