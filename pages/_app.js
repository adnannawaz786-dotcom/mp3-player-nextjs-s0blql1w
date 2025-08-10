import '../styles/globals.css';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Audio Context Provider
const AudioContext = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeat, setRepeat] = useState('off'); // 'off', 'all', 'one'
  const [shuffle, setShuffle] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      setAudioElement(audio);

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        setIsLoading(false);
      });

      audio.addEventListener('ended', () => {
        handleTrackEnd();
      });

      audio.addEventListener('loadstart', () => {
        setIsLoading(true);
      });

      audio.addEventListener('canplay', () => {
        setIsLoading(false);
      });

      return () => {
        audio.pause();
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('loadstart', () => {});
        audio.removeEventListener('canplay', () => {});
      };
    }
  }, []);

  const handleTrackEnd = () => {
    if (repeat === 'one') {
      if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play();
      }
    } else if (repeat === 'all' || currentIndex < playlist.length - 1) {
      playNext();
    } else {
      setIsPlaying(false);
    }
  };

  const playTrack = (track, index = null) => {
    if (audioElement && track) {
      setCurrentTrack(track);
      setIsLoading(true);
      audioElement.src = track.url;
      audioElement.volume = volume;
      
      if (index !== null) {
        setCurrentIndex(index);
      }

      audioElement.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error playing track:', error);
        setIsLoading(false);
      });
    }
  };

  const pauseTrack = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  const resumeTrack = () => {
    if (audioElement) {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (playlist.length > 0) {
      let nextIndex;
      if (shuffle) {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } else {
        nextIndex = (currentIndex + 1) % playlist.length;
      }
      playTrack(playlist[nextIndex], nextIndex);
    }
  };

  const playPrevious = () => {
    if (playlist.length > 0) {
      let prevIndex;
      if (shuffle) {
        prevIndex = Math.floor(Math.random() * playlist.length);
      } else {
        prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      }
      playTrack(playlist[prevIndex], prevIndex);
    }
  };

  const seekTo = (time) => {
    if (audioElement) {
      audioElement.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolumeLevel = (newVolume) => {
    setVolume(newVolume);
    if (audioElement) {
      audioElement.volume = newVolume;
    }
  };

  const addToPlaylist = (tracks) => {
    setPlaylist(prev => [...prev, ...tracks]);
  };

  const removeFromPlaylist = (index) => {
    setPlaylist(prev => prev.filter((_, i) => i !== index));
    if (index === currentIndex && playlist.length > 1) {
      playNext();
    } else if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const clearPlaylist = () => {
    setPlaylist([]);
    setCurrentTrack(null);
    setCurrentIndex(0);
    pauseTrack();
  };

  const contextValue = {
    // State
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLoading,
    playlist,
    currentIndex,
    repeat,
    shuffle,
    
    // Actions
    playTrack,
    pauseTrack,
    resumeTrack,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    setRepeat,
    setShuffle,
    
    // Utilities
    formatTime: (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

// Theme Context Provider
const ThemeContext = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('blue');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      const savedAccent = localStorage.getItem('accentColor') || 'blue';
      setTheme(savedTheme);
      setAccentColor(savedAccent);
      
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      document.documentElement.setAttribute('data-accent', savedAccent);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const changeAccentColor = (color) => {
    setAccentColor(color);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accentColor', color);
      document.documentElement.setAttribute('data-accent', color);
    }
  };

  const contextValue = {
    theme,
    accentColor,
    toggleTheme,
    changeAccentColor,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Player View Context
const PlayerViewContext = ({ children }) => {
  const [view, setView] = useState('library'); // 'library', 'player', 'playlist', 'settings'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  const contextValue = {
    view,
    setView,
    isFullscreen,
    setIsFullscreen,
    isMiniPlayer,
    setIsMiniPlayer,
    
    // View helpers
    showLibrary: () => setView('library'),
    showPlayer: () => setView('player'),
    showPlaylist: () => setView('playlist'),
    showSettings: () => setView('settings'),
    
    // Player mode helpers
    enterFullscreen: () => {
      setIsFullscreen(true);
      setIsMiniPlayer(false);
    },
    exitFullscreen: () => {
      setIsFullscreen(false);
    },
    enterMiniPlayer: () => {
      setIsMiniPlayer(true);
      setIsFullscreen(false);
    },
    exitMiniPlayer: () => {
      setIsMiniPlayer(false);
    }
  };

  return (
    <PlayerViewContext.Provider value={contextValue}>
      {children}
    </PlayerViewContext.Provider>
  );
};

// Main App Component
export default function App({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <ThemeContext>
      <AudioContext>
        <PlayerViewContext>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-300">
            <AnimatePresence mode="wait" initial={false}>
              <Component {...pageProps} key={Component.name || 'component'} />
            </AnimatePresence>
          </div>
        </PlayerViewContext>
      </AudioContext>
    </ThemeContext>
  );
}

// Export contexts for use in other components
export { AudioContext, ThemeContext, PlayerViewContext };