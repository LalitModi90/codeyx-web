import { create } from 'zustand';
import { progressService } from '../services/progress.service';

interface SheetProgress {
  sheetId: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  totalProblems: number;
  solvedProblems: number;
  remainingProblems: number;
  revisionPending: number;
  progressPercentage: number;
  lastSolved: string | null;
}

interface StepProgress {
  stepId: string;
  stepNumber: number;
  title: string;
  totalProblems: number;
  solvedProblems: number;
  progressPercentage: number;
}

interface SheetDetailProgress {
  sheetId: string;
  slug: string;
  title: string;
  totalProblems: number;
  solvedProblems: number;
  remainingProblems: number;
  revisionPending: number;
  progressPercentage: number;
  lastSolved: any;
  steps: StepProgress[];
}

interface ProgressState {
  allProgress: SheetProgress[];
  sheetProgressCache: Map<string, SheetDetailProgress>;
  isLoading: boolean;
  error: string | null;

  fetchAllProgress: () => Promise<void>;
  fetchSheetProgress: (sheetId: string) => Promise<SheetDetailProgress | undefined>;
  updateProblem: (sheetId: string, stepId: string, problemId: number, solved: boolean) => Promise<any>;
  clearCache: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  allProgress: [],
  sheetProgressCache: new Map(),
  isLoading: false,
  error: null,

  fetchAllProgress: async () => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await progressService.getAllProgress();
      const data = response?.data || response || [];
      set({ allProgress: data, isLoading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to fetch progress', isLoading: false });
    }
  },

  fetchSheetProgress: async (sheetId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await progressService.getSheetProgress(sheetId);
      const data = response?.data || response;
      const cache = new Map(get().sheetProgressCache);
      cache.set(sheetId, data);
      set({ sheetProgressCache: cache, isLoading: false });
      return data;
    } catch (error: any) {
      set({ error: error?.message || 'Failed to fetch sheet progress', isLoading: false });
    }
  },

  updateProblem: async (sheetId: string, stepId: string, problemId: number, solved: boolean) => {
    try {
      const response: any = await progressService.updateProgress({
        sheetId,
        stepId,
        problemId,
        solved,
      });
      const cache = new Map(get().sheetProgressCache);
      cache.delete(sheetId);
      set({ sheetProgressCache: cache });
      return response;
    } catch (error: any) {
      set({ error: error?.message || 'Failed to update progress' });
      throw error;
    }
  },

  clearCache: () => {
    set({ sheetProgressCache: new Map(), allProgress: [] });
  },
}));
