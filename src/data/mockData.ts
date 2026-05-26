import { Artist, Album, Track, Playlist } from '../types/database';

// ===== ARTISTES =====
export const mockArtists: Artist[] = [
  {
    id: 'a1',
    name: 'Fally Ipupa',
    bio: 'Artiste congolais, star de la Rumba et de la musique africaine.',
    avatar_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/FFALLY_IPUPA_ING.jpg/330px-FFALLY_IPUPA_ING.jpg',
    verified: true,
    followers_count: 5200000,
  },
  {
    id: 'a2',
    name: 'Dadju',
    bio: 'Auteur-compositeur-interprète français, connu pour ses hits romantiques.',
    avatar_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Dadju_ao%C3%BBt_2022.jpg/330px-Dadju_ao%C3%BBt_2022.jpg',
    verified: true,
    followers_count: 4800000,
  },
  {
    id: 'a3',
    name: 'Tayc',
    bio: "Créateur de l'Afrolov, mélange d'Afro et R&B.",
    avatar_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Tayc-2022.jpg/330px-Tayc-2022.jpg',
    verified: true,
    followers_count: 3900000,
  },
  {
    id: 'a4',
    name: 'Damso',
    bio: 'Rappeur belgo-congolais avec des textes profonds et introspectifs.',
    avatar_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Festival_des_Vieilles_Charrues_2018_-_Damso_-_053.jpg/330px-Festival_des_Vieilles_Charrues_2018_-_Damso_-_053.jpg',
    verified: true,
    followers_count: 6100000,
  },
  {
    id: 'a5',
    name: 'Burna Boy',
    bio: 'Superstar nigériane de l\'Afrobeats, lauréat du Grammy.',
    avatar_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Untold_2024_-Burna_Boy_%2853927293629%29_%28cropped%29.jpg/330px-Untold_2024_-Burna_Boy_%2853927293629%29_%28cropped%29.jpg',
    verified: true,
    followers_count: 8500000,
  },
  {
    id: 'a6',
    name: 'Wizkid',
    bio: 'Légende de l\'Afrobeats nigérian, icône mondiale.',
    avatar_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Wizkid_in_Canex_-_Algiers_2025.jpg/330px-Wizkid_in_Canex_-_Algiers_2025.jpg',
    verified: true,
    followers_count: 7200000,
  },
  {
    id: 'a7',
    name: 'Booba',
    bio: 'Le Duc, figure emblématique du rap français.',
    avatar_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Festival_des_Vieilles_Charrues_2019_-_Booba_-_038.jpg/330px-Festival_des_Vieilles_Charrues_2019_-_Booba_-_038.jpg',
    verified: true,
    followers_count: 5500000,
  },
  {
    id: 'a8',
    name: 'Niska',
    bio: 'Rappeur français d\'origine congolaise, roi du Charo.',
    avatar_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/P2N2023Niska_01.jpg/330px-P2N2023Niska_01.jpg',
    verified: true,
    followers_count: 3100000,
  },
  {
    id: 'a9',
    name: 'Ayra Starr',
    bio: 'Étoile montante nigériane, voix de la nouvelle génération Afrobeats.',
    avatar_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Ayra_Starr_during_a_radio_interview_at_Ultima_Studios_in_Lekki%2C_Lagos_where_she_spoke_about_her_song_%22Commas%22._She_is_wearing_a_Honda%E2%80%93Supreme_top_%28cropped%29.jpg/330px-thumbnail.jpg',
    verified: true,
    followers_count: 4100000,
  },
  {
    id: 'a10',
    name: 'Charlotte Dipanda',
    bio: 'Chanteuse camerounaise, reine de la world music africaine.',
    avatar_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/CharlotteDipanda.jpg/330px-CharlotteDipanda.jpg',
    verified: true,
    followers_count: 1200000,
  },
];

