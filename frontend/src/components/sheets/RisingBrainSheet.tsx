"use client";
import { useState, useMemo, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutList, Search, Layers, BrainCircuit, GitBranch, Link,
  TreeDeciduous, BarChart4, RefreshCw, Binary, Zap,
  ChevronDown, ChevronRight, Target, CheckCircle2,
  ExternalLink, Youtube, BookOpen, Loader2, Sparkles, ArrowLeft,
  Lock, FileCode2,
} from 'lucide-react';
import { patternsService } from '../../services/patterns.service';
import { progressService } from '../../services/progress.service';
import PlatformLinks from './PlatformLinks';
import SolvedCheckbox from '../shared/SolvedCheckbox';
import { useProgressSyncStore } from '../../store/progressSync.store';

const iconMap: Record<string, any> = {
  LayoutList, Search, Layers, BrainCircuit, GitBranch, Link,
  TreeDeciduous, BarChart4, RefreshCw, Binary, Zap,
};

const difficultyColors: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const patternDiffColors: Record<string, string> = {
  Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Advanced: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const difficultyFilterOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const problemDifficultyOptions = ['All', 'Easy', 'Medium', 'Hard'];

export default function RisingBrainSheet({ slug, sheetData }: { slug: string; sheetData: any }) {
  const { isSignedIn, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const globalSync = useProgressSyncStore();
  const toggleLockRef = useRef<Set<number>>(new Set());

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [problemDiffFilter, setProblemDiffFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories with progress
  const { data: categoriesData = [], isLoading } = useQuery({
    queryKey: ['rbCategories', isSignedIn],
    queryFn: async () => {
      if (isSignedIn) {
        const r: any = await patternsService.getCategoriesWithProgress();
        return r?.data || r || [];
      }
      const r: any = await patternsService.getCategories();
      return r?.data || r || [];
    },
    staleTime: 15000,
    enabled: isLoaded,
  });

  // Fetch active pattern detail
  const { data: patternDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['rbPatternDetail', activePatternId, isSignedIn],
    queryFn: async () => {
      if (!activePatternId) return null;
      const r: any = await patternsService.getPatternDetail(activePatternId);
      return r?.data || r;
    },
    staleTime: 10000,
    enabled: isLoaded && !!activePatternId,
  });

  // Toggle solve mutation (no auto-unmark)
  const toggleMutation = useMutation({
    mutationFn: async ({ problemId }: { problemId: number }) => {
      console.log('[RisingBrain] Toggling problem:', problemId);
      const res = await progressService.toggleProblem(problemId);
      console.log('[RisingBrain] Toggle response:', res);
      return res;
    },
    onMutate: async ({ problemId }) => {
      if (activePatternId) {
        const prev = queryClient.getQueryData(['rbPatternDetail', activePatternId]);
        const problem = (prev as any)?.problems?.find((p: any) => p.problemId === problemId);
        const newSolved = !problem?.solved;
        if (newSolved) globalSync.markSolved(problemId);
        else globalSync.markUnsolved(problemId);
        return { prev };
      }
    },
    onSuccess: (_data, { problemId }) => {
      toggleLockRef.current.delete(problemId);
      // Do NOT invalidate rbPatternDetail (it was already correct optimistically)
      queryClient.invalidateQueries({ queryKey: ['rbCategories'] });
      queryClient.invalidateQueries({ queryKey: ['sheetProgress'] });
      queryClient.invalidateQueries({ queryKey: ['stepProgress'] });
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
    },
    onError: (_err, { problemId }, ctx: any) => {
      toggleLockRef.current.delete(problemId);
      if (ctx?.prev) {
        const problem = ctx.prev?.problems?.find((p: any) => p.problemId === problemId);
        if (problem?.solved) globalSync.markSolved(problemId);
        else globalSync.markUnsolved(problemId);
        if (activePatternId) {
          queryClient.setQueryData(['rbPatternDetail', activePatternId], ctx.prev);
        }
      }
    },
  });

  const handleToggle = (problemId: number) => {
    if (!isSignedIn) return;
    if (toggleLockRef.current.has(problemId)) return;
    toggleLockRef.current.add(problemId);
    toggleMutation.mutate({ problemId });
  };

  // Filter categories by difficulty and search
  const filteredCategories = useMemo(() => {
    return (categoriesData as any[]).map((cat: any) => ({
      ...cat,
      patterns: (cat.patterns || []).filter((p: any) => {
        const md = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
        const ms = !searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.title.toLowerCase().includes(searchQuery.toLowerCase());
        return md && ms;
      }),
    })).filter((cat: any) => cat.patterns.length > 0);
  }, [categoriesData, difficultyFilter, searchQuery]);

  const toggleCategory = (id: string) => {
    setExpandedCategory(prev => prev === id ? null : id);
    setActivePatternId(null);
  };

  const openPattern = (patternId: string) => {
    setActivePatternId(prev => prev === patternId ? null : patternId);
  };

  const handleBackToCategories = () => {
    setActivePatternId(null);
  };

  // Problem list from pattern detail
  const filteredProblems = useMemo(() => {
    if (!patternDetail?.problems) return [];
    if (problemDiffFilter === 'All') return patternDetail.problems;
    return patternDetail.problems.filter((p: any) => p.difficulty === problemDiffFilter);
  }, [patternDetail?.problems, problemDiffFilter]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 size={32} className="text-[#FF8A00] animate-spin" />
      </div>
    );
  }

  // ─── PATTERN DETAIL VIEW ──────────────────────────────────────
  if (activePatternId && patternDetail) {
    const { pattern, category, totalProblems, solvedProblems, progressPercentage } = patternDetail;
    const diffColor = patternDiffColors[pattern.difficulty] || 'text-gray-400 bg-white/5';

    return (
      <div>
        {/* Back button */}
        <button
          onClick={handleBackToCategories}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>

        {/* Pattern Hero */}
        <div className="bg-[#111216]/60 border border-white/5 rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8A00]/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-extrabold text-white">{pattern.title}</h1>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${diffColor}`}>
                    {pattern.difficulty}
                  </span>
                </div>
                {pattern.description && (
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
          {problemDifficultyOptions.map(d => (
            <button
              key={d}
              onClick={() => setProblemDiffFilter(d)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                problemDiffFilter === d
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
            return (
              <div
                key={problem.problemId}
                className="group bg-[#111216]/40 border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all"
              >
                <SolvedCheckbox
                  isSolved={problem.solved}
                  isLoading={toggleMutation.isPending && toggleMutation.variables?.problemId === problem.problemId}
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
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── CATEGORY / PATTERN LIST VIEW ──────────────────────────────
  return (
    <div>
      {/* Sheet Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-white mb-2 flex items-center gap-2">
          <BrainCircuit size={28} className="text-[#FF8A00]" /> RisingBrain Pattern Sheet
        </h1>
        <p className="text-sm text-gray-400">
          Master DSA through reusable patterns. Each pattern groups problems that share the same technique.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search patterns or categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#111216] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF8A00]/40 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {difficultyFilterOptions.map(d => (
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
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <Target size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm">No patterns found. Try adjusting your filters.</p>
          </div>
        )}

        {filteredCategories.map((cat: any, ci: number) => {
          const CatIcon = iconMap[cat.icon as string] || LayoutList;
          const isExpanded = expandedCategory === cat._id;

          return (
            <div
              key={cat._id}
              className="bg-[#111216]/40 border border-white/5 rounded-2xl overflow-hidden transition-all"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat._id)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF8A00]/20 to-orange-500/5 border border-[#FF8A00]/20 flex items-center justify-center">
                    <CatIcon size={22} className="text-[#FF8A00]" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-base font-bold text-white">{cat.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {cat.totalProblems !== undefined && (
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-gray-500">Progress</div>
                      <div className="text-sm font-bold text-white">
                        {cat.solvedProblems || 0}/{cat.totalProblems || 0}
                      </div>
                    </div>
                  )}
                  {cat.progressPercentage !== undefined && (
                    <div className="w-20 hidden sm:block">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF8A00] rounded-full transition-all duration-500"
                          style={{ width: `${cat.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Pattern Cards */}
              {isExpanded && (
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cat.patterns.map((pattern: any) => {
                      const diffColor = patternDiffColors[pattern.difficulty] || 'text-gray-400 bg-white/5 border-white/10';
                      const progress = pattern.progressPercentage ?? 0;
                      const isActive = activePatternId === pattern._id;

                      return (
                        <button
                          key={pattern._id}
                          onClick={() => openPattern(pattern._id)}
                          className={`group block w-full text-left bg-[#0B0C10] border rounded-xl p-4 transition-all ${
                            isActive
                              ? 'border-[#FF8A00]/50 bg-[#FF8A00]/5'
                              : 'border-white/5 hover:border-[#FF8A00]/30'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-sm font-bold text-white group-hover:text-[#FF8A00] transition-colors">
                              {pattern.title}
                            </h3>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${diffColor}`}>
                              {pattern.difficulty}
                            </span>
                          </div>
                          {pattern.description && (
                            <p className="text-[11px] text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                              {pattern.description}
                            </p>
                          )}
                          {pattern.totalProblems !== undefined && (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] text-gray-400">
                                  {pattern.solvedProblems || 0} / {pattern.totalProblems} solved
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">{progress}%</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#FF8A00] to-orange-400 rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {!pattern.totalProblems && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <FileCode2 size={12} />
                              <span>Click to view problems</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
