import { create } from 'zustand';

interface SearchState {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
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
}));
