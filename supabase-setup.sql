-- 1. Activer l'extension pgcrypto pour les UUIDs si non activée
create extension if not exists "pgcrypto";

-- ==============================================================
-- TABLES
-- ==============================================================

-- Table: profiles
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table: artists
CREATE TABLE public.artists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  bio text,
  avatar_path text,
  verified boolean default false,
  followers_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: albums
CREATE TABLE public.albums (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  release_date date,
  cover_path text,
  type text check (type in ('album', 'single', 'EP')) default 'album',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: tracks
CREATE TABLE public.tracks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  album_id uuid references public.albums(id) on delete set null,
  duration_ms integer not null,
  file_path text not null, -- URL ou chemin du storage
  preview_url text,
  play_count integer default 0,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: playlists
CREATE TABLE public.playlists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  cover_path text,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  is_public boolean default true,
  followers_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: playlist_tracks
CREATE TABLE public.playlist_tracks (
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  track_id uuid references public.tracks(id) on delete cascade not null,
  position integer not null,
  added_by uuid references public.profiles(id) on delete set null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (playlist_id, track_id)
);

-- Table: user_library (Likes, Saves, Follows)
CREATE TABLE public.user_library (
  user_id uuid references public.profiles(id) on delete cascade not null,
  entity_type text check (entity_type in ('track', 'album', 'artist', 'playlist')) not null,
  entity_id uuid not null,
  saved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, entity_type, entity_id)
);

-- ==============================================================
-- POLITIQUES DE SÉCURITÉ (RLS - Row Level Security)
-- ==============================================================
-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;

-- Profiles: tout le monde peut voir, seul l'utilisateur peut modifier
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Artists, Albums, Tracks: lecture publique, écriture par les admins (pour l'instant, tout le monde lit, seul l'auth peut insérer)
create policy "Public artists are viewable by everyone." on artists for select using (true);
create policy "Auth users can insert artists" on artists for insert with check (auth.uid() is not null);

create policy "Public albums are viewable by everyone." on albums for select using (true);
create policy "Auth users can insert albums" on albums for insert with check (auth.uid() is not null);

create policy "Public tracks are viewable by everyone." on tracks for select using (true);
create policy "Auth users can insert tracks" on tracks for insert with check (auth.uid() is not null);

-- Playlists: lecture publique (si is_public), modifiable par le proprio
create policy "Public playlists are viewable by everyone." on playlists for select using (is_public = true or auth.uid() = owner_id);
create policy "Users can create playlists." on playlists for insert with check (auth.uid() = owner_id);
create policy "Users can update own playlists." on playlists for update using (auth.uid() = owner_id);
create policy "Users can delete own playlists." on playlists for delete using (auth.uid() = owner_id);

-- Playlist tracks: idem que playlists
create policy "Playlist tracks viewable by everyone." on playlist_tracks for select using (true);
create policy "Users can add tracks to own playlists." on playlist_tracks for insert with check (auth.uid() = added_by);
create policy "Users can remove tracks from own playlists." on playlist_tracks for delete using (auth.uid() = added_by);

-- User library (Likes): privé
create policy "Users can view own library." on user_library for select using (auth.uid() = user_id);
create policy "Users can insert into own library." on user_library for insert with check (auth.uid() = user_id);
create policy "Users can delete from own library." on user_library for delete using (auth.uid() = user_id);

-- ==============================================================
-- BUCKET STORAGE (Pour les musiques et images)
-- ==============================================================
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;

create policy "Media public access" on storage.objects for select using ( bucket_id = 'media' );
create policy "Auth users can upload media" on storage.objects for insert with check ( bucket_id = 'media' and auth.uid() is not null );
