import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
import type { Profile } from '../types/database';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user, isAuthenticated: true });
        await get().fetchProfile(session.user.id);
      }
    } catch (error: any) {
      console.error('Erreur initialisation auth:', error);
    } finally {
      set({ isLoading: false });
    }

    // Écouter les changements de session
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ user: session.user, isAuthenticated: true });
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, profile: null, isAuthenticated: false });
      }
    });
  },

  signUp: async (email, password, username) => {
    try {
      set({ isLoading: true });
      console.log('📝 Tentative inscription:', email);
      
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      console.log('📝 Résultat signUp:', JSON.stringify({ 
        hasUser: !!data?.user, 
        hasSession: !!data?.session, 
        error: error?.message 
      }));
      
      if (error) { 
        console.error('❌ Erreur signUp:', error.message);
        return { error: error.message }; 
      }

      if (data.user) {
        // Tenter de créer le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            display_name: username,
          });
        
        if (profileError) {
          console.warn('⚠️ Erreur profil:', profileError.message);
        } else {
          console.log('✅ Profil créé');
        }

        if (data.session) {
          set({ user: data.user, isAuthenticated: true });
          await get().fetchProfile(data.user.id);
          console.log('✅ Inscription réussie avec session !');
        } else {
          return { error: 'Inscription réussie ! Un email de confirmation a été envoyé à ' + email + '. Vérifiez votre boîte mail.' };
        }
      }

      return {};
    } catch (e: any) {
      console.error('❌ Exception signUp:', e);
      return { error: 'Erreur réseau : ' + e.message };
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true });
      console.log('🔑 Tentative connexion:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log('🔑 Résultat signIn:', JSON.stringify({ 
        hasUser: !!data?.user, 
        hasSession: !!data?.session, 
        error: error?.message 
      }));
      
      if (error) { 
        console.error('❌ Erreur signIn:', error.message);
        return { error: error.message }; 
      }

      set({ user: data.user, isAuthenticated: true });
      await get().fetchProfile(data.user.id);
      console.log('✅ Connexion réussie !');
      return {};
    } catch (e: any) {
      console.error('❌ Exception signIn:', e);
      return { error: 'Erreur réseau : ' + e.message };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, isAuthenticated: false });
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!error && data) {
        const user = get().user;
        const fallbackName = user?.user_metadata?.username || 'Utilisateur';
        set({ 
          profile: {
            ...(data as Profile),
            username: data.username || fallbackName,
            display_name: data.display_name || fallbackName
          } 
        });
      } else {
        // Fallback si la table profiles n'est pas encore créée sur Supabase
        const user = get().user;
        const isCompleted = user?.user_metadata?.onboarding_completed === true;
        set({ 
          profile: { 
            id: userId, 
            username: user?.user_metadata?.username || 'Utilisateur', 
            display_name: user?.user_metadata?.username || 'Utilisateur',
            onboarding_completed: isCompleted,
          } as Profile 
        });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) { return { error: 'Non connecté' }; }

    // Mettre à jour les métadonnées utilisateur pour la persistance garantie
    if (updates.onboarding_completed !== undefined) {
      await supabase.auth.updateUser({
        data: { onboarding_completed: updates.onboarding_completed, username: updates.username }
      });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) { 
      console.warn('Erreur Supabase lors de la mise à jour du profil:', error.message);
      // On continue quand même pour mettre à jour l'état local
    }

    set(state => ({
      profile: state.profile ? { ...state.profile, ...updates } : { id: user.id, username: 'User', display_name: 'User', onboarding_completed: false, ...updates } as Profile,
    }));
    return {};
  },
}));
