import { api } from '../lib/api';

export const favoritesService = {
  toggle: async (data: { problemId: number; sourceSlug: string }) => {
    return api.post('/favorites/toggle', data);
  },

  getAll: async () => {
    return api.get('/favorites');
  },
};
