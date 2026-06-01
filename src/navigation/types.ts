import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Artist: { artistId: string };
  Album: { albumId: string };
  Playlist: { playlistId: string };
};

export type SearchStackParamList = {
  Search: undefined;
  Category: { categoryId: string };
  Results: { query: string };
};

export type LibraryStackParamList = {
  Library: undefined;
  CreatePlaylist: undefined;
};

export type MainTabsParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  LibraryTab: NavigatorScreenParams<LibraryStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabsParamList>;
  PlayerModal: undefined;
  LikedTracks: undefined;
  PlaylistDetail: { playlistId: string };
  Album: { albumId: string };
  Artist: { artistId: string };
};
