import { create } from 'zustand';

interface ProgressSyncState {
  globalSolvedIds: Set<number>;
  globalPendingIds: Set<number>;
  lastToggledAt: number;

  markSolved: (problemId: number) => void;
  markUnsolved: (problemId: number) => void;
  setPending: (problemId: number, isPending: boolean) => void;
  markToggled: () => void;
  reset: () => void;
}

export const useProgressSyncStore = create<ProgressSyncState>((set, get) => ({
  globalSolvedIds: new Set<number>(),
  globalPendingIds: new Set<number>(),
  lastToggledAt: 0,

  markSolved: (problemId: number) => {
    set((state) => {
      const next = new Set(state.globalSolvedIds);
      next.add(problemId);
      return { globalSolvedIds: next, lastToggledAt: Date.now() };
    });
  },

  markUnsolved: (problemId: number) => {
    set((state) => {
      const next = new Set(state.globalSolvedIds);
      next.delete(problemId);
      return { globalSolvedIds: next, lastToggledAt: Date.now() };
    });
  },

  setPending: (problemId: number, isPending: boolean) => {
    set((state) => {
      const next = new Set(state.globalPendingIds);
      if (isPending) next.add(problemId);
      else next.delete(problemId);
      return { globalPendingIds: next };
    });
  },

  markToggled: () => {
    set({ lastToggledAt: Date.now() });
  },

  reset: () => {
    set({
      globalSolvedIds: new Set<number>(),
      globalPendingIds: new Set<number>(),
      lastToggledAt: Date.now(),
    });
  },
}));
