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

import { supabaseStorage } from './storage';

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: supabaseStorage,
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
