import { create } from 'zustand';
import TrackPlayer, {
  State,
  RepeatMode,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import type { Track } from '../types/database';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  isReady: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'track' | 'queue';
  position: number;
  duration: number;

  // Actions
  setupPlayer: () => Promise<void>;
  playTrack: (track: Track, queue?: Track[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => Promise<void>;
  addToQueue: (track: Track) => Promise<void>;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTrack: (track: Track | null) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  isReady: false,
  isShuffle: false,
  repeatMode: 'off',
  position: 0,
  duration: 0,

  setupPlayer: async () => {
    try {
      if (get().isReady) return;
      
      let isSetup = false;
      try {
        await TrackPlayer.getActiveTrackIndex();
        isSetup = true;
      } catch {
        isSetup = false;
      }

      if (!isSetup) {
        await TrackPlayer.setupPlayer({
          maxCacheSize: 1024 * 5, // 5 MB
        });

        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
            Capability.Stop,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
          ],
        });
      }

      set({ isReady: true });
    } catch (error) {
      console.error('Erreur configuration du lecteur:', error);
    }
  },

  playTrack: async (track, queue = []) => {
    try {
      await TrackPlayer.reset();

      const trackData = {
        id: track.id,
        url: track.file_path, // URL signée depuis Supabase Storage
        title: track.title,
        artist: track.artist?.name || 'Artiste inconnu',
        artwork: track.album?.cover_path || undefined,
        duration: track.duration_ms / 1000,
      };

      await TrackPlayer.add(trackData);

      // Ajouter le reste de la queue
      if (queue.length > 0) {
        const queueTracks = queue
          .filter(t => t.id !== track.id)
          .map(t => ({
            id: t.id,
            url: t.file_path,
            title: t.title,
            artist: t.artist?.name || 'Artiste inconnu',
            artwork: t.album?.cover_path || undefined,
            duration: t.duration_ms / 1000,
          }));
        await TrackPlayer.add(queueTracks);
      }

      await TrackPlayer.play();
      set({ currentTrack: track, queue: queue.length ? queue : [track], isPlaying: true });
    } catch (error) {
      console.error('Erreur lecture:', error);
    }
  },

  togglePlayPause: async () => {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
      set({ isPlaying: false });
    } else {
      await TrackPlayer.play();
      set({ isPlaying: true });
    }
  },

  skipToNext: async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch {
      // Fin de la queue
    }
  },

  skipToPrevious: async () => {
    try {
      const position = await TrackPlayer.getPosition();
      if (position > 3) {
        await TrackPlayer.seekTo(0);
      } else {
        await TrackPlayer.skipToPrevious();
      }
    } catch {
      await TrackPlayer.seekTo(0);
    }
  },

  seekTo: async (position) => {
    await TrackPlayer.seekTo(position);
    set({ position });
  },

  toggleShuffle: () => {
    set(state => ({ isShuffle: !state.isShuffle }));
  },

  toggleRepeat: async () => {
    const { repeatMode } = get();
    let newMode: 'off' | 'track' | 'queue';
    let trackPlayerMode: RepeatMode;

    if (repeatMode === 'off') {
      newMode = 'queue';
      trackPlayerMode = RepeatMode.Queue;
    } else if (repeatMode === 'queue') {
      newMode = 'track';
      trackPlayerMode = RepeatMode.Track;
    } else {
      newMode = 'off';
      trackPlayerMode = RepeatMode.Off;
    }

    await TrackPlayer.setRepeatMode(trackPlayerMode);
    set({ repeatMode: newMode });
  },

  addToQueue: async (track) => {
    const trackData = {
      id: track.id,
      url: track.file_path,
      title: track.title,
      artist: track.artist?.name || 'Artiste inconnu',
      artwork: track.album?.cover_path || undefined,
      duration: track.duration_ms / 1000,
    };
    await TrackPlayer.add(trackData);
    set(state => ({ queue: [...state.queue, track] }));
  },

  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
}));
