import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, Clock, MoreHorizontal } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const TrackList = ({ 
  tracks = [], 
  currentTrack, 
  isPlaying, 
  onTrackSelect, 
  onPlayPause,
  className = '' 
}) => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const trackVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const playButtonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
  };

  return (
    <Card className={`p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-lg border-slate-700/50 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Music className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Playlist</h3>
            <p className="text-sm text-slate-400">{tracks.length} tracks</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
          {tracks.filter(track => track.duration).reduce((acc, track) => acc + track.duration, 0) > 0 
            ? formatDuration(tracks.filter(track => track.duration).reduce((acc, track) => acc + track.duration, 0))
            : '0:00'}
        </Badge>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {tracks.map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            
            return (
              <motion.div
                key={track.id}
                variants={trackVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`group relative p-4 rounded-lg transition-all duration-300 cursor-pointer hover:bg-slate-700/30 ${
                  isCurrentTrack 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' 
                    : 'bg-slate-800/30 hover:bg-slate-700/50'
                }`}
                onClick={() => onTrackSelect(track)}
              >
                <div className="flex items-center gap-4">
                  {/* Play/Pause Button */}
                  <motion.div
                    variants={playButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="relative"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`w-10 h-10 rounded-full p-0 transition-all duration-300 ${
                        isCurrentTrack
                          ? 'bg-purple-500 hover:bg-purple-600 text-white'
                          : 'bg-slate-700/50 hover:bg-slate-600 text-slate-300 group-hover:bg-purple-500/80 group-hover:text-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrentTrack) {
                          onPlayPause();
                        } else {
                          onTrackSelect(track);
                        }
                      }}
                    >
                      {isCurrentTrack && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </Button>
                    
                    {isCurrentTrack && isPlaying && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-purple-400"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Track Number */}
                  <div className="w-8 text-center">
                    <span className={`text-sm font-medium ${
                      isCurrentTrack ? 'text-purple-400' : 'text-slate-400'
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium truncate ${
                        isCurrentTrack ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}>
                        {track.title || track.name || `Track ${index + 1}`}
                      </h4>
                      {isCurrentTrack && (
                        <motion.div
                          className="flex items-center gap-1"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                        </motion.div>
                      )}
                    </div>
                    <p className={`text-sm truncate ${
                      isCurrentTrack ? 'text-purple-300' : 'text-slate-400 group-hover:text-slate-300'
                    }`}>
                      {track.artist || 'Unknown Artist'}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm">
                        {track.duration ? formatDuration(track.duration) : '--:--'}
                      </span>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0 text-slate-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle track options menu
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress bar for current track */}
                {isCurrentTrack && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: track.duration || 180, ease: 'linear' }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {tracks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="p-4 rounded-full bg-slate-700/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Music className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-medium text-slate-300 mb-2">No tracks loaded</h4>
          <p className="text-sm text-slate-400">Add some music files to get started</p>
        </motion.div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </Card>
  );
};

export default TrackList;