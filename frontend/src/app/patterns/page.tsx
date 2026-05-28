"use client";
import { useState, useMemo, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import TopNavbar from '../../components/shared/TopNavbar';
import {
  LayoutList, Search, Layers, BrainCircuit, GitBranch, Link as LinkIcon,
  TreeDeciduous, BarChart4, RefreshCw, Binary, Zap,
  Type, IterationCw, GitCommitVertical, GitFork,
  ChevronDown, ChevronRight, Target, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { patternsService } from '../../services/patterns.service';

const iconMap: Record<string, any> = {
  LayoutList, Search, Layers, BrainCircuit, GitBranch, LinkIcon,
  TreeDeciduous, BarChart4, RefreshCw, Binary, Zap,
  Type, IterationCw, GitCommitVertical, GitFork,
};

const difficultyColors: Record<string, string> = {
  Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Advanced: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

const difficultyFilterOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function PatternsPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    async function fetchCategories() {
      setIsLoading(true);
      setFetchError('');

      try {
        let result: any[] = [];

        if (isSignedIn) {
          try {
            const response: any = await patternsService.getCategoriesWithProgress();
            result = response?.data || response || [];
          } catch (progressErr) {
            console.warn('[Patterns] Progress API failed, falling back to public:', progressErr);
            const response: any = await patternsService.getCategories();
            result = response?.data || response || [];
          }
        } else {
          const response: any = await patternsService.getCategories();
          result = response?.data || response || [];
        }

        if (!cancelled) {
          if (Array.isArray(result) && result.length > 0) {
            setCategoriesData(result);
          } else {
            console.warn('[Patterns] API returned empty data - debugging info:');
            console.warn('[Patterns] result type:', typeof result, 'isArray:', Array.isArray(result));
            console.warn('[Patterns] result:', JSON.stringify(result).slice(0, 500));
            setFetchError('API returned empty data. Verify database seeding and API connectivity.');
          }
        }
      } catch (err: any) {
        console.error('[Patterns] Fetch error:', err);
        if (!cancelled) setFetchError(err?.message || 'Failed to load patterns');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchCategories();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn]);

  const filteredCategories = useMemo(() => {
    return categoriesData.map((cat: any) => ({
      ...cat,
      patterns: (cat.patterns || []).filter((p: any) => {
        const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
        const matchesSearch = !searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDifficulty && matchesSearch;
      }),
    })).filter((cat: any) => cat.patterns.length > 0);
  }, [categoriesData, difficultyFilter, searchQuery]);

  const toggleCategory = (id: string) => {
    setExpandedCategory(prev => prev === id ? null : id);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans overflow-x-hidden">
        <TopNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 size={32} className="text-[#FF8A00] animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-20">
      <TopNavbar />
      <main className="max-w-[1400px] mx-auto px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-[32px] font-extrabold text-white mb-2 flex items-center gap-2">
              Pattern-Based Learning <Target size={24} className="text-[#FF8A00]" />
            </h1>
            <p className="text-sm text-gray-400">
              Master DSA through reusable patterns. Each pattern groups related problems that share the same approach.
            </p>
          </div>
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
          <div className="flex items-center gap-2">
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 size={32} className="text-[#FF8A00] animate-spin" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && fetchError && (
          <div className="bg-[#111216]/60 border border-rose-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <Target size={40} className="mx-auto text-rose-400 mb-3" />
            <p className="text-sm text-rose-400 font-bold mb-1">Data Loading Error</p>
            <p className="text-xs text-gray-400">{fetchError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2 bg-[#FF8A00] text-white text-xs font-bold rounded-xl hover:bg-[#e67a00] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Categories */}
        {!isLoading && !fetchError && (
          <div className="space-y-4">
            {filteredCategories.length === 0 && categoriesData.length === 0 && (
              <div className="text-center py-16">
                <Target size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-sm">No pattern categories found. The database may need seeding.</p>
                <p className="text-gray-600 text-xs mt-2">Run <code className="text-[#FF8A00]">node seed/seedPatterns.js</code> in the backend directory.</p>
              </div>
            )}

            {filteredCategories.length === 0 && categoriesData.length > 0 && (
              <div className="text-center py-16">
                <Target size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-sm">No patterns match your filters. Try adjusting your search or difficulty filter.</p>
              </div>
            )}

            {filteredCategories.map((cat: any, ci: number) => {
              const CatIcon = iconMap[cat.icon as string] || LayoutList;
              const isExpanded = expandedCategory === cat._id;

              return (
                <div
                  key={cat._id}
                  className="bg-[#111216]/40 border border-white/5 rounded-2xl overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(cat._id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A00]/20 to-orange-500/5 border border-[#FF8A00]/20 flex items-center justify-center">
                        <CatIcon size={20} className="text-[#FF8A00]" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-base font-bold text-white">{cat.title}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {cat.totalProblems !== undefined && (
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Progress</div>
                          <div className="text-sm font-bold text-white">
                            {cat.solvedProblems || 0}/{cat.totalProblems || 0}
                          </div>
                        </div>
                      )}
                      {cat.progressPercentage !== undefined && (
                        <div className="w-16">
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FF8A00] rounded-full transition-all duration-500"
                              style={{ width: `${cat.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Pattern Cards */}
                  {isExpanded && (
                    <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(cat.patterns || []).length === 0 && (
                        <div className="col-span-full text-center py-8 text-sm text-gray-500">
                          No patterns match your filters.
                        </div>
                      )}
                      {(cat.patterns || []).map((pattern: any) => {
                        const diffColor = difficultyColors[pattern.difficulty] || 'text-gray-400 bg-white/5';
                        const progress = pattern.progressPercentage ?? 0;

                        return (
                          <Link
                            key={pattern._id}
                            href={`/patterns/${pattern._id}`}
                            className="group block bg-[#0B0C10] border border-white/5 hover:border-[#FF8A00]/30 rounded-xl p-4 transition-all"
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
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#FF8A00] to-orange-400 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
