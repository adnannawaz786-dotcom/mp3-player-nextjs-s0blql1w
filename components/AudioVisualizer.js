import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AudioVisualizer = ({ 
  audioRef, 
  isPlaying = false, 
  className = '',
  barCount = 64,
  height = 200,
  color = '#3b82f6',
  gradient = true,
  style = 'bars' // 'bars', 'wave', 'circular'
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio context and analyser
  useEffect(() => {
    if (!audioRef?.current || isInitialized) return;

    const initializeAudio = async () => {
      try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        
        // Create analyser node
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = barCount * 2;
        analyserRef.current.smoothingTimeConstant = 0.8;
        
        // Create source and connect nodes
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        // Create data array
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };

    initializeAudio();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioRef, barCount, isInitialized]);

  // Animation loop
  useEffect(() => {
    if (!isInitialized || !canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      if (!isPlaying) {
        // Draw static visualization when not playing
        drawStaticVisualization(ctx, canvas);
        return;
      }

      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw visualization based on style
      switch (style) {
        case 'wave':
          drawWaveVisualization(ctx, canvas);
          break;
        case 'circular':
          drawCircularVisualization(ctx, canvas);
          break;
        default:
          drawBarVisualization(ctx, canvas);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animate();
    } else {
      drawStaticVisualization(ctx, canvas);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isInitialized, style, barCount, color, gradient]);

  // Draw bar visualization
  const drawBarVisualization = (ctx, canvas) => {
    const { width, height } = canvas;
    const barWidth = width / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const barHeight = (dataArrayRef.current[i] / 255) * height * 0.8;
      const x = i * barWidth;
      const y = height - barHeight;
      
      if (gradient) {
        const gradientFill = ctx.createLinearGradient(0, height, 0, 0);
        gradientFill.addColorStop(0, color);
        gradientFill.addColorStop(1, adjustColorBrightness(color, 50));
        ctx.fillStyle = gradientFill;
      } else {
        ctx.fillStyle = color;
      }
      
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    }
  };

  // Draw wave visualization
  const drawWaveVisualization = (ctx, canvas) => {
    const { width, height } = canvas;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    const sliceWidth = width / barCount;
    let x = 0;
    
    for (let i = 0; i < barCount; i++) {
      const v = dataArrayRef.current[i] / 255;
      const y = (v * height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, height / 2 - y);
      } else {
        ctx.lineTo(x, height / 2 - y);
      }
      
      x += sliceWidth;
    }
    
    ctx.stroke();
    
    // Mirror effect
    ctx.beginPath();
    x = 0;
    for (let i = 0; i < barCount; i++) {
      const v = dataArrayRef.current[i] / 255;
      const y = (v * height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, height / 2 + y);
      } else {
        ctx.lineTo(x, height / 2 + y);
      }
      
      x += sliceWidth;
    }
    ctx.stroke();
  };

  // Draw circular visualization
  const drawCircularVisualization = (ctx, canvas) => {
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    
    ctx.translate(centerX, centerY);
    
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const barHeight = (dataArrayRef.current[i] / 255) * radius;
      
      const x1 = Math.cos(angle) * radius;
      const y1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle) * (radius + barHeight);
      const y2 = Math.sin(angle) * (radius + barHeight);
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    ctx.translate(-centerX, -centerY);
  };

  // Draw static visualization when not playing
  const drawStaticVisualization = (ctx, canvas) => {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    if (style === 'bars') {
      const barWidth = width / barCount;
      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * height * 0.1 + 5;
        const x = i * barWidth;
        const y = height - barHeight;
        
        ctx.fillStyle = adjustColorOpacity(color, 0.3);
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }
    } else if (style === 'wave') {
      ctx.strokeStyle = adjustColorOpacity(color, 0.3);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    } else if (style === 'circular') {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.3;
      
      ctx.strokeStyle = adjustColorOpacity(color, 0.3);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  // Utility function to adjust color brightness
  const adjustColorBrightness = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  // Utility function to adjust color opacity
  const adjustColorOpacity = (color, opacity) => {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ height: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          width: '100%', 
          height: '100%',
          imageRendering: 'pixelated'
        }}
      />
      
      {/* Overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      
      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        <motion.div
          className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-400'}`}
          animate={isPlaying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ repeat: isPlaying ? Infinity : 0, duration: 1 }}
        />
      </div>
    </motion.div>
  );
};

export default AudioVisualizer;