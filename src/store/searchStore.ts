import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

interface SearchState {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      addRecentSearch: (query: string) => {
        if (!query.trim()) return;
        const q = query.trim();
        const { recentSearches } = get();
        // Enlever le doublon s'il existe et ajouter au début
        const updated = [q, ...recentSearches.filter(s => s.toLowerCase() !== q.toLowerCase())].slice(0, 10);
        set({ recentSearches: updated });
      },
      removeRecentSearch: (query: string) => {
        set(state => ({
          recentSearches: state.recentSearches.filter(s => s !== query)
        }));
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'mboatune-recent-searches',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
