import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
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
      <View style={styles.content}>
        {currentTrack.album?.cover_path && currentTrack.album.cover_path.includes('placeholder.com') ? (
          <View style={[styles.cover, { backgroundColor: '#1E3264', justifyContent: 'center', alignItems: 'center' }]}>
            <Icon name="musical-notes" size={20} color="#FFF" />
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

        {/* Devices icon */}
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="desktop-outline" size={20} color="#b3b3b3" />
        </TouchableOpacity>

        {/* Like button */}
        <TouchableOpacity style={styles.controlButton} onPress={handleToggleLike}>
          <Icon
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? '#1DB954' : '#fff'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
          <Icon
            name={isPlaying ? "pause" : "play"}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MINI_PLAYER_HEIGHT,
    backgroundColor: '#4A3B39',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 50,
    left: Spacing.sm,
    right: Spacing.sm,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  cover: {
    width: 40,
    height: 40,
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
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  controlButton: {
    padding: Spacing.sm,
  },
  progressBackground: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.textPrimary,
  },
});
