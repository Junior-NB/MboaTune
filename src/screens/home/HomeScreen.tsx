import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  StatusBar, Dimensions, FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../theme/spacing';
import {
  mockArtists, mockAlbums, mockTracks, editorialPlaylists, recentItems,
} from '../../data/mockData';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import ProfileDrawerModal from '../../components/ProfileDrawerModal';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { playTrack, currentTrack, recentTracks, isPlaying, togglePlayPause } = usePlayerStore();
  const { profile } = useAuthStore();
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Tout');
  
  const featuredTrack = currentTrack || mockTracks[0];
  const isFeaturedPlaying = currentTrack?.id === featuredTrack.id && isPlaying;

  const handleFeaturedPlay = () => {
    if (currentTrack?.id === featuredTrack.id) {
      togglePlayPause();
    } else {
      playTrack(featuredTrack, mockTracks);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const handlePlayAlbum = (album: any) => {
    (navigation as any).navigate('Album', { albumId: album.id });
  };

  // Section horizontale d'albums/playlists (style Spotify)
  const renderHorizontalCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.albumCard}
      activeOpacity={0.7}
      onPress={() => handlePlayAlbum(item)}
    >
      <Image source={{ uri: item.cover_path }} style={styles.albumImage} />
      <Text style={styles.albumTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.albumSubtitle} numberOfLines={1}>
        {item.artist?.name || 'Artiste'}
      </Text>
    </TouchableOpacity>
  );

  // Section horizontale d'artistes (ronds, style Spotify)
  const renderArtistCircle = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.artistCircle}
      activeOpacity={0.7}
      onPress={() => (navigation as any).navigate('Artist', { artistId: item.id })}
    >
      <Image source={{ uri: item.avatar_path }} style={styles.artistAvatar} />
      <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.artistType}>Artiste</Text>
    </TouchableOpacity>
  );

  // Section horizontale de playlists éditoriales
  const renderEditorial = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.albumCard}
      activeOpacity={0.7}
      onPress={() => {
        if (item.tracks?.length) {
          playTrack(item.tracks[0], item.tracks);
        }
      }}
    >
      <Image source={{ uri: item.cover }} style={styles.albumImage} />
      <Text style={styles.albumTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.albumSubtitle} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#17221A', '#0F1511', '#0F1511']}
        locations={[0, 0.4, 1]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ─── HEADER ─── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.logoText}>Mboa<Text style={{color: Colors.primary}}>Tune</Text></Text>
              <Text style={styles.greetingSub}>{getGreeting()},</Text>
              <Text style={styles.greetingName}>
                {profile?.username || 'Utilisateur'} 👋
              </Text>
            </View>

            <TouchableOpacity
              style={styles.avatar}
              onPress={() => setShowProfileDrawer(true)}
            >
              <Text style={styles.avatarText}>
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── EN CE MOMENT (Featured) ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitleSmall}>EN CE MOMENT</Text>
            </View>

            <TouchableOpacity 
              activeOpacity={0.9} 
              style={styles.featuredCard}
              onPress={handleFeaturedPlay}
            >
              <LinearGradient
                colors={['rgba(216,127,48,0.2)', 'rgba(216,127,48,0.05)']}
                style={styles.featuredGradient}
              >
                <View style={styles.featuredContent}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.featuredTag}>
                      <Icon name="musical-notes" size={12} color={Colors.primary} />
                      <Text style={styles.featuredTagText}>TITRE À L'HONNEUR</Text>
                    </View>
                    <Text style={styles.featuredTitle} numberOfLines={2}>{featuredTrack.title}</Text>
                    <Text style={styles.featuredSubtitle} numberOfLines={1}>{featuredTrack.artist?.name || 'Artiste inconnu'}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.playButtonLarge}
                    onPress={handleFeaturedPlay}
                  >
                    <Icon name={isFeaturedPlaying ? "pause" : "play"} size={24} color="#000" style={!isFeaturedPlaying ? { marginLeft: 3 } : {}} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ─── GENRES POPULAIRES ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitleSmall}>GENRES POPULAIRES</Text>
            </View>
            <View style={styles.genreGrid}>
              {[
                { title: 'Afrobeat Gold', color: '#B84335', icon: 'musical-notes' },
                { title: 'Highlife Legends', color: '#247D68', icon: 'star' },
                { title: 'Amapiano Wave', color: '#B4931A', icon: 'headset' },
                { title: 'Coupé Décalé', color: '#28588A', icon: 'radio' },
              ].map((genre, idx) => (
                <TouchableOpacity key={idx} style={[styles.genreCard, { backgroundColor: genre.color }]}>
                  <Icon name={genre.icon} size={32} color="#fff" style={styles.genreIcon} />
                  <Text style={styles.genreText}>{genre.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* ─── RÉCEMMENT JOUÉS ─── */}
          {recentTracks && recentTracks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionTitleSmall}>RÉCEMMENT JOUÉS</Text>
              </View>
              <View style={styles.genreGrid}>
                {recentTracks.slice(0, 4).map((track) => (
                  <TouchableOpacity 
                    key={track.id} 
                    style={styles.recentSquareCard}
                    onPress={() => playTrack(track, recentTracks)}
                  >
                    <Image 
                      source={{ uri: track.album?.cover_path || 'https://via.placeholder.com/150' }} 
                      style={styles.recentSquareImage} 
                    />
                    <Text style={styles.recentSquareText} numberOfLines={2}>{track.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        </ScrollView>
      </LinearGradient>

      <ProfileDrawerModal
        visible={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
      />
    </SafeAreaView>
  );
}

/* ────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: Spacing.lg,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  logoText: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  greetingSub: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  greetingName: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* Featured Card */
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  featuredGradient: {
    padding: Spacing.lg,
  },
  featuredContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredTagText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 4,
  },
  featuredTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 28,
  },
  featuredSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  playButtonLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  /* Sections */
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionLine: {
    width: 12,
    height: 2,
    backgroundColor: Colors.textSecondary,
    marginRight: 8,
  },
  sectionTitleSmall: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },

  /* Grilles */
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  genreCard: {
    width: (width - 48 - 16) / 2, // padding horizontal 24*2 + gap 16
    height: 110,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  genreIcon: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    opacity: 0.3,
    transform: [{ rotate: '-15deg' }],
  },
  genreText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  
  recentSquareCard: {
    width: (width - 48 - 16) / 2,
    marginBottom: 16,
  },
  recentSquareImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentSquareText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
