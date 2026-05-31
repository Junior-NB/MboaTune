import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../lib/storage';
import RNFS from 'react-native-fs';
import type { Track } from '../types/database';

interface DownloadState {
  downloadedTracks: Record<string, { localPath: string; track: Track }>;
  isDownloading: Record<string, boolean>;

  downloadTrack: (track: Track) => Promise<void>;
  removeDownload: (trackId: string) => Promise<void>;
  isDownloaded: (trackId: string) => boolean;
  getLocalPath: (trackId: string) => string | null;
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      downloadedTracks: {},
      isDownloading: {},

      downloadTrack: async (track: Track) => {
        try {
          if (get().downloadedTracks[track.id] || get().isDownloading[track.id]) return;

          set((state) => ({
            isDownloading: { ...state.isDownloading, [track.id]: true }
          }));

          const localPath = `${RNFS.DocumentDirectoryPath}/${track.id}.mp3`;

          const options = {
            fromUrl: track.file_path, // Assuming this is the full valid URL from Supabase
            toFile: localPath,
            background: true,
            discretionary: true,
          };

          const ret = RNFS.downloadFile(options);
          
          ret.promise.then((res) => {
            if (res.statusCode === 200) {
              set((state) => {
                const newDownloaded = { ...state.downloadedTracks };
                newDownloaded[track.id] = { localPath: `file://${localPath}`, track };
                
                const newDownloading = { ...state.isDownloading };
                delete newDownloading[track.id];
                
                return { downloadedTracks: newDownloaded, isDownloading: newDownloading };
              });
              console.log('✅ Téléchargement réussi :', localPath);
            }
          }).catch((err) => {
            console.error('❌ Erreur de téléchargement:', err);
            set((state) => {
              const newDownloading = { ...state.isDownloading };
              delete newDownloading[track.id];
              return { isDownloading: newDownloading };
            });
          });

        } catch (error) {
          console.error('❌ Erreur initialisation téléchargement:', error);
          set((state) => {
            const newDownloading = { ...state.isDownloading };
            delete newDownloading[track.id];
            return { isDownloading: newDownloading };
          });
        }
      },

      removeDownload: async (trackId: string) => {
        const state = get();
        const downloaded = state.downloadedTracks[trackId];
        
        if (downloaded) {
          try {
            await RNFS.unlink(downloaded.localPath.replace('file://', ''));
          } catch (e) {
            console.log('Le fichier n\'existe peut-être déjà plus', e);
          }
          
          set((s) => {
            const newDownloaded = { ...s.downloadedTracks };
            delete newDownloaded[trackId];
            return { downloadedTracks: newDownloaded };
          });
        }
      },

      isDownloaded: (trackId: string) => {
        return !!get().downloadedTracks[trackId];
      },

      getLocalPath: (trackId: string) => {
        return get().downloadedTracks[trackId]?.localPath || null;
      },
    }),
    {
      name: 'download-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ downloadedTracks: state.downloadedTracks }),
    }
  )
);
