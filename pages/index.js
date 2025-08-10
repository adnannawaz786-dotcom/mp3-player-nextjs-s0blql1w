import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize2, Minimize2, Music, List, Shuffle, Repeat } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import Layout from '../components/Layout';

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none, one, all
  
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  // Sample tracks data
  const tracks = [
    {
      id: 1,
      title: "Midnight Dreams",
      artist: "Synthwave Artist",
      album: "Neon Nights",
      duration: "3:45",
      src: "/audio/track1.mp3",
      cover: "/images/cover1.jpg"
    },
    {
      id: 2,
      title: "Electric Pulse",
      artist: "Digital Waves",
      album: "Cyber City",
      duration: "4:12",
      src: "/audio/track2.mp3",
      cover: "/images/cover2.jpg"
    },
    {
      id: 3,
      title: "Neon Lights",
      artist: "Retro Vibes",
      album: "80s Revival",
      duration: "3:28",
      src: "/audio/track3.mp3",
      cover: "/images/cover3.jpg"
    },
    {
      id: 4,
      title: "Digital Rain",
      artist: "Code Runner",
      album: "Matrix",
      duration: "5:03",
      src: "/audio/track4.mp3",
      cover: "/images/cover4.jpg"
    },
    {
      id: 5,
      title: "Future Bass",
      artist: "Bass Master",
      album: "Electronic Dreams",
      duration: "3:56",
      src: "/audio/track5.mp3",
      cover: "/images/cover5.jpg"
    }
  ];

  // Initialize audio context and analyzer
  useEffect(() => {
    if (audioRef.current && !sourceRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyzer = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioRef.current);
      
      analyzer.fftSize = 256;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);
      
      analyzerRef.current = analyzer;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;
    }
  }, []);

  // Audio visualizer
  const drawVisualizer = () => {
    if (!canvasRef.current || !analyzerRef.current || !dataArrayRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyzer = analyzerRef.current;
    const dataArray = dataArrayRef.current;
    
    analyzer.getByteFrequencyData(dataArray);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;
    
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    
    for (let i = 0; i < dataArray.length; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawVisualizer);
    }
  };

  // Start/stop visualizer
  useEffect(() => {
    if (isPlaying) {
      drawVisualizer();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    
    let nextTrack;
    if (isShuffled) {
      nextTrack = Math.floor(Math.random() * tracks.length);
    } else {
      nextTrack = currentTrack + 1;
      if (nextTrack >= tracks.length) {
        nextTrack = repeatMode === 'all' ? 0 : currentTrack;
      }
    }
    
    setCurrentTrack(nextTrack);
    if (isPlaying) {
      setTimeout(() => audioRef.current.play(), 100);
    }
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    let prevTrack;
    if (isShuffled) {
      prevTrack = Math.floor(Math.random() * tracks.length);
    } else {
      prevTrack = currentTrack - 1;
      if (prevTrack < 0) {
        prevTrack = repeatMode === 'all' ? tracks.length - 1 : 0;
      }
    }
    
    setCurrentTrack(prevTrack);
    if (isPlaying) {
      setTimeout(() => audioRef.current.play(), 100);
    }
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * duration;
    audioRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectTrack = (index) => {
    setCurrentTrack(index);
    if (isPlaying) {
      setTimeout(() => audioRef.current.play(), 100);
    }
  };

  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <audio
          ref={audioRef}
          src={tracks[currentTrack]?.src}
          volume={volume}
          preload="metadata"
        />
        
        <AnimatePresence mode="wait">
          {isFullscreen ? (
            <motion.div
              key="fullscreen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex flex-col"
            >
              {/* Fullscreen Header */}
              <div className="flex justify-between items-center p-6">
                <h1 className="text-2xl font-bold text-white">Now Playing</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <Minimize2 className="h-6 w-6" />
                </Button>
              </div>

              {/* Fullscreen Visualizer */}
              <div className="flex-1 flex items-center justify-center px-6">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={300}
                  className="w-full max-w-4xl h-64 bg-black/20 rounded-lg backdrop-blur-sm"
                />
              </div>

              {/* Fullscreen Track Info */}
              <div className="text-center px-6 pb-8">
                <h2 className="text-4xl font-bold text-white mb-2">
                  {tracks[currentTrack]?.title}
                </h2>
                <p className="text-xl text-gray-300 mb-1">
                  {tracks[currentTrack]?.artist}
                </p>
                <p className="text-lg text-gray-400">
                  {tracks[currentTrack]?.album}
                </p>
              </div>

              {/* Fullscreen Controls */}
              <div className="px-6 pb-8">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div 
                    className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-2"
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center space-x-6 mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsShuffled(!isShuffled)}
                    className={`text-white hover:bg-white/10 ${isShuffled ? 'text-purple-400' : ''}`}
                  >
                    <Shuffle className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    className="text-white hover:bg-white/10"
                  >
                    <SkipBack className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="w-16 h-16 text-white hover:bg-white/10 bg-white/20"
                  >
                    {isPlaying ? 
                      <Pause className="h-8 w-8" /> : 
                      <Play className="h-8 w-8 ml-1" />
                    }
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    className="text-white hover:bg-white/10"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRepeat}
                    className={`text-white hover:bg-white/10 ${repeatMode !== 'none' ? 'text-purple-400' : ''}`}
                  >
                    <Repeat className="h-5 w-5" />
                    {repeatMode === 'one' && (
                      <span className="absolute -top-1 -right-1 text-xs">1</span>
                    )}
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center justify-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/10"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2