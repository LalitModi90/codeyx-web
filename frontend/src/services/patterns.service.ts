import { api } from '../lib/api';

export const patternsService = {
  getCategories: async () => {
    return api.get('/patterns/categories');
  },
  getCategoriesWithProgress: async () => {
    return api.get('/patterns/categories/progress');
  },
  getPatternDetail: async (patternId: string) => {
    return api.get(`/patterns/${patternId}`);
  },
  getPatternStats: async () => {
    return api.get('/patterns/stats');
  },
  getPatternAnalytics: async () => {
    return api.get('/patterns/analytics');
  },
  getPatternProgress: async (patternId: string) => {
    return api.get(`/patterns/progress/${patternId}`);
  },
};
