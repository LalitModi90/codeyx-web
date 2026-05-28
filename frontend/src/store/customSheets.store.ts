import { create } from 'zustand';
import { customSheetsService } from '../services/customSheets.service';

interface CustomSheetItem {
  _id: string;
  title: string;
  description: string;
  visibility: string;
  totalProblems: number;
  solvedProblems: number;
  progressPercentage: number;
  createdAt: string;
}

interface CustomSheetsState {
  sheets: CustomSheetItem[];
  isLoading: boolean;

  fetchSheets: () => Promise<void>;
  createSheet: (title: string, description?: string) => Promise<CustomSheetItem | null>;
  deleteSheet: (id: string) => Promise<boolean>;
}

export const useCustomSheetsStore = create<CustomSheetsState>((set, get) => ({
  sheets: [],
  isLoading: false,

  fetchSheets: async () => {
    set({ isLoading: true });
    try {
      const response: any = await customSheetsService.getAll();
      const data = response?.data || response || [];
      set({ sheets: Array.isArray(data) ? data : [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createSheet: async (title: string, description?: string) => {
    try {
      const response: any = await customSheetsService.create({ title, description });
      const sheet = response?.data || response;
      if (sheet?._id) {
        set((s) => ({ sheets: [sheet, ...s.sheets] }));
      }
      return sheet;
    } catch {
      return null;
    }
  },

  deleteSheet: async (id: string) => {
    try {
      await customSheetsService.delete(id);
      set((s) => ({ sheets: s.sheets.filter((sh) => sh._id !== id) }));
      return true;
    } catch {
      return false;
    }
  },
}));
