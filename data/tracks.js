export const tracks = [
  {
    id: 1,
    title: "Midnight Drive",
    artist: "Electronic Dreams",
    album: "Synthwave Nights",
    duration: "3:42",
    durationSeconds: 222,
    src: "/audio/midnight-drive.mp3",
    cover: "/images/covers/midnight-drive.jpg",
    genre: "Synthwave",
    year: 2023,
    color: "#ff6b6b"
  },
  {
    id: 2,
    title: "Ocean Waves",
    artist: "Ambient Collective",
    album: "Natural Sounds",
    duration: "4:15",
    durationSeconds: 255,
    src: "/audio/ocean-waves.mp3",
    cover: "/images/covers/ocean-waves.jpg",
    genre: "Ambient",
    year: 2022,
    color: "#4ecdc4"
  },
  {
    id: 3,
    title: "Neon Lights",
    artist: "Cyber Punk",
    album: "Future City",
    duration: "3:28",
    durationSeconds: 208,
    src: "/audio/neon-lights.mp3",
    cover: "/images/covers/neon-lights.jpg",
    genre: "Electronic",
    year: 2023,
    color: "#a8e6cf"
  },
  {
    id: 4,
    title: "Mountain Echo",
    artist: "Nature's Symphony",
    album: "Wilderness",
    duration: "5:03",
    durationSeconds: 303,
    src: "/audio/mountain-echo.mp3",
    cover: "/images/covers/mountain-echo.jpg",
    genre: "Ambient",
    year: 2021,
    color: "#88d8c0"
  },
  {
    id: 5,
    title: "Digital Rain",
    artist: "Code Matrix",
    album: "Binary Dreams",
    duration: "3:56",
    durationSeconds: 236,
    src: "/audio/digital-rain.mp3",
    cover: "/images/covers/digital-rain.jpg",
    genre: "Techno",
    year: 2023,
    color: "#ffd93d"
  },
  {
    id: 6,
    title: "Starlight Serenade",
    artist: "Cosmic Harmony",
    album: "Galactic Journey",
    duration: "4:32",
    durationSeconds: 272,
    src: "/audio/starlight-serenade.mp3",
    cover: "/images/covers/starlight-serenade.jpg",
    genre: "Space Ambient",
    year: 2022,
    color: "#6c5ce7"
  },
  {
    id: 7,
    title: "Urban Pulse",
    artist: "City Beats",
    album: "Metropolitan",
    duration: "3:19",
    durationSeconds: 199,
    src: "/audio/urban-pulse.mp3",
    cover: "/images/covers/urban-pulse.jpg",
    genre: "Hip Hop",
    year: 2023,
    color: "#fd79a8"
  },
  {
    id: 8,
    title: "Forest Whispers",
    artist: "Earth Sounds",
    album: "Natural Harmony",
    duration: "6:12",
    durationSeconds: 372,
    src: "/audio/forest-whispers.mp3",
    cover: "/images/covers/forest-whispers.jpg",
    genre: "Nature",
    year: 2021,
    color: "#00b894"
  },
  {
    id: 9,
    title: "Retro Groove",
    artist: "Vintage Vibes",
    album: "80s Revival",
    duration: "3:45",
    durationSeconds: 225,
    src: "/audio/retro-groove.mp3",
    cover: "/images/covers/retro-groove.jpg",
    genre: "Synthpop",
    year: 2022,
    color: "#e17055"
  },
  {
    id: 10,
    title: "Cosmic Drift",
    artist: "Space Explorer",
    album: "Interstellar",
    duration: "7:28",
    durationSeconds: 448,
    src: "/audio/cosmic-drift.mp3",
    cover: "/images/covers/cosmic-drift.jpg",
    genre: "Space Ambient",
    year: 2023,
    color: "#74b9ff"
  }
];

export const playlists = [
  {
    id: 'favorites',
    name: 'My Favorites',
    description: 'Your most loved tracks',
    tracks: [1, 3, 6, 9],
    cover: '/images/playlists/favorites.jpg',
    color: '#ff6b6b'
  },
  {
    id: 'chill',
    name: 'Chill Vibes',
    description: 'Perfect for relaxation',
    tracks: [2, 4, 8, 6],
    cover: '/images/playlists/chill.jpg',
    color: '#4ecdc4'
  },
  {
    id: 'electronic',
    name: 'Electronic Mix',
    description: 'Best electronic beats',
    tracks: [1, 3, 5, 7],
    cover: '/images/playlists/electronic.jpg',
    color: '#a8e6cf'
  },
  {
    id: 'ambient',
    name: 'Ambient Space',
    description: 'Atmospheric soundscapes',
    tracks: [2, 4, 6, 8, 10],
    cover: '/images/playlists/ambient.jpg',
    color: '#6c5ce7'
  }
];

export const genres = [
  { name: 'Synthwave', count: 2, color: '#ff6b6b' },
  { name: 'Ambient', count: 2, color: '#4ecdc4' },
  { name: 'Electronic', count: 1, color: '#a8e6cf' },
  { name: 'Techno', count: 1, color: '#ffd93d' },
  { name: 'Space Ambient', count: 2, color: '#6c5ce7' },
  { name: 'Hip Hop', count: 1, color: '#fd79a8' },
  { name: 'Nature', count: 1, color: '#00b894' },
  { name: 'Synthpop', count: 1, color: '#e17055' }
];

export const recentlyPlayed = [1, 3, 6, 2, 9];

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getTrackById = (id) => {
  return tracks.find(track => track.id === id);
};

export const getPlaylistTracks = (playlistId) => {
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return [];
  return playlist.tracks.map(trackId => getTrackById(trackId)).filter(Boolean);
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const searchTracks = (query) => {
  const searchTerm = query.toLowerCase();
  return tracks.filter(track => 
    track.title.toLowerCase().includes(searchTerm) ||
    track.artist.toLowerCase().includes(searchTerm) ||
    track.album.toLowerCase().includes(searchTerm) ||
    track.genre.toLowerCase().includes(searchTerm)
  );
};