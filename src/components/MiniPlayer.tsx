import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useProgress } from 'react-native-track-player';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, FontSize, MINI_PLAYER_HEIGHT } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlayPause } = usePlayerStore();
  const { isTrackLiked, toggleLikeTrack } = useLibraryStore();
  const { user } = useAuthStore();
  const progress = useProgress();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  if (!currentTrack) return null;

  const liked = isTrackLiked(currentTrack.id);

  const handleToggleLike = () => {
    if (currentTrack && user) {
      toggleLikeTrack(currentTrack.id, user.id);
    }
  };

  const progressPercent = progress.duration > 0 
    ? (progress.position / progress.duration) * 100 
    : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.container, { bottom: 60 + insets.bottom }]}
      onPress={() => navigation.navigate('PlayerModal')}
    >
      <LinearGradient
        colors={['#1F2937', '#374151']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {currentTrack.album?.cover_path && currentTrack.album.cover_path.includes('placeholder.com') ? (
            <View style={[styles.cover, { backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }]}>
              <Icon name="musical-notes" size={20} color={Colors.primary} />
            </View>
          ) : (
            <Image
              source={{ uri: currentTrack.album?.cover_path || 'https://via.placeholder.com/150' }}
              style={styles.cover}
            />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist?.name || 'Artiste inconnu'}
            </Text>
          </View>

          {/* Like button */}
          <TouchableOpacity style={styles.controlButton} onPress={handleToggleLike}>
            <Icon
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? Colors.accent : Colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
            <Icon
              name={isPlaying ? "pause" : "play"}
              size={26}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.progressBackground}>
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MINI_PLAYER_HEIGHT,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 50,
    left: Spacing.sm,
    right: Spacing.sm,
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  cover: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.sm,
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  artist: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  controlButton: {
    padding: Spacing.sm,
  },
  progressBackground: {
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  progressFill: {
    height: '100%',
  },
});
