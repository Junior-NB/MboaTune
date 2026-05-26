// Polyfill URL — protégé au cas où le module natif n'est pas lié
try {
  require('react-native-url-polyfill/auto');
} catch (e) {
  console.warn('react-native-url-polyfill non disponible');
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Alert } from 'react-native';

// Clés Supabase
const SUPABASE_URL = 'https://xfswbjqktltddoynaipf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jCQzh52HktyzfKuFugfMbw_nKfCLlLZ';

// Stockage en mémoire (fiable à 100% sans dépendance native)
const memoryStore: Record<string, string> = {};

const SimpleStorage = {
  getItem: (key: string) => {
    return memoryStore[key] ?? null;
  },
  setItem: (key: string, value: string) => {
    memoryStore[key] = value;
  },
  removeItem: (key: string) => {
    delete memoryStore[key];
  },
};

// Essayer d'utiliser MMKV si disponible, sinon mémoire
let finalStorage = SimpleStorage;
try {
  const { MMKV } = require('react-native-mmkv');
  const mmkv = new MMKV();
  finalStorage = {
    getItem: (key: string) => mmkv.getString(key) ?? null,
    setItem: (key: string, value: string) => mmkv.set(key, value),
    removeItem: (key: string) => mmkv.delete(key),
  };
  console.log('✅ MMKV disponible');
} catch (e) {
  console.warn('⚠️ MMKV non disponible, stockage mémoire utilisé');
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: finalStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Test de connexion au démarrage
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase auth error:', error.message);
  } else {
    console.log('✅ Supabase connecté, session:', data.session ? 'active' : 'aucune');
  }
}).catch(err => {
  console.error('❌ Supabase unreachable:', err);
});
