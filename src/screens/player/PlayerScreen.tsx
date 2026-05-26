import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, FontSize, IconSize } from '../../theme/spacing';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width - 48;

export default function PlayerScreen() {
  const navigation = useNavigation();
  const {
    currentTrack, isPlaying, togglePlayPause,
    skipToNext, skipToPrevious, isShuffle,
    toggleShuffle, repeatMode, toggleRepeat, seekTo,
  } = usePlayerStore();
  const { isTrackLiked, toggleLikeTrack } = useLibraryStore();
  const { user } = useAuthStore();
  const progress = useProgress(200);

  const liked = currentTrack ? isTrackLiked(currentTrack.id) : false;

  const handleToggleLike = () => {
    if (currentTrack && user) {
      toggleLikeTrack(currentTrack.id, user.id);
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
      colors={['#535353', '#1a1a1a', '#121212']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>LECTURE EN COURS</Text>
          <Text style={styles.headerSource} numberOfLines={1}>
            {currentTrack.album?.title || 'Ma playlist'}
          </Text>
        </View>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="ellipsis-horizontal" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ─── POCHETTE ─── */}
      <View style={styles.artworkContainer}>
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
      </View>

      {/* ─── INFOS ─── */}
      <View style={styles.infoRow}>
        <View style={styles.infoText}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist?.name || 'Artiste inconnu'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleToggleLike}>
          <Icon
            name={liked ? 'heart' : 'heart-outline'}
            size={26}
            color={liked ? '#1DB954' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* ─── BARRE DE PROGRESSION ─── */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          value={progress.position}
          minimumValue={0}
          maximumValue={progress.duration || 1}
          onSlidingComplete={(value) => seekTo(value)}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor="#fff"
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
          <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
        </View>
      </View>

      {/* ─── CONTRÔLES ─── */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleShuffle}>
          <Icon
            name="shuffle"
            size={24}
            color={isShuffle ? '#1DB954' : '#b3b3b3'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipToPrevious}>
          <Icon name="play-skip-back" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={36}
            color="#000"
            style={!isPlaying ? { marginLeft: 3 } : undefined}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipToNext}>
          <Icon name="play-skip-forward" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleRepeat} style={{ position: 'relative' }}>
          <Icon
            name="repeat"
            size={24}
            color={repeatMode !== 'off' ? '#1DB954' : '#b3b3b3'}
          />
          {repeatMode === 'track' && (
            <View style={styles.repeatBadge}>
              <Text style={styles.repeatBadgeText}>1</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── BARRE DU BAS ─── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity>
          <Icon name="desktop-outline" size={18} color="#b3b3b3" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="share-social-outline" size={18} color="#b3b3b3" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="list" size={18} color="#b3b3b3" />
        </TouchableOpacity>
      </View>
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
    marginBottom: 24,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  headerLabel: {
    color: '#b3b3b3',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  headerSource: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
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
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 15,
    fontWeight: '500',
  },

  /* Progression */
  progressContainer: {
    marginBottom: 12,
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
    color: '#b3b3b3',
    fontSize: 11,
    fontWeight: '500',
  },

  /* Contrôles */
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    backgroundColor: '#fff',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Bottom bar */
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 'auto',
    paddingBottom: 36,
  },
  repeatBadge: {
    position: 'absolute',
    top: 6,
    right: 4,
    backgroundColor: '#121212',
    borderRadius: 6,
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatBadgeText: {
    color: '#1DB954',
    fontSize: 8,
    fontWeight: 'bold',
  },
});
