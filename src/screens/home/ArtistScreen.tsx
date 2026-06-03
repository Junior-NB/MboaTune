import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
const { width } = Dimensions.get('window');
type ArtistScreenRoute = RouteProp<{ Artist: { artistId: string } }, 'Artist'>;

export default function ArtistScreen() {
  const navigation = useNavigation();
  const route = useRoute<ArtistScreenRoute>();
  const { artistId } = route.params;
  const { playTrack } = usePlayerStore();
  const { toggleFollowArtist, followedArtists } = useLibraryStore();
  const { user } = useAuthStore();

  const [artist, setArtist] = React.useState<any>(null);
  const [artistAlbums, setArtistAlbums] = React.useState<any[]>([]);
  const [artistTracks, setArtistTracks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const isFollowing = followedArtists.includes(artistId);

  React.useEffect(() => {
    const fetchArtistData = async () => {
      setLoading(true);
      const { data: artistData } = await supabase.from('artists').select('*').eq('id', artistId).single();
      if (artistData) {
        setArtist(artistData);
        const { data: albumsData } = await supabase.from('albums').select('*').eq('artist_id', artistId);
        if (albumsData) setArtistAlbums(albumsData);
        const { data: tracksData } = await supabase.from('tracks').select('*, artist:artists(*), album:albums(*)').eq('artist_id', artistId);
        if (tracksData) setArtistTracks(tracksData);
      }
      setLoading(false);
    };
    fetchArtistData();
  }, [artistId]);

  if (!artist) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 16 }}>
          <Icon name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#b3b3b3', fontSize: 16 }}>
            {loading ? 'Chargement...' : 'Artiste introuvable'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: artist.avatar_path || '' }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(18,18,18,0.8)', '#121212']}
            locations={[0.3, 0.7, 1]}
            style={styles.heroOverlay}
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroInfo}>
            {artist.verified && (
              <View style={styles.verifiedRow}>
                <Icon name="checkmark-circle" size={20} color="#3d91f4" />
                <Text style={styles.verifiedText}>Artiste vérifié</Text>
              </View>
            )}
            <Text style={styles.artistName}>{artist.name}</Text>
            <Text style={styles.followersText}>
              {(artist.followers_count / 1000000).toFixed(1)}M auditeurs par mois
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followBtnActive]}
            onPress={() => user && toggleFollowArtist(artistId, user.id)}
          >
            <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
              {isFollowing ? 'Abonné' : "S'abonner"}
            </Text>
          </TouchableOpacity>
          <View style={styles.actionRight}>
            <TouchableOpacity>
              <Icon name="shuffle" size={28} color="#1DB954" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playAllBtn}
              onPress={() => {
                if (artistTracks.length > 0) playTrack(artistTracks[0], artistTracks);
              }}
            >
              <Icon name="play" size={28} color="#000" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Titres populaires */}
        <Text style={styles.sectionTitle}>Titres populaires</Text>
        {artistTracks.map((track, index) => (
          <TouchableOpacity
            key={track.id}
            style={styles.trackItem}
            activeOpacity={0.7}
            onPress={() => playTrack(track, artistTracks)}
          >
            <Text style={styles.trackNumber}>{index + 1}</Text>
            {track.album?.cover_path ? (
              <Image source={{ uri: track.album.cover_path }} style={styles.trackCover} />
            ) : (
              <View style={[styles.trackCover, { justifyContent: 'center', alignItems: 'center' }]}>
                <Icon name="musical-notes" size={16} color="#b3b3b3" />
              </View>
            )}
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
              <Text style={styles.trackPlays}>
                {(track.play_count / 1000).toFixed(0)}K lectures
              </Text>
            </View>
            <TouchableOpacity>
              <Icon name="ellipsis-horizontal" size={18} color="#b3b3b3" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Discographie */}
        {artistAlbums.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Discographie</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
            >
              {artistAlbums.map(album => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.albumCard}
                  onPress={() => (navigation as any).push('Album', { albumId: album.id })}
                >
                  <Image source={{ uri: album.cover_path || '' }} style={styles.albumImage} />
                  <Text style={styles.albumCardTitle} numberOfLines={1}>{album.title}</Text>
                  <Text style={styles.albumCardMeta}>
                    {album.release_date?.slice(0, 4)} · {album.type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Bio */}
        {artist.bio && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 28 }]}>À propos</Text>
            <View style={styles.bioContainer}>
              {artist.avatar_path ? (
                <Image source={{ uri: artist.avatar_path }} style={styles.bioImage} />
              ) : null}
              <Text style={styles.bioText}>{artist.bio}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  /* Hero */
  heroContainer: { height: 350, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  backBtn: { position: 'absolute', top: 12, left: 12, padding: 4 },
  heroInfo: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  verifiedText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  artistName: { color: '#fff', fontSize: 40, fontWeight: '900', marginBottom: 4 },
  followersText: { color: '#b3b3b3', fontSize: 13 },

  /* Actions */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  followBtn: {
    borderWidth: 1,
    borderColor: '#b3b3b3',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followBtnActive: { borderColor: '#1DB954', backgroundColor: 'rgba(29,185,84,0.1)' },
  followBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  followBtnTextActive: { color: '#1DB954' },
  actionRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  playAllBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Section */
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  /* Tracks */
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  trackNumber: { color: '#b3b3b3', fontSize: 15, width: 28 },
  trackCover: { width: 44, height: 44, borderRadius: 4, backgroundColor: '#282828' },
  trackInfo: { flex: 1, marginLeft: 12, paddingRight: 12 },
  trackTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  trackPlays: { color: '#b3b3b3', fontSize: 12 },

  /* Albums */
  albumCard: { width: 150 },
  albumImage: { width: 150, height: 150, borderRadius: 4, backgroundColor: '#282828', marginBottom: 8 },
  albumCardTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  albumCardMeta: { color: '#b3b3b3', fontSize: 12, marginTop: 2 },

  /* Bio */
  bioContainer: { paddingHorizontal: 16, borderRadius: 8, overflow: 'hidden' },
  bioImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 12 },
  bioText: { color: '#b3b3b3', fontSize: 14, lineHeight: 20 },
});
