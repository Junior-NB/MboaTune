import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import type { Playlist, Track, Album, Artist } from '../types/database';

interface LibraryState {
  playlists: Playlist[];
  likedTracks: string[]; // IDs des titres aimés
  savedAlbums: string[];
  followedArtists: string[];
  importedTracks: Track[];
  isLoading: boolean;

  // Actions
  addImportedTrack: (track: Track) => void;
  removeImportedTrack: (trackId: string) => void;
  fetchPlaylists: (userId: string) => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<{ error?: string; data?: Playlist }>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  toggleLikeTrack: (trackId: string, userId: string) => Promise<void>;
  isTrackLiked: (trackId: string) => boolean;
  fetchLikedTracks: (userId: string) => Promise<void>;
  fetchSavedAlbums: (userId: string) => Promise<void>;
  toggleSaveAlbum: (albumId: string, userId: string) => Promise<void>;
  fetchFollowedArtists: (userId: string) => Promise<void>;
  toggleFollowArtist: (artistId: string, userId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string, userId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      playlists: [],
      likedTracks: [],
      savedAlbums: [],
      followedArtists: [],
      importedTracks: [],
      isLoading: false,

      addImportedTrack: (track) => set(state => ({ importedTracks: [...state.importedTracks, track] })),
      removeImportedTrack: (trackId) => set(state => ({ importedTracks: state.importedTracks.filter(t => t.id !== trackId) })),

      fetchPlaylists: async (userId) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('playlists')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false });

          if (!error && data) {
            set({ playlists: data as Playlist[] });
          }
        } catch (e) {
          console.error('Erreur chargement playlists:', e);
        } finally {
          set({ isLoading: false });
        }
      },

      createPlaylist: async (name, description) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) { return { error: 'Non connecté' }; }

          const { data, error } = await supabase
            .from('playlists')
            .insert({
              name,
              description: description || null,
              owner_id: user.id,
              is_public: false,
            })
            .select()
            .single();

          if (error) { return { error: error.message }; }

          set(state => ({ playlists: [data as Playlist, ...state.playlists] }));
          return { data: data as Playlist };
        } catch (e: any) {
          return { error: e.message };
        }
      },

      deletePlaylist: async (playlistId) => {
        await supabase.from('playlists').delete().eq('id', playlistId);
        set(state => ({
          playlists: state.playlists.filter(p => p.id !== playlistId),
        }));
      },

      toggleLikeTrack: async (trackId, userId) => {
        const isLiked = get().likedTracks.includes(trackId);

        // Mise à jour optimiste
        if (isLiked) {
          set(state => ({
            likedTracks: state.likedTracks.filter(id => id !== trackId),
          }));
          await supabase
            .from('user_library')
            .delete()
            .eq('user_id', userId)
            .eq('entity_id', trackId)
            .eq('entity_type', 'track');
        } else {
          set(state => ({
            likedTracks: [...state.likedTracks, trackId],
          }));
          await supabase
            .from('user_library')
            .insert({
              user_id: userId,
              entity_type: 'track',
              entity_id: trackId,
            });
        }
      },

      isTrackLiked: (trackId) => {
        return get().likedTracks.includes(trackId);
      },

      fetchLikedTracks: async (userId) => {
        const { data } = await supabase
          .from('user_library')
          .select('entity_id')
          .eq('user_id', userId)
          .eq('entity_type', 'track');

        if (data) {
          set({ likedTracks: data.map(d => d.entity_id) });
        }
      },

      fetchSavedAlbums: async (userId) => {
        const { data } = await supabase
          .from('user_library')
          .select('entity_id')
          .eq('user_id', userId)
          .eq('entity_type', 'album');

        if (data) {
          set({ savedAlbums: data.map(d => d.entity_id) });
        }
      },

      toggleSaveAlbum: async (albumId, userId) => {
        const isSaved = get().savedAlbums.includes(albumId);
        if (isSaved) {
          set(state => ({
            savedAlbums: state.savedAlbums.filter(id => id !== albumId),
          }));
          await supabase
            .from('user_library')
            .delete()
            .eq('user_id', userId)
            .eq('entity_id', albumId)
            .eq('entity_type', 'album');
        } else {
          set(state => ({
            savedAlbums: [...state.savedAlbums, albumId],
          }));
          await supabase
            .from('user_library')
            .insert({ user_id: userId, entity_type: 'album', entity_id: albumId });
        }
      },

      fetchFollowedArtists: async (userId) => {
        const { data } = await supabase
          .from('user_library')
          .select('entity_id')
          .eq('user_id', userId)
          .eq('entity_type', 'artist');

        if (data) {
          set({ followedArtists: data.map(d => d.entity_id) });
        }
      },

      toggleFollowArtist: async (artistId, userId) => {
        const isFollowed = get().followedArtists.includes(artistId);
        if (isFollowed) {
          set(state => ({
            followedArtists: state.followedArtists.filter(id => id !== artistId),
          }));
          await supabase
            .from('user_library')
            .delete()
            .eq('user_id', userId)
            .eq('entity_id', artistId)
            .eq('entity_type', 'artist');
        } else {
          set(state => ({
            followedArtists: [...state.followedArtists, artistId],
          }));
          await supabase
            .from('user_library')
            .insert({ user_id: userId, entity_type: 'artist', entity_id: artistId });
        }
      },

      addTrackToPlaylist: async (playlistId, trackId, userId) => {
        // Trouver la position max actuelle
        const { data: existing } = await supabase
          .from('playlist_tracks')
          .select('position')
          .eq('playlist_id', playlistId)
          .order('position', { ascending: false })
          .limit(1);

        const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

        await supabase
          .from('playlist_tracks')
          .insert({
            playlist_id: playlistId,
            track_id: trackId,
            position: nextPosition,
            added_by: userId,
          });
      },

      removeTrackFromPlaylist: async (playlistId, trackId) => {
        await supabase
          .from('playlist_tracks')
          .delete()
          .eq('playlist_id', playlistId)
          .eq('track_id', trackId);
      },
    }),
    {
      name: 'library-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ 
        likedTracks: state.likedTracks,
        savedAlbums: state.savedAlbums,
        followedArtists: state.followedArtists,
        importedTracks: state.importedTracks
      }),
    }
  )
);
