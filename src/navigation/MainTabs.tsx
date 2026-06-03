import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { MainTabsParamList } from './types';
import { Colors } from '../theme/colors';

// Import Screens (ou les Stacks correspondants)
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import MiniPlayer from '../components/MiniPlayer';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: 6,
          paddingTop: 6,
          height: 58,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen} // Remplacer par HomeStack plus tard
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen} // Remplacer par SearchStack plus tard
        options={{
          tabBarLabel: 'Recherche',
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryScreen} // Remplacer par LibraryStack plus tard
        options={{
          tabBarLabel: 'Bibliothèque',
          tabBarIcon: ({ color, size }) => (
            <Icon name="library" color={color} size={size} />
          ),
        }}
      />
      </Tab.Navigator>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
