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
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import ProfileDrawerModal from '../../components/ProfileDrawerModal';
import { supabase } from '../../lib/supabase';
import type { Track } from '../../types/database';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { playTrack, currentTrack, recentTracks, isPlaying, togglePlayPause } = usePlayerStore();
  const { profile } = useAuthStore();
  const [dbTracks, setDbTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  React.useEffect(() => {
    const fetchTracks = async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*, artist:artists(*), album:albums(*)')
        .limit(10);
      
      if (data && !error) {
        setDbTracks(data as Track[]);
      }
      setLoading(false);
    };
    fetchTracks();
  }, []);
  
  const featuredTrack = currentTrack || (dbTracks.length > 0 ? dbTracks[0] : null);
  const isFeaturedPlaying = currentTrack?.id === featuredTrack?.id && isPlaying;

  const handleFeaturedPlay = () => {
    if (!featuredTrack) return;
    if (currentTrack?.id === featuredTrack.id) {
      togglePlayPause();
    } else {
      playTrack(featuredTrack, dbTracks);
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={Colors.gradientDark}
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
              <Text style={styles.logoText}>Mboa<Text style={{ color: Colors.accent }}>Tune</Text></Text>
              <Text style={styles.greetingSub}>{getGreeting()},</Text>
              <Text style={styles.greetingName}>
                {profile?.username || 'Utilisateur'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowProfileDrawer(true)}
            >
              <LinearGradient
                colors={Colors.gradientAccent}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {profile?.username?.[0]?.toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ─── EN CE MOMENT (Featured) ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitleSmall}>EN CE MOMENT</Text>
            </View>

            {featuredTrack ? (
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={styles.featuredCard}
                onPress={handleFeaturedPlay}
              >
                <LinearGradient
                  colors={Colors.gradientCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featuredGradient}
                >
                  <View style={styles.featuredContent}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.featuredTag}>
                        <Icon name="musical-notes" size={14} color={Colors.accentLight} />
                        <Text style={styles.featuredTagText}>TITRE À L'HONNEUR</Text>
                      </View>
                      <Text style={styles.featuredTitle} numberOfLines={2}>{featuredTrack.title}</Text>
                      <Text style={styles.featuredSubtitle} numberOfLines={1}>{featuredTrack.artist?.name || 'Artiste inconnu'}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={handleFeaturedPlay}
                    >
                      <LinearGradient
                        colors={Colors.gradientAccent}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.playButtonLarge}
                      >
                        <Icon name={isFeaturedPlaying ? "pause" : "play"} size={24} color="#FFF" style={!isFeaturedPlaying ? { marginLeft: 3 } : {}} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={[styles.featuredCard, { padding: 20, alignItems: 'center' }]}>
                <Text style={{color: Colors.textMuted}}>Chargement des titres...</Text>
              </View>
            )}
          </View>

          {/* ─── GENRES POPULAIRES ─── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitleSmall}>GENRES POPULAIRES</Text>
            </View>
            <View style={styles.genreGrid}>
              {[
                { title: 'Afrobeat Gold', color: Colors.categories[0], icon: 'musical-notes' },
                { title: 'Highlife Legends', color: Colors.categories[1], icon: 'star' },
                { title: 'Amapiano Wave', color: Colors.categories[2], icon: 'headset' },
                { title: 'Coupé Décalé', color: Colors.categories[3], icon: 'radio' },
              ].map((genre, idx) => (
                <TouchableOpacity key={idx} style={[styles.genreCard, { backgroundColor: genre.color }]}>
                  <Icon name={genre.icon} size={36} color="rgba(255,255,255,0.8)" style={styles.genreIcon} />
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
    paddingBottom: Spacing.xl,
  },
  logoText: {
    color: Colors.primary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  greetingSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  greetingName: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: '#FFF',
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },

  /* Featured Card */
  featuredCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredGradient: {
    padding: Spacing.xl,
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
    color: Colors.accentLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  featuredTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 30,
  },
  featuredSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  playButtonLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  /* Sections */
  section: {
    marginBottom: Spacing.xl + 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionLine: {
    width: 16,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitleSmall: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
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
    height: 120,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  genreIcon: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    opacity: 0.4,
    transform: [{ rotate: '-15deg' }],
  },
  genreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  recentSquareCard: {
    width: (width - 48 - 16) / 2,
    marginBottom: 20,
  },
  recentSquareImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentSquareText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
