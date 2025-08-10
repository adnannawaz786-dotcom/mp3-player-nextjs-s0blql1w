import React from 'react';
import { motion } from 'framer-motion';
import { Home, Music, List, Settings, User } from 'lucide-react';

const BottomNavigation = ({ activeTab = 'home', onTabChange }) => {
  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      color: 'text-blue-500'
    },
    {
      id: 'music',
      icon: Music,
      label: 'Music',
      color: 'text-purple-500'
    },
    {
      id: 'playlist',
      icon: List,
      label: 'Playlist',
      color: 'text-green-500'
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      color: 'text-orange-500'
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      color: 'text-pink-500'
    }
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50"
    >
      <div className="max-w-md mx-auto px-4 py-2">
        <nav className="flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id)}
                className="relative flex flex-col items-center justify-center p-3 min-w-0 flex-1 group"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                {/* Active indicator background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                {/* Icon container */}
                <motion.div
                  className={`relative p-2 rounded-xl transition-colors duration-200 ${
                    isActive
                      ? `${item.color} bg-white/20 dark:bg-gray-800/50`
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  
                  {/* Active dot indicator */}
                  {isActive && (
                    <motion.div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${item.color.replace('text-', 'bg-')}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
                    />
                  )}
                </motion.div>
                
                {/* Label */}
                <motion.span
                  className={`text-xs font-medium mt-1 transition-colors duration-200 ${
                    isActive
                      ? `${item.color} font-semibold`
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  animate={{
                    opacity: isActive ? 1 : 0.8,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
                
                {/* Ripple effect on tap */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  initial={false}
                  whileTap={{
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  }}
                  transition={{ duration: 0.1 }}
                />
              </motion.button>
            );
          })}
        </nav>
      </div>
      
      {/* Bottom safe area for mobile devices */}
      <div className="h-safe-bottom bg-transparent" />
    </motion.div>
  );
};

export default BottomNavigation;