import { api } from '../lib/api';

export const customSheetsService = {
  create: async (data: { title: string; description?: string; visibility?: string }) => {
    return api.post('/custom-sheets/create', data);
  },

  getAll: async () => {
    return api.get('/custom-sheets');
  },

  delete: async (id: string) => {
    return api.delete(`/custom-sheets/${id}`);
  },

  addProblem: async (data: { sheetId: string; problemId: number; sourceSlug: string }) => {
    return api.post('/custom-sheets/add-problem', data);
  },

  removeProblem: async (data: { sheetId: string; problemId: number; sourceSlug: string }) => {
    return api.post('/custom-sheets/remove-problem', data);
  },

  getProgress: async (id: string) => {
    return api.get(`/custom-sheets/${id}/progress`);
  },
};
