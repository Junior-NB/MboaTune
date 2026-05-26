import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import type { Track } from '../types/database';

export const requestStoragePermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    // Pour Android 13+ on utilise READ_MEDIA_AUDIO
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        {
          title: 'Permission Musique',
          message: 'MboaTune a besoin d\'accéder à votre musique locale.',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // Pour les anciennes versions
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Permission Stockage',
          message: 'MboaTune a besoin d\'accéder à votre stockage pour lire la musique locale.',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const scanLocalMusic = async (): Promise<Track[]> => {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) return [];

  const localTracks: Track[] = [];
  
  // Chemins courants où la musique est stockée
  const dirsToScan = [
    `${RNFS.ExternalStorageDirectoryPath}/Music`,
    `${RNFS.ExternalStorageDirectoryPath}/Download`,
  ];

  for (const dir of dirsToScan) {
    try {
      const exists = await RNFS.exists(dir);
      if (!exists) continue;

      const files = await RNFS.readDir(dir);
      
      files.forEach((file) => {
        if (file.isFile() && (file.name.endsWith('.mp3') || file.name.endsWith('.m4a') || file.name.endsWith('.wav'))) {
          // On mock certaines métadonnées car lire les tags ID3 en pur JS est complexe 
          // (il faudrait utiliser une lib comme jsmediatags)
          localTracks.push({
            id: `local-${file.path}`,
            title: file.name.replace(/\.[^/.]+$/, ""), // Enlève l'extension
            artist_id: 'local',
            album_id: 'local',
            duration_ms: 0, // Inconnu sans lib ID3
            file_path: `file://${file.path}`,
            preview_url: null,
            play_count: 0,
            is_public: false,
            created_at: new Date().toISOString(),
            artist: {
              id: 'local',
              name: 'Musique Locale',
              bio: null,
              avatar_path: 'https://via.placeholder.com/150/450af5/FFFFFF?text=Local',
              verified: false,
              followers_count: 0,
            },
            album: {
              id: 'local',
              title: 'Mon Téléphone',
              artist_id: 'local',
              release_date: new Date().toISOString(),
              cover_path: 'https://via.placeholder.com/150/450af5/FFFFFF?text=Local',
              type: 'album',
            }
          });
        }
      });
    } catch (e) {
      console.warn(`Erreur scan de ${dir}:`, e);
    }
  }

  return localTracks;
};
