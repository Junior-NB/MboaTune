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

  const [dbAlbums, setDbAlbums] = useState<any[]>([]);
  const [dbArtists, setDbArtists] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'Sur mon tel') {
      loadLocalMusic();
    } else if (activeTab === 'Albums' && dbAlbums.length === 0) {
      loadAlbums();
    } else if (activeTab === 'Artistes' && dbArtists.length === 0) {
      loadArtists();
    }
  }, [activeTab]);

  const loadAlbums = async () => {
    const { data } = await supabase.from('albums').select('*, artist:artists(*)').limit(20);
    if (data) setDbAlbums(data);
  };

  const loadArtists = async () => {
    const { data } = await supabase.from('artists').select('*').limit(20);
    if (data) setDbArtists(data);
  };

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
              onPress={() => setShowProfileDrawer(true)}
            >
              <LinearGradient
                colors={Colors.gradientAccent}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {profile?.display_name?.[0]?.toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bibliothèque</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <Icon name="search" size={26} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => setShowCreateModal(true)}
            >
              <Icon name="add" size={32} color={Colors.textPrimary} />
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
          <Icon name="swap-vertical" size={18} color={Colors.textPrimary} />
          <Text style={styles.sortText}>Récents</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity>
            <Icon name="grid-outline" size={22} color={Colors.textPrimary} />
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
                  colors={Colors.gradientAccent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.likedCover}
                >
                  <Icon name="heart" size={24} color="#fff" />
                </LinearGradient>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>Titres likés</Text>
                  <View style={styles.itemMeta}>
                    <Icon name="push-outline" size={14} color={Colors.primary} />
                    <Text style={styles.itemSubtitle}>
                      Playlist · {likedTracks?.length || 0} titres
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Playlists créées */}
              {playlists.map(p => (
                <TouchableOpacity 
                  key={p.id} 
                  style={styles.listItem} 
                  activeOpacity={0.7}
                  onPress={() => (navigation as any).navigate('PlaylistDetail', { playlistId: p.id })}
                >
                  <View style={styles.playlistCover}>
                    <Icon name="musical-notes" size={22} color="#b3b3b3" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{p.name}</Text>
                    <Text style={styles.itemSubtitle}>
                      Playlist
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'Albums' && (
            <View>
              {dbAlbums.map(album => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.listItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    (navigation as any).navigate('Album', { albumId: album.id });
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
              {dbArtists.map(artist => (
                <TouchableOpacity key={artist.id} style={styles.listItem} activeOpacity={0.7} onPress={() => (navigation as any).navigate('Artist', { artistId: artist.id })}>
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
                    <Icon name="refresh" size={22} color={Colors.textPrimary} />
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
                placeholderTextColor={Colors.textMuted}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },

  /* Tabs */
  tabsContainer: {
    maxHeight: 46,
  },
  tabsContent: {
    paddingHorizontal: Spacing.lg,
    gap: 10,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },

  /* Sort bar */
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    gap: 8,
  },
  sortText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },

  /* List items */
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  artwork: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  artistImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceLight,
  },
  likedCover: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistCover: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localCover: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  itemTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  /* Local tab */
  localHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  localCount: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  localActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  importBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
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
