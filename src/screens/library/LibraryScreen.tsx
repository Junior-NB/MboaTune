import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Modal, TextInput, Alert, StatusBar, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { pick, types, isCancel } from '@react-native-documents/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../theme/spacing';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { mockAlbums, mockArtists, mockTracks } from '../../data/mockData';
import ProfileDrawerModal from '../../components/ProfileDrawerModal';
import { scanLocalMusic } from '../../utils/localScanner';
import type { Track } from '../../types/database';
import TrackOptionsModal from '../../components/TrackOptionsModal';
import { useNavigation } from '@react-navigation/native';

type FilterTab = 'Playlists' | 'Albums' | 'Artistes' | 'Sur mon tel';

export default function LibraryScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<FilterTab>('Playlists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedTracksToCreate, setSelectedTracksToCreate] = useState<string[]>([]);
  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);
  const { playlists, createPlaylist, likedTracks, importedTracks, addImportedTrack, removeImportedTrack } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const { user, profile } = useAuthStore();

  useEffect(() => {
    if (activeTab === 'Sur mon tel') {
      loadLocalMusic();
    }
  }, [activeTab]);

  const loadLocalMusic = async () => {
    try {
      const scanned = await scanLocalMusic();
      const importedIds = importedTracks.filter(t => t.id.startsWith('local-import-')).map(t => t.id);
      const newScanned = scanned.filter(t => !importedIds.includes(t.id));
      newScanned.forEach(t => addImportedTrack(t));
    } catch {}
  };

  const handleImportMusic = async () => {
    try {
      const results = await pick({
        type: [types.audio],
        allowMultiSelection: true,
      });

      const newLocalTracks = results.map(file => ({
        id: `local-import-${file.uri}`,
        title: file.name?.replace(/\.[^/.]+$/, "") || 'Fichier inconnu',
        artist_id: 'local',
        album_id: 'local',
        duration_ms: 0,
        file_path: file.uri,
        preview_url: null,
        play_count: 0,
        is_public: false,
        created_at: new Date().toISOString(),
        artist: {
          id: 'local', name: 'Fichier local', bio: null,
          avatar_path: '', verified: false, followers_count: 0,
        },
        album: {
          id: 'local', title: 'Mon Téléphone', artist_id: 'local',
          release_date: new Date().toISOString(),
          cover_path: '', type: 'album',
        }
      }));

      newLocalTracks.forEach(t => addImportedTrack(t as any));
    } catch (err) {
      if (isCancel(err)) {
        // annulé
      } else {
        Alert.alert('Erreur', "Impossible d'importer le fichier audio.");
      }
    }
  };

  const handleCreatePlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;
    const res = await createPlaylist(newPlaylistName.trim());
    
    if (res.error) {
      Alert.alert('Erreur', `Impossible de créer la playlist : ${res.error}`);
      return;
    }

    if (res.data && selectedTracksToCreate.length > 0) {
      for (const trackId of selectedTracksToCreate) {
        await useLibraryStore.getState().addTrackToPlaylist(res.data.id, trackId, user.id);
      }
    }
    setNewPlaylistName('');
    setSelectedTracksToCreate([]);
    setShowCreateModal(false);
  };

  const toggleSelectTrackToCreate = (trackId: string) => {
    setSelectedTracksToCreate(prev =>
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  const availableTracksForPlaylist = [
    ...mockTracks.filter(t => likedTracks.includes(t.id)),
    ...importedTracks
  ];

  const tabs: FilterTab[] = ['Playlists', 'Albums', 'Artistes', 'Sur mon tel'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>

        {/* ─── HEADER ─── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => setShowProfileDrawer(true)}
            >
              <Text style={styles.avatarText}>
                {profile?.display_name?.[0]?.toUpperCase() || 'U'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bibliothèque</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <Icon name="search" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => setShowCreateModal(true)}
            >
              <Icon name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── TABS ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ─── SORT BAR ─── */}
        <View style={styles.sortBar}>
          <Icon name="swap-vertical" size={16} color="#fff" />
          <Text style={styles.sortText}>Récents</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity>
            <Icon name="grid-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ─── CONTENU ─── */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'Playlists' && (
            <View>
              {/* Titres likés */}
              <TouchableOpacity
                style={styles.listItem}
                activeOpacity={0.7}
                onPress={() => (navigation as any).navigate('LikedTracks')}
              >
                <LinearGradient
                  colors={[Colors.primary, '#8e8ee5']}
                  style={styles.likedCover}
                >
                  <Icon name="heart" size={20} color="#fff" />
                </LinearGradient>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>Titres likés</Text>
                  <View style={styles.itemMeta}>
                    <Icon name="push-outline" size={12} color={Colors.primary} />
                    <Text style={styles.itemSubtitle}>
                      Playlist · {likedTracks?.length || 0} titres
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Playlists créées */}
              {playlists.map(p => (
                <TouchableOpacity key={p.id} style={styles.listItem} activeOpacity={0.7}>
                  <View style={styles.playlistCover}>
                    <Icon name="musical-notes" size={22} color="#b3b3b3" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{p.name}</Text>
                    <Text style={styles.itemSubtitle}>
                      Playlist · {p.track_ids?.length || 0} titres
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'Albums' && (
            <View>
              {mockAlbums.map(album => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.listItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    const track = {
                      id: `track-${album.id}`, title: album.title,
                      artist_id: album.artist_id, album_id: album.id,
                      duration_ms: 210000,
                      file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                      preview_url: null, play_count: 0, is_public: true,
                      created_at: new Date().toISOString(),
                      artist: album.artist, album: album,
                    };
                    playTrack(track as any);
                  }}
                >
                  <Image source={{ uri: album.cover_path }} style={styles.artwork} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{album.title}</Text>
                    <Text style={styles.itemSubtitle}>
                      Album · {album.artist?.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'Artistes' && (
            <View>
              {mockArtists.map(artist => (
                <TouchableOpacity key={artist.id} style={styles.listItem} activeOpacity={0.7}>
                  <Image
                    source={{ uri: artist.avatar_path }}
                    style={styles.artistImage}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{artist.name}</Text>
                    <Text style={styles.itemSubtitle}>Artiste</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'Sur mon tel' && (
            <View>
              {/* Boutons d'action */}
              <View style={styles.localHeader}>
                <Text style={styles.localCount}>
                  {importedTracks.length} titre{importedTracks.length !== 1 ? 's' : ''} trouvé{importedTracks.length !== 1 ? 's' : ''}
                </Text>
                <View style={styles.localActions}>
                  <TouchableOpacity
                    style={styles.importBtn}
                    onPress={handleImportMusic}
                  >
                    <Icon name="folder-open" size={18} color="#fff" />
                    <Text style={styles.importBtnText}>Importer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={loadLocalMusic}
                  >
                    <Icon name="refresh" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {importedTracks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="phone-portrait-outline" size={48} color="#535353" />
                  <Text style={styles.emptyTitle}>Aucun titre sur cet appareil</Text>
                  <Text style={styles.emptySub}>
                    Importez de la musique depuis votre téléphone
                  </Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={handleImportMusic}>
                    <Text style={styles.emptyBtnText}>Parcourir les fichiers</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                importedTracks.map(track => (
                  <TouchableOpacity
                    key={track.id}
                    style={styles.listItem}
                    activeOpacity={0.7}
                    onPress={() => playTrack(track, importedTracks)}
                  >
                    <View style={styles.localCover}>
                      <Icon name="musical-notes" size={20} color="#b3b3b3" />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {track.title}
                      </Text>
                      <Text style={styles.itemSubtitle}>Fichier local</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setOptionsTrack(track)}
                      style={{ padding: 8 }}
                    >
                      <Icon name="ellipsis-vertical" size={20} color="#b3b3b3" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* ─── MODAL CRÉER PLAYLIST ─── */}
        <Modal visible={showCreateModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Créer une playlist</Text>
              <TextInput
                style={styles.modalInput}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                placeholder="Nom de la playlist"
                placeholderTextColor="#535353"
                autoFocus
              />
              
              <Text style={{color: '#fff', marginTop: 16, marginBottom: 8, fontWeight: 'bold'}}>
                Ajouter des titres (optionnel)
              </Text>
              <ScrollView style={{maxHeight: 200, width: '100%'}}>
                {availableTracksForPlaylist.length === 0 ? (
                  <Text style={{color: '#b3b3b3', fontSize: 13}}>Aucun titre liké ou importé disponible.</Text>
                ) : (
                  availableTracksForPlaylist.map(t => {
                    const isSelected = selectedTracksToCreate.includes(t.id);
                    return (
                      <TouchableOpacity 
                        key={t.id} 
                        style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12}}
                        onPress={() => toggleSelectTrackToCreate(t.id)}
                      >
                        <Icon name={isSelected ? "checkmark-circle" : "ellipse-outline"} size={24} color={isSelected ? Colors.primary : '#b3b3b3'} />
                        <View style={{flex: 1}}>
                          <Text style={{color: '#fff', fontSize: 14}} numberOfLines={1}>{t.title}</Text>
                          <Text style={{color: '#b3b3b3', fontSize: 12}} numberOfLines={1}>{t.artist?.name || 'Inconnu'}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                    setSelectedTracksToCreate([]);
                  }}
                >
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalCreateBtn,
                    !newPlaylistName.trim() && styles.modalCreateBtnDisabled,
                  ]}
                  onPress={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                >
                  <Text style={styles.modalCreateText}>Créer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      <ProfileDrawerModal
        visible={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
      />

      <TrackOptionsModal
        track={optionsTrack}
        visible={!!optionsTrack}
        onClose={() => setOptionsTrack(null)}
        onDeleteImported={removeImportedTrack}
      />
    </SafeAreaView>
  );
}

/* ───────────────── STYLES ───────────────── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#b388ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },

  /* Tabs */
  tabsContainer: {
    maxHeight: 42,
  },
  tabsContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '700',
  },

  /* Sort bar */
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 6,
  },
  sortText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
  },

  /* List items */
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: '#282828',
  },
  artistImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceLight,
  },
  likedCover: {
    width: 56,
    height: 56,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistCover: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localCover: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: '#1E3264',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemSubtitle: {
    color: '#b3b3b3',
    fontSize: 13,
  },

  /* Local tab */
  localHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  localCount: {
    color: '#b3b3b3',
    fontSize: 13,
    fontWeight: '500',
  },
  localActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  importBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* État vide */
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    color: '#b3b3b3',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#3e3e3e',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#fff',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  modalCancelText: {
    color: '#b3b3b3',
    fontSize: 15,
    fontWeight: '700',
  },
  modalCreateBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  modalCreateBtnDisabled: {
    backgroundColor: '#535353',
  },
  modalCreateText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