// ===== ALBUMS =====
export const mockAlbums: Album[] = [
  {
    id: 'al1',
    title: 'Formule 7',
    artist_id: 'a1',
    release_date: '2022-12-16',
    cover_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/FFALLY_IPUPA_ING.jpg/330px-FFALLY_IPUPA_ING.jpg',
    type: 'album',
    artist: undefined,
  },
  {
    id: 'al2',
    title: 'Poison ou Antidote',
    artist_id: 'a2',
    release_date: '2019-11-15',
    cover_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Dadju_ao%C3%BBt_2022.jpg/330px-Dadju_ao%C3%BBt_2022.jpg',
    type: 'album',
    artist: undefined,
  },
  {
    id: 'al3',
    title: 'Fleur Froide',
    artist_id: 'a3',
    release_date: '2020-12-04',
    cover_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Tayc-2022.jpg/330px-Tayc-2022.jpg',
    type: 'album',
    artist: undefined,
  },
  {
    id: 'al4',
    title: 'Ipséité',
    artist_id: 'a4',
    release_date: '2017-04-28',
    cover_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Festival_des_Vieilles_Charrues_2018_-_Damso_-_053.jpg/330px-Festival_des_Vieilles_Charrues_2018_-_Damso_-_053.jpg',
    type: 'album',
    artist: undefined,
  },
  {
    id: 'al5',
    title: 'Love, Damini',
    artist_id: 'a5',
    release_date: '2022-07-08',
    cover_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Untold_2024_-Burna_Boy_%2853927293629%29_%28cropped%29.jpg/330px-Untold_2024_-Burna_Boy_%2853927293629%29_%28cropped%29.jpg',
    type: 'album',
    artist: undefined,
  },
  {
    id: 'al6',
    title: 'Made in Lagos',
    artist_id: 'a6',
    release_date: '2020-10-30',
    cover_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Wizkid_in_Canex_-_Algiers_2025.jpg/330px-Wizkid_in_Canex_-_Algiers_2025.jpg',
    type: 'album',
    artist: undefined,
  },
  {
    id: 'al7',
    title: 'Ultra',
    artist_id: 'a7',
    release_date: '2021-03-05',
    cover_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Festival_des_Vieilles_Charrues_2019_-_Booba_-_038.jpg/330px-Festival_des_Vieilles_Charrues_2019_-_Booba_-_038.jpg',
    type: 'album',
    artist: undefined,
  },
  {
    id: 'al8',
    title: 'Mr Sal',
    artist_id: 'a8',
    release_date: '2019-09-20',
    cover_path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/P2N2023Niska_01.jpg/330px-P2N2023Niska_01.jpg',
    type: 'album',
    artist: undefined,
  },
];

// Résolution des références artistes
mockAlbums.forEach(album => {
  album.artist = mockArtists.find(a => a.id === album.artist_id);
});

// ===== TRACKS =====
export const mockTracks: Track[] = [
  {
    id: 't1', title: 'Bloqué', artist_id: 'a1', album_id: 'al1',
    duration_ms: 245000, file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    preview_url: null, play_count: 120000, is_public: true, created_at: '2024-01-01',
    artist: mockArtists[0], album: mockAlbums[0],
  },
  {
    id: 't2', title: 'Reine', artist_id: 'a2', album_id: 'al2',
    duration_ms: 198000, file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    preview_url: null, play_count: 95000, is_public: true, created_at: '2024-01-01',
    artist: mockArtists[1], album: mockAlbums[1],
  },
  {
    id: 't3', title: 'Le Temps', artist_id: 'a3', album_id: 'al3',
    duration_ms: 212000, file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    preview_url: null, play_count: 85000, is_public: true, created_at: '2024-01-01',
    artist: mockArtists[2], album: mockAlbums[2],
  },
  {
    id: 't4', title: 'Macarena', artist_id: 'a4', album_id: 'al4',
    duration_ms: 220000, file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    preview_url: null, play_count: 180000, is_public: true, created_at: '2024-01-01',
    artist: mockArtists[3], album: mockAlbums[3],
  },
  {
    id: 't5', title: 'Last Last', artist_id: 'a5', album_id: 'al5',
    duration_ms: 310000, file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    preview_url: null, play_count: 350000, is_public: true, created_at: '2024-01-01',
    artist: mockArtists[4], album: mockAlbums[4],
  },
  {
    id: 't6', title: 'Essence', artist_id: 'a6', album_id: 'al6',
    duration_ms: 240000, file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    preview_url: null, play_count: 420000, is_public: true, created_at: '2024-01-01',
    artist: mockArtists[5], album: mockAlbums[5],
  },
  {
    id: 't7', title: 'Dolce Vita', artist_id: 'a7', album_id: 'al7',
    duration_ms: 195000, file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    preview_url: null, play_count: 110000, is_public: true, created_at: '2024-01-01',
    artist: mockArtists[6], album: mockAlbums[6],
  },
  {
    id: 't8', title: 'Réseaux', artist_id: 'a8', album_id: 'al8',
    duration_ms: 205000, file_path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    preview_url: null, play_count: 90000, is_public: true, created_at: '2024-01-01',
    artist: mockArtists[7], album: mockAlbums[7],
  },
];

