import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { useDownloadStore } from '../store/downloadStore';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import type { Track } from '../types/database';

interface TrackOptionsModalProps {
  track: Track | null;
  visible: boolean;
  onClose: () => void;
  onDeleteImported?: (trackId: string) => void;
  isLikedView?: boolean;
  playlistId?: string;
  onTrackRemoved?: (trackId: string) => void;
}

const { height } = Dimensions.get('window');

export default function TrackOptionsModal({ track, visible, onClose, onDeleteImported, isLikedView, playlistId, onTrackRemoved }: TrackOptionsModalProps) {
  const [showPlaylists, setShowPlaylists] = useState(false);
  const { playlists, addTrackToPlaylist, toggleLikeTrack, removeTrackFromPlaylist } = useLibraryStore();
  const { addToQueue } = usePlayerStore();
  const { user } = useAuthStore();
  const { isDownloaded, getLocalPath } = useDownloadStore();

  if (!track) return null;

  const handleAddToQueue = () => {
    addToQueue(track);
    onClose();
  };

  const handleShare = async () => {
    try {
      const path = getLocalPath(track.id);
      if (!path) {
        Alert.alert('Erreur', 'Le chemin du fichier est introuvable.');
        return;
      }

      const shareUrl = path.startsWith('file://') ? path : `file://${path}`;

      await Share.open({
        url: shareUrl,
        type: 'audio/mpeg',
        title: `Partager ${track.title}`,
        message: `Écoute ce son : ${track.title} !`
      });
    } catch (e: any) {
      if (e.message !== 'User did not share') {
        Alert.alert('Erreur de partage', String(e.message || e));
      }
    }
    onClose();
  };

const handleAddToPlaylist = (pId: string) => {
  if (user) {
    addTrackToPlaylist(pId, track.id, user.id);
  }
  setShowPlaylists(false);
  onClose();
};

const handleUnlike = async () => {
  if (user) {
    await toggleLikeTrack(track.id, user.id);
    if (onTrackRemoved) onTrackRemoved(track.id);
  }
  onClose();
};

const handleRemoveFromPlaylist = async () => {
  if (playlistId) {
    await removeTrackFromPlaylist(playlistId, track.id);
    if (onTrackRemoved) onTrackRemoved(track.id);
  }
  onClose();
};

const isLocal = track.id.startsWith('local-import-');

return (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
        <View style={styles.header}>
          <View style={styles.dragHandle} />
          <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
          <Text style={styles.trackArtist} numberOfLines={1}>{track.artist?.name || 'Artiste inconnu'}</Text>
        </View>

        {!showPlaylists ? (
          <View style={styles.optionsList}>
            <TouchableOpacity style={styles.optionItem} onPress={handleAddToQueue}>
              <Icon name="list-outline" size={24} color="#fff" />
              <Text style={styles.optionText}>Ajouter à la file d'attente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={() => setShowPlaylists(true)}>
              <Icon name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.optionText}>Ajouter à une playlist</Text>
            </TouchableOpacity>

            {isDownloaded(track.id) && (
              <TouchableOpacity style={styles.optionItem} onPress={handleShare}>
                <Icon name="share-social-outline" size={24} color="#1DB954" />
                <Text style={[styles.optionText, { color: '#1DB954' }]}>Partager le fichier MP3</Text>
              </TouchableOpacity>
            )}

            {playlistId && (
              <TouchableOpacity style={styles.optionItem} onPress={handleRemoveFromPlaylist}>
                <Icon name="trash-outline" size={24} color="#FF3B30" />
                <Text style={[styles.optionText, { color: '#FF3B30' }]}>Retirer de la playlist</Text>
              </TouchableOpacity>
            )}

            {isLikedView && (
              <TouchableOpacity style={styles.optionItem} onPress={handleUnlike}>
                <Icon name="heart-dislike-outline" size={24} color="#FF3B30" />
                <Text style={[styles.optionText, { color: '#FF3B30' }]}>Retirer des titres likés</Text>
              </TouchableOpacity>
            )}

            {isLocal && onDeleteImported && (
              <TouchableOpacity style={styles.optionItem} onPress={() => { onDeleteImported(track.id); onClose(); }}>
                <Icon name="trash-outline" size={24} color="#FF3B30" />
                <Text style={[styles.optionText, { color: '#FF3B30' }]}>Supprimer ce titre importé</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.playlistsContainer}>
            <View style={styles.playlistHeader}>
              <TouchableOpacity onPress={() => setShowPlaylists(false)}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.playlistTitle}>Choisir une playlist</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.playlistsScroll}>
              {playlists.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Aucune playlist disponible.</Text>
                </View>
              ) : (
                playlists.map(p => (
                  <TouchableOpacity key={p.id} style={styles.playlistItem} onPress={() => handleAddToPlaylist(p.id)}>
                    <Icon name="musical-notes-outline" size={24} color={Colors.primary} />
                    <Text style={styles.playlistItemText}>{p.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#282828',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Spacing.xl,
    maxHeight: height * 0.7,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  trackArtist: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 4,
  },
  optionsList: {
    paddingVertical: Spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: Spacing.md,
  },
  playlistsContainer: {
    flex: 1,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playlistsScroll: {
    maxHeight: 300,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  playlistItemText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 15,
  },
});
