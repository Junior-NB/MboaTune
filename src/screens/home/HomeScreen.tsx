import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  FlatList, StatusBar, Dimensions,
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
  const { playTrack } = usePlayerStore();
  const { profile } = useAuthStore();
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Tout');

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
        colors={['#1a3a2a', '#121212', '#121212']}
        locations={[0, 0.35, 1]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ─── HEADER ─── */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => setShowProfileDrawer(true)}
            >
              <Text style={styles.avatarText}>
                {profile?.display_name?.[0]?.toUpperCase() || 'U'}
              </Text>
            </TouchableOpacity>

            {['Tout', 'Musique', 'Podcasts'].map(label => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.pill,
                  activeFilter === label && styles.pillActive,
                ]}
                onPress={() => setActiveFilter(label)}
              >
                <Text
                  style={[
                    styles.pillText,
                    activeFilter === label && styles.pillTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ─── GRILLE RÉCENTS 2×3 ─── */}
          <View style={styles.recentGrid}>
            {recentItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.recentCard}
                activeOpacity={0.8}
                onPress={() => {
                  if (item.type === 'liked') (navigation as any).navigate('LikedTracks');
                  if (item.type === 'album') (navigation as any).navigate('Album', { albumId: mockAlbums.find(a => a.title === item.title)?.id });
                }}
              >
                {item.type === 'liked' ? (
                  <LinearGradient
                    colors={item.gradient as any}
                    style={styles.recentImage}
                  >
                    <Icon name="heart" size={22} color="#fff" />
                  </LinearGradient>
                ) : (
                  <Image source={{ uri: item.image }} style={styles.recentImage} />
                )}
                <Text style={styles.recentText} numberOfLines={2}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ─── SECTION : Conçu pour vous ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conçu pour vous</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={editorialPlaylists}
              keyExtractor={i => i.id}
              renderItem={renderEditorial}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* ─── SECTION : Écouté récemment ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Écouté récemment</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={mockAlbums}
              keyExtractor={i => i.id}
              renderItem={renderHorizontalCard}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* ─── SECTION : Vos artistes préférés ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vos artistes préférés</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={mockArtists}
              keyExtractor={i => i.id}
              renderItem={renderArtistCircle}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* ─── SECTION : Albums populaires ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Albums populaires</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[...mockAlbums].reverse()}
              keyExtractor={i => i.id}
              renderItem={renderHorizontalCard}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* ─── SECTION : Mix quotidien ─── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vos mix quotidiens</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={editorialPlaylists.slice(0, 4)}
              keyExtractor={i => i.id}
              renderItem={renderEditorial}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

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
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#b388ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  avatarText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#1DB954',
  },
  pillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#000',
    fontWeight: '700',
  },

  /* Grille récents */
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  recentCard: {
    width: '48.5%',
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  recentImage: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentText: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
  },

  /* Sections */
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginLeft: Spacing.md,
    marginBottom: 12,
  },
  horizontalList: {
    paddingHorizontal: Spacing.md,
    gap: 12,
  },

  /* Album / Playlist cards */
  albumCard: {
    width: 150,
  },
  albumImage: {
    width: 150,
    height: 150,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#282828',
  },
  albumTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
    lineHeight: 18,
  },
  albumSubtitle: {
    color: '#b3b3b3',
    fontSize: 12,
    lineHeight: 16,
  },

  /* Artistes ronds */
  artistCircle: {
    width: 130,
    alignItems: 'center',
  },
  artistAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 8,
    backgroundColor: '#282828',
  },
  artistName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  artistType: {
    color: '#b3b3b3',
    fontSize: 11,
    marginTop: 2,
  },
});
