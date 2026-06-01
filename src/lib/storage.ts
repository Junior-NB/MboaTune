import type { StateStorage } from 'zustand/middleware';
import * as RNFS from 'react-native-fs';

const STORAGE_DIR = `${RNFS.DocumentDirectoryPath}/app_storage`;

// Ensure directory exists
let isDirChecked = false;
const ensureStorageDir = async () => {
  if (isDirChecked) return;
  try {
    const exists = await RNFS.exists(STORAGE_DIR);
    if (!exists) {
      await RNFS.mkdir(STORAGE_DIR);
    }
    isDirChecked = true;
  } catch (e) {
    console.warn('⚠️ RNFS mkdir error:', e);
  }
};

const getFilePath = (key: string) => `${STORAGE_DIR}/${key}.json`;

// Stockage de secours en mémoire
const memoryStore: Record<string, string> = {};

export const zustandStorage: StateStorage = {
  setItem: async (name: string, value: string) => {
    try {
      await ensureStorageDir();
      await RNFS.writeFile(getFilePath(name), value, 'utf8');
    } catch (e) {
      console.warn('⚠️ RNFS setItem error, fallback to memory:', e);
      memoryStore[name] = value;
    }
  },
  getItem: async (name: string) => {
    try {
      const path = getFilePath(name);
      const exists = await RNFS.exists(path);
      if (exists) {
        return await RNFS.readFile(path, 'utf8');
      }
      return null;
    } catch (e) {
      console.warn('⚠️ RNFS getItem error, fallback to memory:', e);
      return memoryStore[name] ?? null;
    }
  },
  removeItem: async (name: string) => {
    try {
      const path = getFilePath(name);
      const exists = await RNFS.exists(path);
      if (exists) {
        await RNFS.unlink(path);
      }
    } catch (e) {
      console.warn('⚠️ RNFS removeItem error, fallback to memory:', e);
      delete memoryStore[name];
    }
  },
};

// Supabase storage needs identical interface
export const supabaseStorage = {
  setItem: async (key: string, value: string) => {
    await zustandStorage.setItem(key, value);
  },
  getItem: async (key: string) => {
    return await zustandStorage.getItem(key) ?? null;
  },
  removeItem: async (key: string) => {
    await zustandStorage.removeItem(key);
  },
};
