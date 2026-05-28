import { api } from '../lib/api';

export const sheetsService = {
  getAllSheets: async () => {
    return api.get('/sheets');
  },
  getSheetBySlug: async (slug: string) => {
    return api.get(`/sheets/${slug}`);
  },
};
