import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, Maximize2, X, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const MiniPlayer = ({ 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  onToggleFullscreen,
  onClose,
  progress = 0,
  volume = 0.8,
  onVolumeChange,
  className = '',
  isVisible = true 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef(null);

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newProgress = (clickX / rect.width) * 100;
      // Emit progress change event if handler provided
      if (onProgressChange) {
        onProgressChange(Math.max(0, Math.min(100, newProgress)));
      }
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
      >
        <Card className="rounded-none border-0 border-t bg-background/95 backdrop-blur-xl shadow-2xl">
          {/* Progress Bar */}
          <div 
            ref={progressBarRef}
            className="relative h-1 bg-muted cursor-pointer group"
            onClick={handleProgressClick}
          >
            <motion.div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
              whileHover={{ height: '6px', marginTop: '-2px' }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ left: `${progress}%`, marginLeft: '-6px' }}
            />
          </div>

          <div className="flex items-center justify-between p-3 gap-3">
            {/* Track Info */}
            <motion.div 
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              onClick={onToggleFullscreen}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <img
                  src={currentTrack.artwork || '/api/placeholder/48/48'}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-lg object-cover shadow-md"
                />
                <motion.div
                  className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  whileHover={{ opacity: 1 }}
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <motion.h4 
                  className="font-semibold text-sm truncate"
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentTrack.title}
                </motion.h4>
                <p className="text-xs text-muted-foreground truncate">
                  {currentTrack.artist}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {currentTrack.genre || 'Music'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(currentTrack.duration || 0)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 h-8 w-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart 
                    className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                  />
                </motion.div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                className="p-2 h-8 w-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipBack className="w-4 h-4" />
                </motion.div>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={onPlayPause}
                className="p-2 h-9 w-9 rounded-full"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ rotate: isPlaying ? 0 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </motion.div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="p-2 h-8 w-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipForward className="w-4 h-4" />
                </motion.div>
              </Button>

              {/* Volume Control */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  className="p-2 h-8 w-8"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Volume2 className="w-4 h-4" />
                  </motion.div>
                </Button>

                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 p-2 bg-background border rounded-lg shadow-lg"
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
                        className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${volume * 100}%, hsl(var(--muted)) ${volume * 100}%, hsl(var(--muted)) 100%)`
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2 h-8 w-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.div>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniPlayer;