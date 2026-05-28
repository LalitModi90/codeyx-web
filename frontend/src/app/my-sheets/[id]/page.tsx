"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import TopNavbar from '../../../components/shared/TopNavbar';
import { customSheetsService } from '../../../services/customSheets.service';
import { progressService } from '../../../services/progress.service';
import { striverA2ZData } from '../../../data/striverA2Z';
import { useFavoritesStore } from '../../../store/favorites.store';
import AddToCustomSheetModal from '../../../components/sheets/AddToCustomSheetModal';
import { 
  ChevronRight, Play, CheckCircle2, Bookmark, 
  Edit3, Code2, FileCode2, Activity, Flame, Trash2,
  ChevronDown, Search, Lock, Target, Loader2, Plus
} from 'lucide-react';
import Link from 'next/link';
import SolvedCheckbox from '../../../components/shared/SolvedCheckbox';
import { useProgressSyncStore } from '../../../store/progressSync.store';

interface ProblemItem {
  problemId: number;
  sourceSlug: string;
  solved: boolean;
  solvedAt: string | null;
  addedAt: string;
}

const allSheetProblems = striverA2ZData.roadmap.flatMap((s) => s.problems || []);

export default function CustomSheetDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isFavorited } = useFavoritesStore();

  const [sheet, setSheet] = useState<any>(null);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const globalSync = useProgressSyncStore();
  const toggleLockRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
      return;
    }
    if (isSignedIn) loadSheet();
  }, [isLoaded, isSignedIn, id]);

  const loadSheet = async () => {
    setIsLoading(true);
    try {
      const [sheetRes, progRes]: any[] = await Promise.all([
        customSheetsService.getProgress(id),
        customSheetsService.getAll(),
      ]);
      const sheetData = sheetRes?.data || sheetRes;
      if (sheetData?.problems) {
        setProblems(sheetData.problems);
        const solvedIdsFromApi: number[] = (sheetData.problems as ProblemItem[])
          .filter((p: ProblemItem) => p.solved)
          .map((p: ProblemItem) => p.problemId);
        setSolvedIds(prev => {
          const merged = new Set(solvedIdsFromApi);
          for (const id of prev) {
            merged.add(id);
          }
          return merged;
        });
      }
      setSheet(sheetData);
    } catch {
      router.push('/my-sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSolve = async (problemId: number) => {
    if (toggleLockRef.current.has(problemId)) return;
    toggleLockRef.current.add(problemId);

    console.log('[CustomSheet] Toggling problem:', problemId);

    setPendingIds((prev) => new Set(prev).add(problemId));
    setSolvedIds((prev) => {
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
      const res = await progressService.toggleProblem(problemId);
      console.log('[CustomSheet] Toggle response:', res);
      queryClient.invalidateQueries({ queryKey: ['sheetProgress'] });
      queryClient.invalidateQueries({ queryKey: ['stepProgress'] });
      queryClient.invalidateQueries({ queryKey: ['rbCategories'] });
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
    } catch {
      console.error('[CustomSheet] Toggle error, rolling back');
      setSolvedIds((prev) => {
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
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
      toggleLockRef.current.delete(problemId);
    }
  };

  const handleRemove = async (problemId: number, sourceSlug: string) => {
    try {
      await customSheetsService.removeProblem({ sheetId: id, problemId, sourceSlug });
      setProblems((prev) => prev.filter((p) => !(p.problemId === problemId && p.sourceSlug === sourceSlug)));
    } catch {}
  };

  const getProblemDetails = (problemId: number) => {
    return allSheetProblems.find((p) => p.id === problemId);
  };

  const totalSolved = solvedIds.size;
  const totalProblems = problems.length;
  const progressPercent = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  const filtered = useMemo(() => {
    if (!search.trim()) return problems;
    const q = search.toLowerCase();
    return problems.filter((p) => {
      const detail = getProblemDetails(p.problemId);
      return detail?.name.toLowerCase().includes(q);
    });
  }, [problems, search]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#FF8A00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans overflow-x-hidden selection:bg-[#FF8A00]/30 pb-12">
      <TopNavbar />
      <main className="max-w-[1400px] mx-auto px-6 pt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
          <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
            <Activity size={12} /> Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/my-sheets" className="hover:text-white transition-colors">My Sheets</Link>
          <ChevronRight size={12} />
          <span className="text-gray-300">{sheet?.title || 'Sheet'}</span>
        </div>

        {/* Hero */}
        <div className="bg-[#101014] border border-white/5 rounded-[24px] p-8 shadow-xl relative overflow-hidden mb-6">
          <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-[#FF8A00]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-[#FF8A00]/20 to-orange-500/10 border border-[#FF8A00]/30 flex items-center justify-center shadow-lg">
                <Bookmark size={32} className="text-[#FF8A00]" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white mb-1">{sheet?.title}</h1>
                {sheet?.description && (
                  <p className="text-sm text-gray-400 mb-3">{sheet.description}</p>
                )}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                    <FileCode2 size={12} /> {totalProblems} problems
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(255,138,0,0.3)]">
                  <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="48" cx="56" cy="56" />
                  <circle className="text-[#FF8A00] transition-all duration-700 ease-out" strokeWidth="8" strokeDasharray={301} strokeDashoffset={301 - (301 * progressPercent) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="48" cx="56" cy="56" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{progressPercent}%</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Done</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-sm font-black text-white">{totalSolved} <span className="text-[9px] font-bold text-emerald-400 uppercase">Solved</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-[#FF8A00]" />
                  <span className="text-sm font-black text-white">{totalProblems - totalSolved} <span className="text-[9px] font-bold text-[#FF8A00] uppercase">Left</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Add */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="w-full bg-[#101014] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#FF8A00]/50"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#FF8A00]/20 transition-colors"
          >
            <Plus size={14} /> Add Problems
          </button>
        </div>

        {/* Problem Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {search ? 'No matching problems.' : 'No problems in this sheet yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-[#101014] border border-white/5 rounded-[24px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-gray-500 bg-[#09090B]/20">
                  <th className="py-3 px-6 font-bold w-10">#</th>
                  <th className="py-3 px-2 font-bold min-w-[200px]">Problem Name</th>
                  <th className="py-3 px-2 font-bold">Difficulty</th>
                  <th className="py-3 px-2 font-bold">Source</th>
                  <th className="py-3 px-2 font-bold text-center w-16">Status</th>
                  <th className="py-3 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prob, i) => {
                  const detail = getProblemDetails(prob.problemId);
                  const isSolved = solvedIds.has(prob.problemId);
                  const isLoading = pendingIds.has(prob.problemId);
                  const diffColor = detail?.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : detail?.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

                  return (
                    <tr key={`${prob.sourceSlug}-${prob.problemId}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 px-6 text-xs text-gray-500 font-mono font-bold">{i + 1}</td>
                      <td className="py-3 px-2">
                        <span className="text-xs font-bold text-gray-200 group-hover:text-[#FF8A00] transition-colors line-clamp-1">
                          {detail?.name || `Problem #${prob.problemId}`}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${diffColor}`}>
                          {detail?.difficulty || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] text-gray-500">{prob.sourceSlug}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <SolvedCheckbox
                          isSolved={isSolved}
                          isLoading={isLoading}
                          onToggle={() => toggleSolve(prob.problemId)}
                        />
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleRemove(prob.problemId, prob.sourceSlug)}
                            className="text-gray-600 hover:text-rose-400 transition-colors"
                            title="Remove from sheet"
                          >
                            <Trash2 size={14} />
                          </button>
                          {!isFavorited(prob.problemId, prob.sourceSlug) ? (
                            <button className="text-gray-600 hover:text-[#FF8A00] transition-colors" title="Favorite">
                              <Bookmark size={14} />
                            </button>
                          ) : (
                            <button className="text-[#FF8A00] transition-colors" title="Favorited">
                              <Bookmark size={14} className="fill-current" />
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
        )}
      </main>

      {showAddModal && (
        <AddToCustomSheetModal
          problemId={0}
          problemName=""
          sourceSlug=""
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
