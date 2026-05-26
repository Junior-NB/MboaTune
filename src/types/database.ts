// Types correspondant au schéma de la base de données Supabase

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Artist {
  id: string;
  name: string;
  bio: string | null;
  avatar_path: string | null;
  verified: boolean;
  followers_count: number;
}

export interface Album {
  id: string;
  title: string;
  artist_id: string;
  release_date: string;
  cover_path: string | null;
  type: 'album' | 'single' | 'EP';
  artist?: Artist;
}

export interface Track {
  id: string;
  title: string;
  artist_id: string;
  album_id: string;
  duration_ms: number;
  file_path: string;
  preview_url: string | null;
  play_count: number;
  is_public: boolean;
  created_at: string;
  artist?: Artist;
  album?: Album;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_path: string | null;
  owner_id: string;
  is_public: boolean;
  followers_count: number;
  created_at: string;
  tracks?: Track[];
  owner?: Profile;
}

export interface PlaylistTrack {
  playlist_id: string;
  track_id: string;
  position: number;
  added_by: string;
  added_at: string;
  track?: Track;
}

export interface UserLibrary {
  user_id: string;
  entity_type: 'track' | 'album' | 'artist' | 'playlist';
  entity_id: string;
  saved_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface ListeningHistory {
  user_id: string;
  track_id: string;
  played_at: string;
  duration_played_ms: number;
  track?: Track;
}
