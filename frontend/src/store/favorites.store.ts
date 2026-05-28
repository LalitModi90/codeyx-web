import { create } from 'zustand';
import { favoritesService } from '../services/favorites.service';

interface FavoriteItem {
  problemId: number;
  sourceSlug: string;
  createdAt?: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  favoriteSet: Set<string>;
  isLoading: boolean;

  fetchFavorites: () => Promise<void>;
  toggleFavorite: (problemId: number, sourceSlug: string) => Promise<boolean>;
  isFavorited: (problemId: number, sourceSlug: string) => boolean;
}

const makeKey = (problemId: number, sourceSlug: string) => `${sourceSlug}:${problemId}`;

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  favoriteSet: new Set(),
  isLoading: false,

  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const response: any = await favoritesService.getAll();
      const data = response?.data || response || [];
      const favs = Array.isArray(data) ? data : [];
      set({
        favorites: favs,
        favoriteSet: new Set(favs.map((f: any) => makeKey(f.problemId, f.sourceSlug))),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (problemId: number, sourceSlug: string) => {
    const key = makeKey(problemId, sourceSlug);
    const wasFav = get().favoriteSet.has(key);

    set((s) => {
      const nextSet = new Set(s.favoriteSet);
      if (wasFav) nextSet.delete(key);
      else nextSet.add(key);
      return { favoriteSet: nextSet };
    });

    try {
      const response: any = await favoritesService.toggle({ problemId, sourceSlug });
      const result = response?.data || response;
      return result?.favorited ?? !wasFav;
    } catch {
      set((s) => {
        const nextSet = new Set(s.favoriteSet);
        if (wasFav) nextSet.add(key);
        else nextSet.delete(key);
        return { favoriteSet: nextSet };
      });
      return wasFav;
    }
  },

  isFavorited: (problemId: number, sourceSlug: string) => {
    return get().favoriteSet.has(makeKey(problemId, sourceSlug));
  },
}));
