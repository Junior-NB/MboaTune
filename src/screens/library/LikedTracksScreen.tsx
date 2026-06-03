import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { useDownloadStore } from '../../store/downloadStore';
import { supabase } from '../../lib/supabase';
import type { Track } from '../../types/database';
import TrackOptionsModal from '../../components/TrackOptionsModal';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../theme/spacing';

export default function LikedTracksScreen() {
  const navigation = useNavigation();
  const { likedTracks, cachedTracks, cacheTracks } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const { user } = useAuthStore();
  const { downloadTrack, removeDownload, isDownloaded, isDownloading, downloadedTracks } = useDownloadStore();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);

  useEffect(() => {
    loadLikedTracks();
  }, [likedTracks]);

  const loadLikedTracks = async () => {
    setIsLoading(true);
    let loadedTracks: Track[] = [];
    try {
      if (likedTracks.length > 0) {
        const supabaseIds = likedTracks; // We consider all ids as supabase ids now
        
        // 1. Récupérer immédiatement les titres du cache local
        const cachedSupabaseTracks = supabaseIds
          .map(id => downloadedTracks[id]?.track || cachedTracks[id])
          .filter(Boolean) as Track[];
          
        loadedTracks = [...loadedTracks, ...cachedSupabaseTracks];

        // 2. Fetcher seulement ceux qui ne sont pas en cache ou téléchargés
        const missingIds = supabaseIds.filter(id => !downloadedTracks[id] && !cachedTracks[id]);

        if (missingIds.length > 0) {
          const { data, error } = await supabase
            .from('tracks')
            .select('*, artist:artists(*), album:albums(*)')
            .in('id', missingIds);
            
          if (data && !error) {
            loadedTracks = [...loadedTracks, ...(data as Track[])];
            cacheTracks(data as Track[]);
          } else {
            console.warn('Erreur fetch Supabase:', error);
          }
        }
      }
    } catch (e) {
      console.log('Mode hors ligne ou erreur réseau');
    } finally {
      // Éliminer les doublons potentiels
      const uniqueTracks = Array.from(new Map(loadedTracks.map(t => [t.id, t])).values());
      setTracks(uniqueTracks);
      setIsLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    for (const track of tracks) {
      if (!isDownloaded(track.id) && !isDownloading[track.id]) {
        await downloadTrack(track);
      }
    }
  };

  const allDownloaded = tracks.length > 0 && tracks.every(t => isDownloaded(t.id));
  const someDownloading = tracks.some(t => isDownloading[t.id]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={Colors.gradientDark}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="chevron-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.playlistInfo}>
            <LinearGradient
              colors={Colors.gradientAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bigCover}
            >
              <Icon name="heart" size={72} color="#fff" />
            </LinearGradient>
            <Text style={styles.playlistTitle}>Titres likés</Text>
            <Text style={styles.playlistMeta}>
              {tracks.length} titre{tracks.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <TouchableOpacity onPress={handleDownloadAll} disabled={someDownloading || tracks.length === 0}>
                {someDownloading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Icon 
                    name={allDownloaded ? "download" : "download-outline"} 
                    size={28} 
                    color={allDownloaded ? Colors.primary : Colors.textSecondary} 
                  />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.actionRight}>
              <TouchableOpacity>
                <Icon name="shuffle" size={28} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (tracks.length > 0) playTrack(tracks[0], tracks);
                }}
              >
                <LinearGradient
                  colors={Colors.gradientAccent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playAllBtn}
                >
                  <Icon name="play" size={28} color="#FFF" style={{ marginLeft: 3 }} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {tracks.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <Icon name="heart-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Les titres que vous aimez apparaîtront ici</Text>
              <Text style={styles.emptySub}>
                Enregistrez des titres en appuyant sur l'icône cœur.
              </Text>
            </View>
          ) : (
            tracks.map((track) => (
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
                      <Icon name="musical-notes" size={20} color={Colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {isDownloaded(track.id) && (
                        <Icon name="download" size={14} color={Colors.primary} style={{marginRight: 4}} />
                      )}
                      <Text style={styles.trackArtist} numberOfLines={1}>
                        {track.artist?.name || 'Artiste inconnu'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
                  <TouchableOpacity onPress={() => {
                    if (isDownloaded(track.id)) {
                      removeDownload(track.id);
                    } else {
                      downloadTrack(track);
                    }
                  }}>
                    {isDownloading[track.id] ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <Icon 
                        name={isDownloaded(track.id) ? "download" : "download-outline"} 
                        size={22} 
                        color={isDownloaded(track.id) ? Colors.primary : Colors.textMuted} 
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={(e) => {
                      if (e && e.stopPropagation) e.stopPropagation();
                      setOptionsTrack(track);
                    }}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    style={{ padding: 10 }}
                  >
                    <Icon name="ellipsis-horizontal" size={24} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </LinearGradient>

      <TrackOptionsModal
        track={optionsTrack}
        visible={!!optionsTrack}
        onClose={() => setOptionsTrack(null)}
        isLikedView={true}
        onTrackRemoved={(id) => {
          setTracks(prev => prev.filter(t => t.id !== id));
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  scrollContent: { paddingBottom: 120 },

  /* Playlist info */
  playlistInfo: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  bigCover: {
    width: 220,
    height: 220,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    elevation: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  playlistTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    marginBottom: 6,
  },
  playlistMeta: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '500',
  },

  /* Actions */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  actionLeft: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  actionRight: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  playAllBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  /* Tracks */
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  trackLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trackCover: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  trackCoverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: { marginLeft: 16, flex: 1, paddingRight: 12 },
  trackTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '700', marginBottom: 4 },
  trackArtist: { color: Colors.textSecondary, fontSize: FontSize.sm },

  /* Empty */
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800', marginTop: 24, textAlign: 'center' },
  emptySub: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', marginTop: 12, lineHeight: 22 },
});
