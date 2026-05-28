'use client';
import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressService } from '../../services/progress.service';
import { useFavoritesStore } from '../../store/favorites.store';
import AddToCustomSheetModal from './AddToCustomSheetModal';
import NoteModal from './NoteModal';
import {
  Bookmark,
  Edit3,
  Loader2,
  Lock,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import PlatformLinks from './PlatformLinks';
import SolvedCheckbox from '../shared/SolvedCheckbox';
import { useProgressSyncStore } from '../../store/progressSync.store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ProblemRow {
  problemId: number;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: string;
  link: string;
  links?: Record<string, string>;
  youtubeUrl?: string;
  articleUrl?: string;
  videos?: Array<{ title?: string; platform?: string; url: string }>;
  editorials?: Array<{ platform?: string; url: string; title?: string }>;
  solved: boolean;
  revisionPending: boolean;
  notes: string;
  solvedAt: string | null;
}

interface StepProgressData {
  stepId: string;
  stepNumber: number;
  title: string;
  totalProblems: number;
  solvedProblems: number;
  progressPercentage: number;
  problems: ProblemRow[];
}

interface ProblemTableProps {
  stepId: string;
  sheetId: string;
  slug: string;
  canTrack: boolean;
}

// ---------------------------------------------------------------------------
// Difficulty badge colors
// ---------------------------------------------------------------------------
const diffColor = (d: string) => {
  if (d === 'Easy') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (d === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
};

// ---------------------------------------------------------------------------
// Platform icons (inline SVG / text)
// ---------------------------------------------------------------------------
const LeetCodeIcon = ({ dim = 16 }: { dim?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={dim} height={dim}>
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.939 5.939 0 0 0 1.271 1.543l5.096 5.107c.251.242.602.397 1.051.404a1.444 1.444 0 0 0 1.044-.45 1.47 1.47 0 0 0 .436-1.053c-.006-.445-.164-.783-.418-1.04l-5.553-5.555h18.114c.484 0 .918-.17 1.259-.49.341-.322.528-.75.528-1.229 0-.479-.187-.906-.528-1.229-.341-.32-.775-.489-1.259-.489H9.428L13.882 7.02c.287-.281.428-.619.428-.985 0-.367-.141-.705-.428-.986z" />
  </svg>
);

const YouTubeIcon = ({ dim = 16 }: { dim?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={dim} height={dim}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.134 0 12 0 12s0 3.866.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.866 24 12 24 12s0-3.866-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// ---------------------------------------------------------------------------
// ProblemTable Component
// ---------------------------------------------------------------------------
export default function ProblemTable({ stepId, sheetId, slug, canTrack }: ProblemTableProps) {
  const queryClient = useQueryClient();
  const { isFavorited, toggleFavorite } = useFavoritesStore();
  const globalSync = useProgressSyncStore();
  const toggleLockRef = useRef<Set<number>>(new Set());
  const [customSheetProblem, setCustomSheetProblem] = useState<{ id: number; name: string } | null>(null);
  const [noteProblem, setNoteProblem] = useState<ProblemRow | null>(null);
  const [diffFilter, setDiffFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // ---- Fetch step progress (includes merged problem list + progress) --------
  const { data: stepData, isLoading } = useQuery<StepProgressData>({
    queryKey: ['stepProgress', stepId],
    queryFn: async () => {
      const res: any = await progressService.getStepProgress(stepId);
      return res?.data || res;
    },
    enabled: !!stepId,
    staleTime: 30_000,
  });

  // ---- Stable solve toggle (NO auto-unmark) -----------------------------
  const solveMutation = useMutation({
    mutationFn: async ({ problemId, sheetId, stepId }: { problemId: number, sheetId: string, stepId: string }) => {
      console.log('[ProblemTable] Toggling problem:', problemId);
      const res = await progressService.toggleProblem(problemId, sheetId, stepId);
      console.log('[ProblemTable] Toggle response:', res);
      return res;
    },
    onMutate: async ({ problemId }) => {
      await queryClient.cancelQueries({ queryKey: ['stepProgress', stepId] });
      const prev = queryClient.getQueryData<StepProgressData>(['stepProgress', stepId]);

      const currentProblem = prev?.problems.find((p) => p.problemId === problemId);
      const newSolved = !currentProblem?.solved;
      console.log('[ProblemTable] Optimistic update:', { problemId, old: currentProblem?.solved, new: newSolved });

      if (newSolved) globalSync.markSolved(problemId);
      else globalSync.markUnsolved(problemId);

      queryClient.setQueryData<StepProgressData>(['stepProgress', stepId], (old) => {
        if (!old) return old;
        const problems = old.problems.map((p) =>
          p.problemId === problemId
            ? { ...p, solved: newSolved, solvedAt: newSolved ? new Date().toISOString() : null }
            : p
        );
        const solvedCount = problems.filter((p) => p.solved).length;
        return {
          ...old,
          problems,
          solvedProblems: solvedCount,
          progressPercentage:
            old.totalProblems > 0
              ? Math.round((solvedCount / old.totalProblems) * 100)
              : 0,
        };
      });

      return { prev };
    },
    onSuccess: (_data, { problemId }) => {
      console.log('[ProblemTable] Toggle succeeded for problem:', problemId);
      toggleLockRef.current.delete(problemId);
      // Invalidate OTHER views (not the current step query - it's already correct optimistically)
      queryClient.invalidateQueries({ queryKey: ['sheetProgress'] });
      queryClient.invalidateQueries({ queryKey: ['rbCategories'] });
      queryClient.invalidateQueries({ queryKey: ['rbPatternDetail'] });
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
    },
    onError: (_err, { problemId }, ctx: any) => {
      console.error('[ProblemTable] Toggle error:', _err);
      toggleLockRef.current.delete(problemId);
      if (ctx?.prev) {
        queryClient.setQueryData(['stepProgress', stepId], ctx.prev);
      }
      // Rollback global sync
      const wasSolved = ctx?.prev?.problems?.find((p: any) => p.problemId === problemId)?.solved;
      if (wasSolved) globalSync.markSolved(problemId);
      else globalSync.markUnsolved(problemId);
    },
  });

  // ---- Optimistic revision toggle -------------------------------------------
  const revisionMutation = useMutation({
    mutationFn: async ({ problemId, revisionPending }: { problemId: number; revisionPending: boolean }) => {
      await progressService.updateRevision({ problemId, revisionPending, sheetId, stepId });
    },
    onMutate: async ({ problemId, revisionPending }) => {
      await queryClient.cancelQueries({ queryKey: ['stepProgress', stepId] });
      const prev = queryClient.getQueryData<StepProgressData>(['stepProgress', stepId]);
      queryClient.setQueryData<StepProgressData>(['stepProgress', stepId], (old) => {
        if (!old) return old;
        return {
          ...old,
          problems: old.problems.map((p) =>
            p.problemId === problemId ? { ...p, revisionPending } : p
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev) queryClient.setQueryData(['stepProgress', stepId], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stepProgress', stepId] });
    },
  });

  // ---- Note save (after modal submit) ----------------------------------------
  const handleNoteSave = useCallback(
    async (problemId: number, notes: string) => {
      await progressService.updateNote({ problemId, notes, sheetId, stepId });
      // Update local cache immediately
      queryClient.setQueryData<StepProgressData>(['stepProgress', stepId], (old) => {
        if (!old) return old;
        return {
          ...old,
          problems: old.problems.map((p) =>
            p.problemId === problemId ? { ...p, notes } : p
          ),
        };
      });
    },
    [queryClient, stepId, sheetId]
  );

  // ---- Filtered problems list -------------------------------------------------
  const filteredProblems = useMemo(() => {
    if (!stepData?.problems) return [];
    return diffFilter === 'All'
      ? stepData.problems
      : stepData.problems.filter((p) => p.difficulty === diffFilter);
  }, [stepData?.problems, diffFilter]);

  const toggleLock = toggleLockRef.current;
  const pending = (solveMutation.isPending || revisionMutation.isPending) || toggleLock.size > 0;
  const pendingId = (solveMutation.variables as any)?.problemId ?? (revisionMutation.variables as any)?.problemId;

  // ---- Render ----------------------------------------------------------------
  return (
    <>
      <div className="bg-[#101014] border border-white/5 rounded-[24px] shadow-xl overflow-hidden">

        {/* ---- Header ---- */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#09090B]/40">
          <div className="flex items-center gap-3">
            {/* Difficulty filter pills */}
            <div className="flex gap-2">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                <button
                  key={d}
                  id={`diff-filter-${d.toLowerCase()}`}
                  onClick={() => setDiffFilter(d)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                    diffFilter === d
                      ? 'bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00]'
                      : 'bg-transparent border border-white/10 hover:bg-white/5 text-gray-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Progress pill */}
          {stepData && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF8A00] rounded-full transition-all duration-500"
                  style={{ width: `${stepData.progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-black text-[#FF8A00]">
                {stepData.progressPercentage}%
              </span>
              <span className="text-[10px] text-gray-500 font-semibold">
                ({stepData.solvedProblems}/{stepData.totalProblems})
              </span>
            </div>
          )}
        </div>

        {/* ---- Loading skeleton ---- */}
        {isLoading && (
          <div className="p-8 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* ---- Table ---- */}
        {!isLoading && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-gray-500 bg-[#09090B]/20">
                  <th className="py-3 px-6 font-bold w-10">#</th>
                  <th className="py-3 px-2 font-bold min-w-[200px]">Problem</th>
                  <th className="py-3 px-2 font-bold">Difficulty</th>
                  <th className="py-3 px-2 font-bold hidden xl:table-cell">Platform</th>
                  <th className="py-3 px-2 font-bold text-center w-16">Status</th>
                  <th className="py-3 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((prob, i) => {
                  const isRowPending = pending && pendingId === prob.problemId;
                  const isFav = isFavorited(prob.problemId, slug);

                  return (
                    <tr
                      key={prob.problemId}
                      className={`border-b border-white/5 transition-colors group ${
                        prob.solved ? 'hover:bg-emerald-500/[0.03]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Index */}
                      <td className="py-3 px-6 text-xs text-gray-500 font-mono font-bold">
                        {i + 1}
                      </td>

                      {/* Problem name */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {prob.link ? (
                            <a
                              href={prob.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs font-bold transition-colors line-clamp-1 ${
                                prob.solved
                                  ? 'text-emerald-400/80 hover:text-emerald-400'
                                  : 'text-gray-200 hover:text-[#FF8A00]'
                              }`}
                            >
                              {prob.name}
                            </a>
                          ) : (
                            <span
                              className={`text-xs font-bold line-clamp-1 ${
                                prob.solved ? 'text-emerald-400/80' : 'text-gray-200'
                              }`}
                            >
                              {prob.name}
                            </span>
                          )}
                          {prob.notes && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                              title="Has notes"
                            />
                          )}
                        </div>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-2">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded border ${diffColor(
                            prob.difficulty
                          )}`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-2 hidden xl:table-cell">
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                          {prob.platform}
                        </span>
                      </td>

                      {/* Solve checkbox */}
                      <td className="py-3 px-2 text-center">
                        {!canTrack ? (
                          <Link href="/login">
                            <button className="focus:outline-none transition-transform hover:scale-110 flex mx-auto" title="Sign in to track progress">
                              <Lock size={14} className="text-gray-600 hover:text-[#FF8A00]" />
                            </button>
                          </Link>
                        ) : (
                          <SolvedCheckbox
                            isSolved={prob.solved}
                            isLoading={isRowPending}
                            onToggle={() => {
                              if (toggleLockRef.current.has(prob.problemId)) return;
                              toggleLockRef.current.add(prob.problemId);
                              solveMutation.mutate({ problemId: prob.problemId, sheetId, stepId });
                            }}
                          />
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <PlatformLinks
                            links={prob.links}
                            videos={prob.videos}
                            editorials={prob.editorials}
                            platform={prob.platform}
                            link={prob.link}
                            youtubeUrl={prob.youtubeUrl}
                            articleUrl={prob.articleUrl}
                            size="sm"
                            problemTitle={prob.name}
                          />

                          {/* Notes */}
                          {!canTrack ? (
                            <Link href="/login">
                              <button className="transition-colors text-gray-600 hover:text-white" title="Sign in to add note">
                                <Lock size={14} />
                              </button>
                            </Link>
                          ) : (
                            <button
                              id={`note-btn-${prob.problemId}`}
                              onClick={() => setNoteProblem(prob)}
                              className={`transition-colors ${
                                prob.notes ? 'text-amber-400' : 'text-gray-600 hover:text-white'
                              }`}
                              title={prob.notes ? 'Edit Note' : 'Add Note'}
                            >
                              <Edit3 size={14} />
                            </button>
                          )}

                          {/* Revision */}
                          {canTrack && (
                            <button
                              id={`revision-btn-${prob.problemId}`}
                              onClick={() =>
                                revisionMutation.mutate({
                                  problemId: prob.problemId,
                                  revisionPending: !prob.revisionPending,
                                })
                              }
                              className={`transition-colors hover:scale-110 ${
                                prob.revisionPending
                                  ? 'text-purple-400'
                                  : 'text-gray-600 hover:text-purple-400'
                              }`}
                              title={
                                prob.revisionPending ? 'Remove from Revision' : 'Mark for Revision'
                              }
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}

                          {/* Favorite */}
                          {!canTrack ? (
                            <Link href="/login">
                              <button className="transition-colors text-gray-600 hover:text-[#FF8A00]" title="Sign in to bookmark">
                                <Lock size={14} />
                              </button>
                            </Link>
                          ) : (
                            <button
                              id={`fav-btn-${prob.problemId}`}
                              onClick={() => toggleFavorite(prob.problemId, slug)}
                              className={`transition-colors ${
                                isFav ? 'text-[#FF8A00]' : 'text-gray-600 hover:text-[#FF8A00]'
                              }`}
                              title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                            >
                              <Bookmark size={14} className={isFav ? 'fill-current' : ''} />
                            </button>
                          )}

                          {/* Add to custom sheet */}
                          {canTrack && (
                            <button
                              id={`custom-sheet-btn-${prob.problemId}`}
                              onClick={() =>
                                setCustomSheetProblem({ id: prob.problemId, name: prob.name })
                              }
                              className="text-gray-600 hover:text-emerald-400 transition-colors text-[16px] font-bold leading-none"
                              title="Add to Custom Sheet"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProblems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                      No problems match the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- Modals ---- */}
      {customSheetProblem && (
        <AddToCustomSheetModal
          problemId={customSheetProblem.id}
          problemName={customSheetProblem.name}
          sourceSlug={slug}
          onClose={() => setCustomSheetProblem(null)}
        />
      )}

      {noteProblem && (
        <NoteModal
          problem={noteProblem}
          onClose={() => setNoteProblem(null)}
          onSave={handleNoteSave}
        />
      )}
    </>
  );
}
