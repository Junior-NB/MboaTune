import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../store/authStore';
import { useLibraryStore } from '../../store/libraryStore';
import { Colors } from '../../theme/colors';
import { Spacing, FontSize, BorderRadius } from '../../theme/spacing';
import Button from '../../components/Button';

const ARTIST_COLORS = ['#1DB954', '#E8115B', '#FF6B35', '#4A90D9', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#10B981', '#F97316', '#6366F1', '#14B8A6'];

const ARTISTS = [
  { id: '1', name: 'Fally Ipupa', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/FFALLY_IPUPA_ING.jpg/330px-FFALLY_IPUPA_ING.jpg' },
  { id: '2', name: 'Damso', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Festival_des_Vieilles_Charrues_2018_-_Damso_-_053.jpg/330px-Festival_des_Vieilles_Charrues_2018_-_Damso_-_053.jpg' },
  { id: '3', name: 'Burna Boy', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Untold_2024_-Burna_Boy_%2853927293629%29_%28cropped%29.jpg/330px-Untold_2024_-Burna_Boy_%2853927293629%29_%28cropped%29.jpg' },
  { id: '4', name: 'Wizkid', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Wizkid_in_Canex_-_Algiers_2025.jpg/330px-Wizkid_in_Canex_-_Algiers_2025.jpg' },
  { id: '5', name: 'Didi B', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Didi_B_01.jpg/330px-Didi_B_01.jpg' },
  { id: '6', name: 'Tayc', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Tayc-2022.jpg/330px-Tayc-2022.jpg' },
  { id: '7', name: 'Dadju', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Dadju_ao%C3%BBt_2022.jpg/330px-Dadju_ao%C3%BBt_2022.jpg' },
  { id: '8', name: 'Niska', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/P2N2023Niska_01.jpg/330px-P2N2023Niska_01.jpg' },
  { id: '9', name: 'Rema', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rema_performing_in_2019.jpg/330px-Rema_performing_in_2019.jpg' },
  { id: '10', name: 'Charlotte Dipanda', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/CharlotteDipanda.jpg/330px-CharlotteDipanda.jpg' },
  { id: '11', name: 'Booba', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Festival_des_Vieilles_Charrues_2019_-_Booba_-_038.jpg/330px-Festival_des_Vieilles_Charrues_2019_-_Booba_-_038.jpg' },
  { id: '12', name: 'Ayra Starr', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Ayra_Starr_during_a_radio_interview_at_Ultima_Studios_in_Lekki%2C_Lagos_where_she_spoke_about_her_song_%22Commas%22._She_is_wearing_a_Honda%E2%80%93Supreme_top_%28cropped%29.jpg/330px-thumbnail.jpg' },
];

function ArtistAvatar({ uri, name, index }: { uri: string; name: string; index: number }) {
  const [failed, setFailed] = useState(false);
  const color = ARTIST_COLORS[index % ARTIST_COLORS.length];

  if (failed) {
    return (
      <View style={[styles.image, { backgroundColor: color, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>{name[0]}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.image}
      onError={() => setFailed(true)}
    />
  );
}

export default function OnboardingScreen() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const toggleArtist = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const forceLocalSkip = () => {
    useAuthStore.setState((state: any) => ({
      profile: state.profile 
        ? { ...state.profile, onboarding_completed: true } 
        : { id: state.user?.id || 'temp', username: 'User', display_name: 'User', onboarding_completed: true }
    }));
  };

  const handleSkip = async () => {
    setLoading(true);
    // Optimistic update : on ne bloque pas l'utilisateur
    forceLocalSkip();
    try {
      await updateProfile({ onboarding_completed: true } as any);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (selectedIds.length < 3) return;
    setLoading(true);
    
    // 1. Sauvegarder les artistes sélectionnés en arrière-plan
    const libraryStore = useLibraryStore.getState();
    const user = useAuthStore.getState().user;
    
    if (user) {
      // On sauvegarde sans bloquer la navigation
      Promise.all(
        selectedIds.map(artistId => 
          libraryStore.toggleFollowArtist(artistId, user.id)
        )
      ).catch(console.error);
    }

    // 2. Optimistic update : on passe à l'écran principal immédiatement
    forceLocalSkip();
    
    try {
      await updateProfile({ onboarding_completed: true } as any);
    } catch (e) {
      console.warn('Erreur lors de la mise à jour du profil onboarding:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a1a', Colors.background]} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Choisissez au moins 3 artistes que vous aimez.</Text>
          <Text style={styles.subtitle}>Nous allons personnaliser votre accueil.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {ARTISTS.map((artist, index) => {
            const isSelected = selectedIds.includes(artist.id);
            return (
              <TouchableOpacity
                key={artist.id}
                style={styles.artistItem}
                onPress={() => toggleArtist(artist.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.imageContainer, isSelected && styles.imageContainerSelected]}>
                  <ArtistAvatar uri={artist.image} name={artist.name} index={index} />
                  {isSelected && (
                    <View style={styles.overlay}>
                      <Icon name="checkmark-circle" size={32} color={Colors.primary} />
                    </View>
                  )}
                </View>
                <Text style={[styles.artistName, isSelected && styles.artistNameSelected]} numberOfLines={1}>
                  {artist.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={selectedIds.length < 3 ? `Encore ${3 - selectedIds.length} artiste(s)` : "Continuer"}
            onPress={handleContinue}
            disabled={selectedIds.length < 3}
            loading={loading}
          />
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Ignorer cette étape</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxxl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-around',
  },
  artistItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  imageContainerSelected: {
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistName: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  artistNameSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
  },
  skipButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
    padding: Spacing.sm,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
