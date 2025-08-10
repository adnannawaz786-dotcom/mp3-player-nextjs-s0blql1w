import { useState, useRef, useEffect, useCallback } from 'react';

export const useAudioPlayer = () => {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);

  // Initialize audio context for visualizer
  useEffect(() => {
    if (typeof window !== 'undefined' && audioRef.current) {
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const analyserNode = context.createAnalyser();
        const source = context.createMediaElementSource(audioRef.current);
        
        source.connect(analyserNode);
        analyserNode.connect(context.destination);
        
        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArrayBuffer = new Uint8Array(bufferLength);
        
        setAudioContext(context);
        setAnalyser(analyserNode);
        setDataArray(dataArrayBuffer);
      } catch (err) {
        console.warn('Audio context initialization failed:', err);
      }
    }
  }, [currentTrack]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e) => {
      setError('Failed to load audio');
      setIsLoading(false);
    };
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode]);

  const loadTrack = useCallback((track, trackIndex = 0) => {
    if (!audioRef.current || !track) return;
    
    setError(null);
    setCurrentTrack(track);
    setCurrentTrackIndex(trackIndex);
    audioRef.current.src = track.url;
    audioRef.current.load();
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;
    
    try {
      // Resume audio context if suspended
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      await audioRef.current.play();
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  }, [currentTrack, audioContext]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((newVolume) => {
    if (!audioRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    audioRef.current.volume = clampedVolume;
    setVolume(clampedVolume);
    
    if (clampedVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const changePlaybackRate = useCallback((rate) => {
    if (!audioRef.current) return;
    
    const clampedRate = Math.max(0.25, Math.min(2, rate));
    audioRef.current.playbackRate = clampedRate;
    setPlaybackRate(clampedRate);
  }, []);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    
    let nextIndex;
    
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentTrackIndex + 1;
      if (nextIndex >= playlist.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return; // End of playlist
        }
      }
    }
    
    loadTrack(playlist[nextIndex], nextIndex);
  }, [playlist, currentTrackIndex, isShuffled, repeatMode, loadTrack]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;
    
    let prevIndex;
    
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentTrackIndex - 1;
      if (prevIndex < 0) {
        if (repeatMode === 'all') {
          prevIndex = playlist.length - 1;
        } else {
          return; // Beginning of playlist
        }
      }
    }
    
    loadTrack(playlist[prevIndex], prevIndex);
  }, [playlist, currentTrackIndex, isShuffled, repeatMode, loadTrack]);

  const playTrackAtIndex = useCallback((index) => {
    if (index < 0 || index >= playlist.length) return;
    
    loadTrack(playlist[index], index);
  }, [playlist, loadTrack]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      switch (prev) {
        case 'none': return 'all';
        case 'all': return 'one';
        case 'one': return 'none';
        default: return 'none';
      }
    });
  }, []);

  const updatePlaylist = useCallback((newPlaylist) => {
    setPlaylist(newPlaylist);
    if (newPlaylist.length > 0 && !currentTrack) {
      loadTrack(newPlaylist[0], 0);
    }
  }, [currentTrack, loadTrack]);

  const getVisualizerData = useCallback(() => {
    if (!analyser || !dataArray) return null;
    
    analyser.getByteFrequencyData(dataArray);
    return Array.from(dataArray);
  }, [analyser, dataArray]);

  // Format time helper
  const formatTime = useCallback((time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Audio element ref
    audioRef,
    
    // State
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    error,
    playbackRate,
    isShuffled,
    repeatMode,
    playlist,
    currentTrackIndex,
    
    // Controls
    loadTrack,
    play,
    pause,
    togglePlay,
    seek,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    playNext,
    playPrevious,
    playTrackAtIndex,
    toggleShuffle,
    toggleRepeat,
    updatePlaylist,
    
    // Visualizer
    getVisualizerData,
    
    // Utilities
    formatTime,
    
    // Computed values
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
    hasNext: currentTrackIndex < playlist.length - 1 || repeatMode === 'all' || isShuffled,
    hasPrevious: currentTrackIndex > 0 || repeatMode === 'all' || isShuffled,
  };
};