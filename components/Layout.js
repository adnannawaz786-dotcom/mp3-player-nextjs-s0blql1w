'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  Library, 
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  ChevronUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

const Layout = ({ children, currentTrack, isPlaying, onPlayPause, onNext, onPrevious, onToggleFullscreen }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showMiniPlayer, setShowMiniPlayer] = useState(!!currentTrack);

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'library', icon: Library, label: 'Library' },
    { id: 'favorites', icon: Heart, label: 'Favorites' }
  ];

  const miniPlayerVariants = {
    hidden: { 
      y: 100, 
      opacity: 0,
      transition: { duration: 0.3 }
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const navItemVariants = {
    inactive: { 
      scale: 1,
      color: '#6b7280',
      transition: { duration: 0.2 }
    },
    active: { 
      scale: 1.1,
      color: '#3b82f6',
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(120,119,198,0.1)_50%,transparent_70%)]" />
      </div>

      {/* Main Content */}
      <main className={`relative z-10 ${showMiniPlayer ? 'pb-32' : 'pb-20'} min-h-screen`}>
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mini Player */}
      <AnimatePresence>
        {showMiniPlayer && currentTrack && (
          <motion.div
            variants={miniPlayerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed bottom-20 left-0 right-0 z-40 px-4"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-white/10 p-4">
              <div className="flex items-center justify-between">
                {/* Track Info */}
                <div 
                  className="flex items-center space-x-3 flex-1 cursor-pointer"
                  onClick={onToggleFullscreen}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {currentTrack?.title?.charAt(0) || 'M'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {currentTrack?.title || 'Unknown Track'}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {currentTrack?.artist || 'Unknown Artist'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPrevious}
                    className="text-white hover:bg-white/10"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPlayPause}
                    className="text-white hover:bg-white/10 bg-white/5"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNext}
                    className="text-white hover:bg-white/10"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '45%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-black/60 backdrop-blur-xl border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-around py-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    variants={navItemVariants}
                    animate={isActive ? 'active' : 'inactive'}
                    onClick={() => setActiveTab(item.id)}
                    className="flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-0.5 left-1/2 w-1 h-1 bg-blue-500 rounded-full"
                        style={{ x: '-50%' }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;