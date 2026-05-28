import { api } from '../lib/api';

export const progressService = {
  // ---------------------------------------------------------------------------
  // Solve / unsolve a problem (sparse upsert / delete)
  // ---------------------------------------------------------------------------
  updateProgress: async (data: {
    sheetId?: string;
    stepId?: string;
    problemId: number;
    solved: boolean;
    revisionPending?: boolean;
    notes?: string;
  }) => {
    return api.post('/progress/update', data);
  },

  toggleProblem: async (problemId: number, sheetId?: string, stepId?: string) => {
    return api.post('/progress/toggle', { problemId, sheetId, stepId });
  },

  // ---------------------------------------------------------------------------
  // Toggle revision pending independently of solved state
  // ---------------------------------------------------------------------------
  updateRevision: async (data: {
    problemId: number;
    revisionPending: boolean;
    sheetId?: string;
    stepId?: string;
  }) => {
    return api.post('/progress/revision', data);
  },

  // ---------------------------------------------------------------------------
  // Save / clear notes on a problem
  // ---------------------------------------------------------------------------
  updateNote: async (data: {
    problemId: number;
    notes: string;
    sheetId?: string;
    stepId?: string;
  }) => {
    return api.post('/progress/note', data);
  },

  // ---------------------------------------------------------------------------
  // Read operations
  // ---------------------------------------------------------------------------
  getSheetProgress: async (sheetId: string) => {
    return api.get(`/progress/${sheetId}`);
  },

  getAllProgress: async () => {
    return api.get('/progress/all');
  },

  getStepProgress: async (stepId: string) => {
    return api.get(`/progress/step/${stepId}`);
  },

  getSheetBySlug: async (slug: string) => {
    return api.get(`/progress/slug/${slug}`);
  },

  getProgressStats: async () => {
    return api.get('/progress/stats');
  },

  deleteSheetProgress: async (slug: string) => {
    return api.delete(`/progress/sheet/${slug}`);
  },
};
