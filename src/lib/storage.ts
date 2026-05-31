import type { StateStorage } from 'zustand/middleware';

// Stockage de secours en mémoire
const memoryStore: Record<string, string> = {};
let mmkvInstance: any = null;
let isMMKVChecked = false;

function getMMKV() {
  if (isMMKVChecked) return mmkvInstance;
  try {
    const { MMKV } = require('react-native-mmkv');
    if (MMKV) {
      mmkvInstance = new MMKV();
      console.log('✅ MMKV initialisé avec succès (lazy load)');
    }
  } catch (e) {
    console.warn('⚠️ MMKV non disponible (lazy load), fallback sur memoryStore:', e);
  } finally {
    isMMKVChecked = true;
  }
  return mmkvInstance;
}

export const zustandStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    const mmkv = getMMKV();
    if (mmkv) {
      mmkv.set(name, value);
    } else {
      memoryStore[name] = value;
    }
  },
  getItem: (name: string) => {
    const mmkv = getMMKV();
    if (mmkv) {
      return mmkv.getString(name) ?? null;
    }
    return memoryStore[name] ?? null;
  },
  removeItem: (name: string) => {
    const mmkv = getMMKV();
    if (mmkv) {
      mmkv.delete(name);
    } else {
      delete memoryStore[name];
    }
  },
};

export const supabaseStorage = {
  setItem: (key: string, value: string) => {
    const mmkv = getMMKV();
    if (mmkv) {
      mmkv.set(key, value);
    } else {
      memoryStore[key] = value;
    }
    return Promise.resolve();
  },
  getItem: (key: string) => {
    const mmkv = getMMKV();
    if (mmkv) {
      return Promise.resolve(mmkv.getString(key) ?? null);
    }
    return Promise.resolve(memoryStore[key] ?? null);
  },
  removeItem: (key: string) => {
    const mmkv = getMMKV();
    if (mmkv) {
      mmkv.delete(key);
    } else {
      delete memoryStore[key];
    }
    return Promise.resolve();
  },
};
