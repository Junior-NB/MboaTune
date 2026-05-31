import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const mmkv = new MMKV();

// Adapter pour Zustand persist (synchrone)
export const zustandStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    return mmkv.set(name, value);
  },
  getItem: (name: string) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return mmkv.delete(name);
  },
};

// Adapter pour Supabase Auth (promesses obligatoires)
export const supabaseStorage = {
  setItem: (key: string, value: string) => {
    mmkv.set(key, value);
    return Promise.resolve();
  },
  getItem: (key: string) => {
    const value = mmkv.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key: string) => {
    mmkv.delete(key);
    return Promise.resolve();
  },
};
