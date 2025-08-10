'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const AudioPlayer = ({ 
  currentTrack, 
  tracks = [], 
  onTrackChange, 
  isMinimized = false,
  onToggleMinimize,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('loadstart', () => setIsLoading(true));
      audioRef.current.addEventListener('canplay', () => setIsLoading(false));
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleTrackEnd);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleTrackEnd);
      }
    };
  }, []);

  // Load current track
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.volume = volume;
    }
  }, [currentTrack, volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnd = () => {
    if (isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      handleNext();
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (!tracks.length || !onTrackChange) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    let previousIndex;
    
    if (isShuffle) {
      previousIndex = Math.floor(Math.random() * tracks.length);
    } else {
      previousIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
    }
    
    onTrackChange(tracks[previousIndex]);
  };

  const handleNext = () => {
    if (!tracks.length || !onTrackChange) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    let nextIndex;
    
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = currentIndex < tracks.length - 1 ? currentIndex + 1 : 0;
    }
    
    onTrackChange(tracks[nextIndex]);
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !audioRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    if (!volumeRef.current) return;
    
    const rect = volumeRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    setVolume(percentage);
    setIsMuted(percentage === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = percentage;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const volumePercentage = (isMuted ? 0 : volume) * 100;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed bottom-20 left-4 right-4 z-50 ${className}`}
      >
        <Card className="bg-background/95 backdrop-blur-lg border shadow-lg">
          <div className="flex items-center gap-3 p-3">
            {currentTrack?.artwork && (
              <img 
                src={currentTrack.artwork} 
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">
                {currentTrack?.title || 'No track selected'}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack?.artist || 'Unknown artist'}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={!currentTrack}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                disabled={!currentTrack || isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={!currentTrack}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Mini Progress Bar */}
          <div className="px-3 pb-3">
            <div 
              ref={progressRef}
              className="w-full h-1 bg-secondary rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full ${className}`}
    >
      <Card className="bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-lg border shadow-xl">
        <div className="p-6 space-y-6">
          {/* Track Info */}
          <div className="text-center space-y-2">
            {currentTrack?.artwork && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mx-auto w-48 h-48 rounded-2xl overflow-hidden shadow-2xl"
              >
                <img 
                  src={currentTrack.artwork} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">
                {currentTrack?.title || 'No track selected'}
              </h2>
              <p className="text-lg text-muted-foreground">
                {currentTrack?.artist || 'Unknown artist'}
              </p>
              {currentTrack?.album && (
                <Badge variant="secondary" className="mt-2">
                  {currentTrack.album}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div 
              ref={progressRef}
              className="w-full h-2 bg-secondary rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-150 relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsShuffle(!isShuffle)}
              className={isShuffle ? 'text-primary' : ''}
            >
              <Shuffle className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePrevious}
              disabled={!currentTrack}
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            
            <Button
              size="lg"
              onClick={togglePlayPause}
              disabled={!currentTrack || isLoading}
              className="w-16 h-16 rounded-full"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={handleNext}
              disabled={!currentTrack}
            >
              <SkipForward className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsRepeat(!isRepeat)}
              className={isRepeat ? 'text-primary' : ''}
            >
              <Repeat className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            
            <div 
              ref={volumeRef}
              className="flex-1 h-2 bg-secondary rounded-full cursor-pointer group"
              onClick={handleVolumeChange}
            >
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-150 relative"
                style={{ width: `${volumePercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AudioPlayer;