import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { mockTracks } from '../../data/mockData';
import type { Track } from '../../types/database';

export default function LikedTracksScreen() {
  const navigation = useNavigation();
  const { likedTracks } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const { user } = useAuthStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLikedTracks();
  }, [likedTracks]);

  const loadLikedTracks = async () => {
    setIsLoading(true);
    try {
      // D'abord chercher dans les mocks
      const localLiked = mockTracks.filter(t => likedTracks.includes(t.id));

      // Puis chercher sur Supabase pour les vrais tracks
      if (likedTracks.length > 0) {
        const supabaseIds = likedTracks.filter(id => !id.startsWith('t') || id.length > 5);
        if (supabaseIds.length > 0) {
          const { data } = await supabase
            .from('tracks')
            .select('*, artist:artists(*), album:albums(*)')
            .in('id', supabaseIds);
          if (data) {
            setTracks([...localLiked, ...(data as Track[])]);
            setIsLoading(false);
            return;
          }
        }
      }
      setTracks(localLiked);
    } catch (e) {
      console.error('Erreur chargement titres likés:', e);
      const localLiked = mockTracks.filter(t => likedTracks.includes(t.id));
      setTracks(localLiked);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#5038a0', '#2a1a5e', '#121212']}
        locations={[0, 0.35, 0.7]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Infos playlist */}
          <View style={styles.playlistInfo}>
            <LinearGradient
              colors={['#450af5', '#8e8ee5']}
              style={styles.bigCover}
            >
              <Icon name="heart" size={60} color="#fff" />
            </LinearGradient>
            <Text style={styles.playlistTitle}>Titres likés</Text>
            <Text style={styles.playlistMeta}>
              {tracks.length} titre{tracks.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <TouchableOpacity>
                <Icon name="download-outline" size={24} color="#b3b3b3" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionRight}>
              <TouchableOpacity>
                <Icon name="shuffle" size={28} color="#1DB954" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playAllBtn}
                onPress={() => {
                  if (tracks.length > 0) {
                    playTrack(tracks[0], tracks);
                  }
                }}
              >
                <Icon name="play" size={28} color="#000" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste des titres */}
          {tracks.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <Icon name="heart-outline" size={48} color="#535353" />
              <Text style={styles.emptyTitle}>Les titres que vous aimez apparaîtront ici</Text>
              <Text style={styles.emptySub}>
                Enregistrez des titres en appuyant sur l'icône cœur.
              </Text>
            </View>
          ) : (
            tracks.map((track, index) => (
              <TouchableOpacity
                key={track.id}
                style={styles.trackItem}
                activeOpacity={0.7}
                onPress={() => playTrack(track, tracks)}
              >
                <View style={styles.trackLeft}>
                  {track.album?.cover_path && !track.album.cover_path.includes('placeholder') ? (
                    <Image source={{ uri: track.album.cover_path }} style={styles.trackCover} />
                  ) : (
                    <View style={[styles.trackCover, styles.trackCoverPlaceholder]}>
                      <Icon name="musical-notes" size={16} color="#b3b3b3" />
                    </View>
                  )}
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {track.artist?.name || 'Artiste inconnu'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Icon name="ellipsis-horizontal" size={20} color="#b3b3b3" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: { paddingBottom: 120 },

  /* Playlist info */
  playlistInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bigCover: {
    width: 200,
    height: 200,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  playlistMeta: {
    color: '#b3b3b3',
    fontSize: 14,
  },

  /* Actions */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionLeft: { flexDirection: 'row', gap: 16 },
  actionRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  playAllBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Tracks */
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  trackLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#282828',
  },
  trackCoverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: { marginLeft: 12, flex: 1, paddingRight: 12 },
  trackTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  trackArtist: { color: '#b3b3b3', fontSize: 13 },

  /* Empty */
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  emptySub: { color: '#b3b3b3', fontSize: 14, textAlign: 'center', marginTop: 8 },
});
