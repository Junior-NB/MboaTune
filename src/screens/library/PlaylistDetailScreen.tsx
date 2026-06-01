import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { useDownloadStore } from '../../store/downloadStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import type { RootStackParamList } from '../../navigation/types';
import type { Track, Playlist, PlaylistTrack } from '../../types/database';
import TrackOptionsModal from '../../components/TrackOptionsModal';

type PlaylistDetailRouteProp = RouteProp<RootStackParamList, 'PlaylistDetail'>;

export default function PlaylistDetailScreen() {
  const route = useRoute<PlaylistDetailRouteProp>();
  const navigation = useNavigation();
  const { playlistId } = route.params;
  
  const { playlists, cachedTracks, cacheTracks, playlistTracks, cachePlaylistTracks } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const { downloadTrack, removeDownload, isDownloaded, isDownloading, downloadedTracks } = useDownloadStore();
  const { user } = useAuthStore();
  
  const playlist = playlists.find(p => p.id === playlistId) as Playlist | undefined;
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);

  const searchSongs = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*, artist:artists(*), album:albums(*)')
        .ilike('title', `%${query}%`)
        .limit(20);
      
      if (data && !error) {
        setSearchResults(data as Track[]);
      }
    } catch (e) {
      console.warn('Erreur recherche', e);
    } finally {
      setIsSearching(false);
    }
  };

  const addTrackToPlaylist = async (track: Track) => {
    if (tracks.find(t => t.id === track.id)) return;
    
    // Ajout optimiste
    setTracks(prev => [...prev, track]);

    const position = tracks.length;
    const { error } = await supabase
      .from('playlist_tracks')
      .insert({ 
        playlist_id: playlistId, 
        track_id: track.id, 
        position,
        added_by: user?.id 
      });
    
    if (error) {
      console.warn('Erreur ajout', error);
      // rollback en cas d'erreur
      setTracks(prev => prev.filter(t => t.id !== track.id));
      Alert.alert('Erreur', 'Impossible d\'ajouter ce titre à la playlist: ' + error.message);
    }
  };

  useEffect(() => {
    loadPlaylistTracks();
  }, [playlistId]);

  const loadPlaylistTracks = async () => {
    setIsLoading(true);
    let loadedTracks: Track[] = [];
    
    // 1. Charger depuis le cache local (mode hors ligne)
    const cachedIds = playlistTracks[playlistId] || [];
    const cachedData = cachedIds
      .map(id => downloadedTracks[id]?.track || cachedTracks[id])
      .filter(Boolean) as Track[];
    loadedTracks = [...cachedData];

    try {
      // 2. Tenter de rafraîchir depuis Supabase
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select('*, track:tracks(*, artist:artists(*), album:albums(*))')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

      if (data && !error) {
        const freshTracks = data.map((pt: any) => pt.track).filter(Boolean) as Track[];
        loadedTracks = freshTracks;
        
        // Mettre à jour le cache
        cacheTracks(freshTracks);
        cachePlaylistTracks(playlistId, freshTracks.map(t => t.id));
      } else {
        console.warn('Erreur réseau ou Supabase:', error);
      }
    } catch (e) {
      console.log('Mode hors ligne activé.');
    } finally {
      // Eliminer les doublons
      const uniqueTracks = Array.from(new Map(loadedTracks.map(t => [t.id, t])).values());
      setTracks(uniqueTracks);
      setIsLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    for (const track of tracks) {
      if (!isDownloaded(track.id) && !isDownloading[track.id]) {
        await downloadTrack(track);
      }
    }
  };

  if (!playlist && !isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Playlist introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allDownloaded = tracks.length > 0 && tracks.every(t => isDownloaded(t.id));
  const someDownloading = tracks.some(t => isDownloading[t.id]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#1E3264', '#121212']}
        locations={[0, 0.5]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.playlistInfo}>
            {playlist?.cover_path ? (
              <Image source={{ uri: playlist.cover_path }} style={styles.bigCover} />
            ) : (
              <View style={[styles.bigCover, { backgroundColor: '#333' }]}>
                <Icon name="musical-notes" size={60} color="#b3b3b3" />
              </View>
            )}
            <Text style={styles.playlistTitle}>{playlist?.name || 'Playlist'}</Text>
            <Text style={styles.playlistMeta}>
              {tracks.length} titre{tracks.length !== 1 ? 's' : ''}
            </Text>
            {playlist?.description && (
              <Text style={styles.playlistDesc}>{playlist.description}</Text>
            )}
          </View>

          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <TouchableOpacity onPress={handleDownloadAll} disabled={someDownloading || tracks.length === 0}>
                {someDownloading ? (
                  <ActivityIndicator size="small" color="#1DB954" />
                ) : (
                  <Icon 
                    name={allDownloaded ? "download" : "download-outline"} 
                    size={28} 
                    color={allDownloaded ? "#1DB954" : "#b3b3b3"} 
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
                <Icon name="add-circle-outline" size={30} color="#b3b3b3" />
              </TouchableOpacity>
            </View>
            <View style={styles.actionRight}>
              <TouchableOpacity>
                <Icon name="shuffle" size={28} color="#1DB954" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playAllBtn}
                onPress={() => {
                  if (tracks.length > 0) playTrack(tracks[0], tracks);
                }}
              >
                <Icon name="play" size={28} color="#000" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 40 }} />
          ) : tracks.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="musical-notes-outline" size={48} color="#535353" />
              <Text style={styles.emptyTitle}>Cette playlist est vide</Text>
              <Text style={styles.emptySub}>Ajoutez-y des titres !</Text>
              <TouchableOpacity 
                style={{marginTop: 20, paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#1DB954', borderRadius: 24}}
                onPress={() => setIsAddModalVisible(true)}
              >
                <Text style={{color: '#000', fontWeight: 'bold'}}>Ajouter des titres</Text>
              </TouchableOpacity>
            </View>
          ) : (
            tracks.map((track) => (
              <TouchableOpacity
                key={track.id}
                style={styles.trackItem}
                activeOpacity={0.7}
                onPress={() => playTrack(track, tracks)}
              >
                <View style={styles.trackLeft}>
                  {track.album?.cover_path && !track.album.cover_path.includes('placeholder') ? (
                    <Image source={{ uri: track.album.cover_path }} style={styles.trackCover} />
                  ) : (
                    <View style={[styles.trackCover, styles.trackCoverPlaceholder]}>
                      <Icon name="musical-notes" size={16} color="#b3b3b3" />
                    </View>
                  )}
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {isDownloaded(track.id) && (
                        <Icon name="download" size={12} color="#1DB954" style={{marginRight: 4}} />
                      )}
                      <Text style={styles.trackArtist} numberOfLines={1}>
                        {track.artist?.name || 'Artiste inconnu'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
                  <TouchableOpacity onPress={() => {
                    if (isDownloaded(track.id)) {
                      removeDownload(track.id);
                    } else {
                      downloadTrack(track);
                    }
                  }}>
                    {isDownloading[track.id] ? (
                      <ActivityIndicator size="small" color="#1DB954" />
                    ) : (
                      <Icon 
                        name={isDownloaded(track.id) ? "download" : "download-outline"} 
                        size={20} 
                        color={isDownloaded(track.id) ? "#1DB954" : "#b3b3b3"} 
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={(e) => {
                      if (e && e.stopPropagation) e.stopPropagation();
                      setOptionsTrack(track);
                    }}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    style={{ padding: 10 }}
                  >
                    <Icon name="ellipsis-horizontal" size={24} color="#b3b3b3" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </LinearGradient>

      <TrackOptionsModal
        track={optionsTrack}
        visible={!!optionsTrack}
        onClose={() => {
          setOptionsTrack(null);
          // Refresh if needed, but Zustand update should re-render?
          // Actually, let's let Zustand and the component handle it.
        }}
        playlistId={playlistId}
        onTrackRemoved={(id) => {
          setTracks(prev => prev.filter(t => t.id !== id));
        }}
      />

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter à la playlist</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Text style={styles.modalCloseText}>Fermer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color="#b3b3b3" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher des titres..."
                placeholderTextColor="#b3b3b3"
                value={searchQuery}
                onChangeText={searchSongs}
                autoFocus
              />
            </View>
            <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
              {isSearching ? (
                <ActivityIndicator size="large" color="#1DB954" style={{marginTop: 20}} />
              ) : searchResults.length === 0 && searchQuery.length > 0 ? (
                <Text style={styles.noResultsText}>Aucun résultat pour "{searchQuery}"</Text>
              ) : (
                searchResults.map(track => {
                  const isAdded = tracks.some(t => t.id === track.id);
                  return (
                    <View key={track.id} style={styles.searchItem}>
                      <View style={styles.trackLeft}>
                        {track.album?.cover_path && !track.album.cover_path.includes('placeholder') ? (
                          <Image source={{ uri: track.album.cover_path }} style={styles.trackCover} />
                        ) : (
                          <View style={[styles.trackCover, styles.trackCoverPlaceholder]}>
                            <Icon name="musical-notes" size={16} color="#b3b3b3" />
                          </View>
                        )}
                        <View style={styles.trackInfo}>
                          <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                          <Text style={styles.trackArtist} numberOfLines={1}>{track.artist?.name || 'Artiste inconnu'}</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={[styles.addButton, isAdded && styles.addButtonDisabled]} 
                        onPress={() => addTrackToPlaylist(track)}
                        disabled={isAdded}
                      >
                        <Text style={styles.addButtonText}>{isAdded ? 'Ajouté' : 'Ajouter'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: { paddingBottom: 120 },

  playlistInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bigCover: {
    width: 200,
    height: 200,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center'
  },
  playlistMeta: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  playlistDesc: {
    color: '#b3b3b3',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionLeft: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  actionRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  playAllBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },

  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  trackLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trackCover: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#282828',
  },
  trackCoverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: { marginLeft: 12, flex: 1, paddingRight: 12 },
  trackTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  trackArtist: { color: '#b3b3b3', fontSize: 13 },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  emptySub: { color: '#b3b3b3', fontSize: 14, textAlign: 'center', marginTop: 8 },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#282828', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '85%', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 8 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalCloseText: { color: '#1DB954', fontSize: 16, fontWeight: '600' },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3E3E3E', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, paddingHorizontal: 8, fontSize: 16 },
  searchResults: { flex: 1 },
  noResultsText: { color: '#b3b3b3', textAlign: 'center', marginTop: 20 },
  searchItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  addButton: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#1DB954' },
  addButtonDisabled: { borderColor: '#b3b3b3', opacity: 0.5 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
