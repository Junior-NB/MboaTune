import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
type AlbumScreenRoute = RouteProp<{ Album: { albumId: string } }, 'Album'>;

export default function AlbumScreen() {
  const navigation = useNavigation();
  const route = useRoute<AlbumScreenRoute>();
  const { albumId } = route.params;
  const { playTrack } = usePlayerStore();
  const { isTrackLiked, toggleLikeTrack } = useLibraryStore();
  const { user } = useAuthStore();

  const [album, setAlbum] = React.useState<any>(null);
  const [artist, setArtist] = React.useState<any>(null);
  const [albumTracks, setAlbumTracks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAlbumData = async () => {
      setLoading(true);
      const { data: albumData } = await supabase.from('albums').select('*').eq('id', albumId).single();
      if (albumData) {
        setAlbum(albumData);
        if (albumData.artist_id) {
          const { data: artistData } = await supabase.from('artists').select('*').eq('id', albumData.artist_id).single();
          if (artistData) setArtist(artistData);
        }
        const { data: tracksData } = await supabase.from('tracks').select('*, artist:artists(*), album:albums(*)').eq('album_id', albumId);
        if (tracksData) setAlbumTracks(tracksData);
      }
      setLoading(false);
    };
    fetchAlbumData();
  }, [albumId]);

  if (!album) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 16 }}>
          <Icon name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#b3b3b3', fontSize: 16 }}>
            {loading ? 'Chargement...' : 'Album introuvable'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#535353', '#282828', '#121212']}
        locations={[0, 0.35, 0.65]}
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
          {/* Album cover & info */}
          <View style={styles.albumInfo}>
            <Image source={{ uri: album.cover_path || '' }} style={styles.albumCover} />
            <Text style={styles.albumTitle}>{album.title}</Text>
            <View style={styles.artistRow}>
              {artist?.avatar_path ? (
                <Image source={{ uri: artist.avatar_path }} style={styles.artistAvatar} />
              ) : null}
              <Text style={styles.artistName}>{artist?.name || 'Artiste'}</Text>
            </View>
            <Text style={styles.albumMeta}>
              {album.type?.toUpperCase()} · {album.release_date?.slice(0, 4)}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <TouchableOpacity>
                <Icon name="heart-outline" size={24} color="#b3b3b3" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name="download-outline" size={24} color="#b3b3b3" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon name="ellipsis-horizontal" size={24} color="#b3b3b3" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionRight}>
              <TouchableOpacity>
                <Icon name="shuffle" size={28} color="#1DB954" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playAllBtn}
                onPress={() => {
                  if (albumTracks.length > 0) playTrack(albumTracks[0], albumTracks);
                }}
              >
                <Icon name="play" size={28} color="#000" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Track list */}
          {albumTracks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucun titre dans cet album</Text>
            </View>
          ) : (
            albumTracks.map((track, index) => {
              const liked = isTrackLiked(track.id);
              return (
                <TouchableOpacity
                  key={track.id}
                  style={styles.trackItem}
                  activeOpacity={0.7}
                  onPress={() => playTrack(track, albumTracks)}
                >
                  <View style={styles.trackLeft}>
                    <Text style={styles.trackNumber}>{index + 1}</Text>
                    <View style={styles.trackInfo}>
                      <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                      <Text style={styles.trackArtist} numberOfLines={1}>
                        {track.artist?.name || 'Artiste inconnu'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.trackRight}>
                    <TouchableOpacity onPress={() => user && toggleLikeTrack(track.id, user.id)}>
                      <Icon
                        name={liked ? 'heart' : 'heart-outline'}
                        size={20}
                        color={liked ? '#1DB954' : '#b3b3b3'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Icon name="ellipsis-horizontal" size={18} color="#b3b3b3" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
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

  /* Album info */
  albumInfo: { alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 },
  albumCover: {
    width: 220,
    height: 220,
    borderRadius: 4,
    backgroundColor: '#282828',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  albumTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  artistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  artistAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  artistName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  albumMeta: { color: '#b3b3b3', fontSize: 13 },

  /* Actions */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionLeft: { flexDirection: 'row', gap: 20 },
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
    paddingVertical: 12,
  },
  trackLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trackNumber: { color: '#b3b3b3', fontSize: 15, width: 28 },
  trackInfo: { flex: 1, paddingRight: 12 },
  trackTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  trackArtist: { color: '#b3b3b3', fontSize: 13 },
  trackRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: '#b3b3b3', fontSize: 14 },
});
