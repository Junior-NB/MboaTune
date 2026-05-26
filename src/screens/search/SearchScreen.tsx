import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Image, TextInput, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { usePlayerStore } from '../../store/playerStore';
import { mockCategories, mockTracks } from '../../data/mockData';
import ProfileDrawerModal from '../../components/ProfileDrawerModal';
import { useSearchStore } from '../../store/searchStore';
import type { Track } from '../../types/database';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_GAP = 8;
const CARD_WIDTH = (width - Spacing.md * 2 - CARD_GAP) / COLUMN_COUNT;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const { profile } = useAuthStore();
  const { playTrack } = usePlayerStore();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Recherche locale dans les mocks d'abord
    const localResults = mockTracks.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.artist?.name?.toLowerCase().includes(query.toLowerCase())
    );

    if (localResults.length > 0) {
      setSearchResults(localResults);
      setIsSearching(false);
      useSearchStore.getState().addRecentSearch(query);
      return;
    }

    // Sinon essai Supabase
    const { data, error } = await supabase
      .from('tracks')
      .select('*, artist:artists(*), album:albums(*)')
      .ilike('title', `%${query}%`)
      .limit(10);

    if (data && !error) {
      setSearchResults(data as Track[]);
      if (data.length > 0) {
        useSearchStore.getState().addRecentSearch(query);
      }
    }
    setIsSearching(false);
  };

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
            <Text style={styles.headerTitle}>Rechercher</Text>
          </View>
          <TouchableOpacity>
            <Icon name="camera-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ─── BARRE DE RECHERCHE ─── */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Icon name="search" size={20} color="#121212" />
            <TextInput
              style={styles.searchInputText}
              placeholder="Que souhaitez-vous écouter ?"
              placeholderTextColor="#535353"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {searchQuery.length > 0 ? (
            /* ─── RÉSULTATS ─── */
            <View>
              <Text style={styles.sectionTitle}>Résultats</Text>
              {searchResults.length === 0 && !isSearching ? (
                <View style={styles.noResultContainer}>
                  <Text style={styles.noResultTitle}>
                    Aucun résultat pour « {searchQuery} »
                  </Text>
                  <Text style={styles.noResultSub}>
                    Vérifiez l'orthographe ou essayez un autre terme.
                  </Text>
                </View>
              ) : (
                searchResults.map(track => (
                  <TouchableOpacity
                    key={track.id}
                    style={styles.resultItem}
                    activeOpacity={0.7}
                    onPress={() => playTrack(track, searchResults)}
                  >
                    <Image
                      source={{ uri: track.album?.cover_path }}
                      style={styles.resultImage}
                    />
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle} numberOfLines={1}>
                        {track.title}
                      </Text>
                      <Text style={styles.resultSubtitle} numberOfLines={1}>
                        Titre · {track.artist?.name || 'Artiste inconnu'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            /* ─── VUE PAR DÉFAUT : RECHERCHES RÉCENTES + CATÉGORIES ─── */
            <>
              {useSearchStore().recentSearches.length > 0 && (
                <View style={styles.recentSearchesContainer}>
                  <View style={styles.recentSearchesHeader}>
                    <Text style={styles.sectionTitle}>Recherches récentes</Text>
                    <TouchableOpacity onPress={() => useSearchStore.getState().clearRecentSearches()}>
                      <Text style={styles.clearText}>Effacer</Text>
                    </TouchableOpacity>
                  </View>
                  {useSearchStore().recentSearches.map((term, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentSearchItem}
                      onPress={() => handleSearch(term)}
                    >
                      <Icon name="time-outline" size={24} color="#b3b3b3" />
                      <Text style={styles.recentSearchText}>{term}</Text>
                      <TouchableOpacity onPress={() => useSearchStore.getState().removeRecentSearch(term)}>
                        <Icon name="close" size={20} color="#b3b3b3" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.sectionTitle}>Tout parcourir</Text>
              <View style={styles.grid}>
                {mockCategories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryCard, { backgroundColor: category.color }]}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Image
                      source={{ uri: category.image }}
                      style={styles.categoryImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>

      <ProfileDrawerModal
        visible={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
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

  /* Barre de recherche */
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    height: 48,
    paddingHorizontal: 12,
    gap: 10,
  },
  searchInputText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    height: '100%',
    padding: 0,
  },

  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },

  /* Catégories */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: 100,
    borderRadius: 8,
    padding: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    zIndex: 2,
  },
  categoryImage: {
    position: 'absolute',
    bottom: -4,
    right: -12,
    width: 70,
    height: 70,
    borderRadius: 4,
    transform: [{ rotate: '25deg' }],
  },

  /* Résultats */
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#282828',
  },
  resultInfo: {
    marginLeft: 12,
    flex: 1,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  resultSubtitle: {
    color: '#b3b3b3',
    fontSize: 13,
    marginTop: 2,
  },
  noResultContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  noResultTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultSub: {
    color: '#b3b3b3',
    fontSize: 14,
    textAlign: 'center',
  },
  recentSearchesContainer: {
    marginBottom: 24,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearText: {
    color: '#b3b3b3',
    fontSize: 14,
    marginBottom: 14,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentSearchText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginLeft: 16,
  },
});
