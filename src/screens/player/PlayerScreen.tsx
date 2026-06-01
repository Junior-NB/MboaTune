import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import Animated, { FadeInDown, FadeIn, SlideInDown } from 'react-native-reanimated';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useAuthStore } from '../../store/authStore';
import { useDownloadStore } from '../../store/downloadStore';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, FontSize, IconSize } from '../../theme/spacing';
import TrackOptionsModal from '../../components/TrackOptionsModal';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width - 48;

export default function PlayerScreen() {
  const navigation = useNavigation();
  const {
    currentTrack, queue, isPlaying, togglePlayPause,
    skipToNext, skipToPrevious, isShuffle,
    toggleShuffle, repeatMode, toggleRepeat, seekTo,
  } = usePlayerStore();
  const { isTrackLiked, toggleLikeTrack } = useLibraryStore();
  const { user } = useAuthStore();
  const { downloadTrack, removeDownload, isDownloaded, isDownloading } = useDownloadStore();
  const progress = useProgress(200);

  const [showOptions, setShowOptions] = useState(false);

  const liked = currentTrack ? isTrackLiked(currentTrack.id) : false;
  const downloaded = currentTrack ? isDownloaded(currentTrack.id) : false;
  const downloading = currentTrack ? isDownloading[currentTrack.id] : false;

  const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
  const nextTrack = currentIndex !== -1 && currentIndex + 1 < queue.length 
    ? queue[currentIndex + 1] 
    : null;

  const handleToggleLike = () => {
    if (currentTrack && user) {
      toggleLikeTrack(currentTrack.id, user.id);
    }
  };

  const handleDownload = () => {
    if (currentTrack) {
      if (downloaded) {
        removeDownload(currentTrack.id);
      } else {
        downloadTrack(currentTrack);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentTrack) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="musical-notes-outline" size={64} color="#535353" />
        <Text style={styles.emptyText}>Aucun titre en cours</Text>
      </View>
    );
  }

  const hasLocalCover = !currentTrack.album?.cover_path ||
    currentTrack.album.cover_path.includes('placeholder.com') ||
    currentTrack.album.cover_path === '';

  return (
    <LinearGradient
      colors={['#281E15', '#0F1511', '#0F1511']}
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ─── HEADER ─── */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="chevron-down" size={28} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>EN ÉCOUTE</Text>
        </View>
        <TouchableOpacity onPress={() => setShowOptions(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="ellipsis-horizontal" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      {/* ─── POCHETTE ─── */}
      <Animated.View entering={FadeIn.duration(500).delay(200)} style={styles.artworkContainer}>
        {hasLocalCover ? (
          <View style={styles.artworkPlaceholder}>
            <Icon name="musical-notes" size={80} color="#535353" />
          </View>
        ) : (
          <Image
            source={{ uri: currentTrack.album?.cover_path }}
            style={styles.artwork}
          />
        )}
      </Animated.View>

      {/* ─── INFOS ─── */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.infoRow}>
        <View style={styles.infoText}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist?.name || 'Artiste inconnu'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={handleDownload}>
            {downloading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Icon
                name={downloaded ? 'checkmark-circle' : 'download-outline'}
                size={26}
                color={downloaded ? Colors.primary : Colors.textPrimary}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToggleLike}>
            <Icon
              name={liked ? 'heart' : 'heart-outline'}
              size={26}
              color={liked ? Colors.primary : Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ─── BARRE DE PROGRESSION ─── */}
      <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          value={progress.position}
          minimumValue={0}
          maximumValue={progress.duration || 1}
          onSlidingComplete={(value) => seekTo(value)}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor="rgba(255,255,255,0.1)"
          thumbTintColor={Colors.primary}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
          <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
        </View>
      </Animated.View>

      {/* ─── CONTRÔLES ─── */}
      <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.controls}>
        <TouchableOpacity onPress={toggleShuffle}>
          <Icon
            name="shuffle"
            size={24}
            color={isShuffle ? Colors.primary : Colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipToPrevious}>
          <Icon name="play-skip-back" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={36}
            color="#121212"
            style={!isPlaying ? { marginLeft: 3 } : undefined}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipToNext}>
          <Icon name="play-skip-forward" size={32} color={Colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleRepeat} style={{ position: 'relative' }}>
          <Icon
            name="repeat"
            size={24}
            color={repeatMode !== 'off' ? Colors.primary : Colors.textMuted}
          />
          {repeatMode === 'track' && (
            <View style={styles.repeatBadge}>
              <Text style={styles.repeatBadgeText}>1</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* ─── PROCHAINS TITRES ─── */}
      <Animated.View entering={SlideInDown.duration(500).delay(600)} style={styles.upNextContainer}>
        <View style={styles.upNextHeader}>
          <Icon name="musical-notes" size={16} color={Colors.textSecondary} />
          <Text style={styles.upNextTitle}>PROCHAIN TITRE</Text>
        </View>
        <View style={styles.upNextCard}>
          {nextTrack?.album?.cover_path && !nextTrack.album.cover_path.includes('placeholder') ? (
            <Image source={{ uri: nextTrack.album.cover_path }} style={[styles.upNextIconBox, { backgroundColor: 'transparent' }]} />
          ) : (
            <View style={styles.upNextIconBox}>
              <Icon name="musical-note" size={24} color="#fff" />
            </View>
          )}
          <View style={styles.upNextInfo}>
            <Text style={styles.upNextTrackName} numberOfLines={1}>
              {nextTrack ? nextTrack.title : 'Fin de la liste'}
            </Text>
            <Text style={styles.upNextTrackArtist} numberOfLines={1}>
              {nextTrack ? (nextTrack.artist?.name || 'Artiste inconnu') : 'Ajoutez plus de titres'}
            </Text>
          </View>
        </View>
      </Animated.View>

      <TrackOptionsModal
        track={currentTrack}
        visible={showOptions}
        onClose={() => setShowOptions(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 16,
    marginTop: 16,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  headerLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },

  /* Pochette */
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 8,
    backgroundColor: '#282828',
  },
  artworkPlaceholder: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 8,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Info */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },

  /* Progression */
  progressContainer: {
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },

  /* Contrôles */
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  playButton: {
    width: 72,
    height: 72,
    backgroundColor: Colors.primary,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  /* Prochains titres */
  upNextContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginTop: 'auto',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  upNextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  upNextTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  upNextCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upNextIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.categories[3],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upNextInfo: {
    flex: 1,
  },
  upNextTrackName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  upNextTrackArtist: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  repeatBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#121212',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatBadgeText: {
    color: Colors.primary,
    fontSize: 8,
    fontWeight: 'bold',
  },
});
