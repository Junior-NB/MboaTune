import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../theme/colors';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import PlayerScreen from '../screens/player/PlayerScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LikedTracksScreen from '../screens/library/LikedTracksScreen';
import AlbumScreen from '../screens/home/AlbumScreen';
import ArtistScreen from '../screens/home/ArtistScreen';
import PlaylistDetailScreen from '../screens/library/PlaylistDetailScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

import { useLibraryStore } from '../store/libraryStore';

const Stack = createStackNavigator<RootStackParamList>();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    text: Colors.textPrimary,
  },
};

export default function RootNavigator() {
  const { isAuthenticated, isLoading, initialize, profile, user } = useAuthStore();
  const { fetchLikedTracks, fetchSavedAlbums, fetchFollowedArtists, fetchPlaylists } = useLibraryStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      fetchLikedTracks(user.id);
      fetchSavedAlbums(user.id);
      fetchFollowedArtists(user.id);
      fetchPlaylists(user.id);
    }
  }, [user, fetchLikedTracks, fetchSavedAlbums, fetchFollowedArtists, fetchPlaylists]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Authentification requise */}
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : !profile?.onboarding_completed ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
        <Stack.Screen 
          name="PlayerModal" 
          component={PlayerScreen} 
          options={{ presentation: 'modal' }} 
        />
        <Stack.Screen 
          name="LikedTracks" 
          component={LikedTracksScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen 
          name="Album" 
          component={AlbumScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen 
          name="Artist" 
          component={ArtistScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen 
          name="PlaylistDetail" 
          component={PlaylistDetailScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ presentation: 'card' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
