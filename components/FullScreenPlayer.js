'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Heart, MoreHorizontal, Repeat, Shuffle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function FullScreenPlayer({ 
  isOpen, 
  onClose, 
  currentTrack, 
  isPlaying, 
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  currentTime,
  duration,
  volume,
  onVolumeChange,
  audioData,
  isShuffleOn,
  onShuffleToggle,
  isRepeatOn,
  onRepeatToggle
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [tempTime, setTempTime] = useState(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Audio visualizer
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !audioData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.4)');
      
      ctx.fillStyle = gradient;
      
      const barWidth = width / audioData.length;
      
      audioData.forEach((value, index) => {
        const barHeight = (value / 255) * height * 0.8;
        const x = index * barWidth;
        const y = height - barHeight;
        
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, audioData]);

  const handleProgressClick = (e) => {
    if (!duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    onSeek(newTime);
  };

  const handleProgressDrag = (e) => {
    if (!isDragging || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    
    setTempTime(newTime);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleMouseUp = () => {
    if (isDragging && tempTime) {
      onSeek(tempTime);
    }
    setIsDragging(false);
    setTempTime(0);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? ((isDragging ? tempTime : currentTime) / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
        >
          {/* Background blur overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </Button>
              
              <div className="text-center">
                <p className="text-white/60 text-sm">Playing from</p>
                <p className="text-white font-medium">My Library</p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </div>

            {/* Visualizer */}
            <div className="flex-1 flex items-center justify-center px-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md"
              >
                {/* Album Art / Visualizer */}
                <div className="relative mb-8">
                  <Card className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-white/10 overflow-hidden">
                    {currentTrack?.artwork ? (
                      <img
                        src={currentTrack.artwork}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={400}
                          className="w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Volume2 className="h-12 w-12 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Track Info */}
                <div className="text-center mb-8">
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white mb-2"
                  >
                    {currentTrack?.title || 'No track selected'}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-white/70"
                  >
                    {currentTrack?.artist || 'Unknown Artist'}
                  </motion.p>
                </div>

                {/* Progress Bar */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-4"
                >
                  <div
                    className="relative h-2 bg-white/20 rounded-full cursor-pointer group"
                    onClick={handleProgressClick}
                    onMouseMove={handleProgressDrag}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${progress}% - 8px)` }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2 text-sm text-white/60">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </motion.div>

                {/* Controls */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-4 mb-6"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onShuffleToggle}
                    className={`text-white hover:bg-white/10 ${
                      isShuffleOn ? 'text-purple-400' : 'text-white/70'
                    }`}
                  >
                    <Shuffle className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrevious}
                    className="text-white hover:bg-white/10"
                  >
                    <SkipBack className="h-6 w-6" />
                  </Button>

                  <Button
                    size="lg"
                    onClick={onPlayPause}
                    className="w-16 h-16 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    className="text-white hover:bg-white/10"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRepeatToggle}
                    className={`text-white hover:bg-white/10 ${
                      isRepeatOn ? 'text-purple-400' : 'text-white/70'
                    }`}
                  >
                    <Repeat className="h-5 w-5" />
                  </Button>
                </motion.div>

                {/* Secondary Controls */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-between"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-white/70" />
                    <div className="w-20 h-1 bg-white/20 rounded-full">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${volume * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}