// ===== PLAYLISTS EDITORIALES =====
export const editorialPlaylists = [
  {
    id: 'ep1',
    title: 'Hits du Moment',
    description: 'Les sons qui font vibrer l\'Afrique',
    cover: 'https://picsum.photos/seed/hits/300',
    tracks: mockTracks.slice(0, 4),
  },
  {
    id: 'ep2',
    title: 'Rap FR',
    description: 'Le meilleur du rap francophone',
    cover: 'https://picsum.photos/seed/rapfr/300',
    tracks: [mockTracks[3], mockTracks[6], mockTracks[7]],
  },
  {
    id: 'ep3',
    title: 'Afrobeats Vibes',
    description: 'Afrobeats, Amapiano & plus',
    cover: 'https://picsum.photos/seed/afro/300',
    tracks: [mockTracks[4], mockTracks[5]],
  },
  {
    id: 'ep4',
    title: 'Chill & Love',
    description: 'Pour les moments doux',
    cover: 'https://picsum.photos/seed/chill/300',
    tracks: [mockTracks[1], mockTracks[2]],
  },
  {
    id: 'ep5',
    title: 'Rumba Congolaise',
    description: 'Les classiques de la Rumba',
    cover: 'https://picsum.photos/seed/rumba/300',
    tracks: [mockTracks[0]],
  },
  {
    id: 'ep6',
    title: 'En route',
    description: 'Le mix parfait pour le trajet',
    cover: 'https://picsum.photos/seed/route/300',
    tracks: mockTracks.slice(2, 6),
  },
];

// ===== CATEGORIES RECHERCHE =====
export const mockCategories = [
  { id: 'c1', name: 'Musique', color: '#E13300', image: 'https://picsum.photos/seed/music/200' },
  { id: 'c2', name: 'Podcasts', color: '#006450', image: 'https://picsum.photos/seed/podcast/200' },
  { id: 'c3', name: 'Événements live', color: '#8400E7', image: 'https://picsum.photos/seed/live/200' },
  { id: 'c4', name: 'Conçu pour vous', color: '#1E3264', image: 'https://picsum.photos/seed/foru/200' },
  { id: 'c5', name: 'Nouveautés', color: '#E8115B', image: 'https://picsum.photos/seed/new/200' },
  { id: 'c6', name: 'Hip-Hop', color: '#BA5D07', image: 'https://picsum.photos/seed/hiphop/200' },
  { id: 'c7', name: 'Pop', color: '#148A08', image: 'https://picsum.photos/seed/pop/200' },
  { id: 'c8', name: 'Afro', color: '#E91429', image: 'https://picsum.photos/seed/afrocat/200' },
  { id: 'c9', name: 'R&B', color: '#503750', image: 'https://picsum.photos/seed/rnb/200' },
  { id: 'c10', name: 'Détente', color: '#27856A', image: 'https://picsum.photos/seed/relax/200' },
  { id: 'c11', name: 'Rock', color: '#477D95', image: 'https://picsum.photos/seed/rock/200' },
  { id: 'c12', name: 'Gospel', color: '#509BF5', image: 'https://picsum.photos/seed/gospel/200' },
];

// Raccourcis récents (grille 2×3 de la Home comme sur Spotify)
export const recentItems = [
  { id: 'r1', title: 'Titres likés', type: 'liked' as const, image: '', gradient: ['#450af5', '#c4efd9'] },
  { id: 'r2', title: 'Formule 7', type: 'album' as const, image: mockAlbums[0].cover_path },
  { id: 'r3', title: 'Hits du Moment', type: 'playlist' as const, image: 'https://picsum.photos/seed/hits/200' },
  { id: 'r4', title: 'Ipséité', type: 'album' as const, image: mockAlbums[3].cover_path },
  { id: 'r5', title: 'Rap FR', type: 'playlist' as const, image: 'https://picsum.photos/seed/rapfr/200' },
  { id: 'r6', title: 'Made in Lagos', type: 'album' as const, image: mockAlbums[5].cover_path },
];
