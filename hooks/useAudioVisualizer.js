import { useEffect, useRef, useState, useCallback } from 'react';

export const useAudioVisualizer = (audioElement, isPlaying) => {
  const [frequencyData, setFrequencyData] = useState(new Uint8Array(128));
  const [waveformData, setWaveformData] = useState(new Uint8Array(128));
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const dataArrayRef = useRef(null);
  const waveformArrayRef = useRef(null);

  const initializeAudioContext = useCallback(async () => {
    if (!audioElement || audioContextRef.current) return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyzer node
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      analyzerRef.current.smoothingTimeConstant = 0.8;

      // Create source from audio element
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      
      // Connect nodes
      sourceRef.current.connect(analyzerRef.current);
      analyzerRef.current.connect(audioContextRef.current.destination);

      // Initialize data arrays
      const bufferLength = analyzerRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      waveformArrayRef.current = new Uint8Array(bufferLength);

      setIsVisualizerActive(true);
    } catch (error) {
      console.error('Error initializing audio context:', error);
      setIsVisualizerActive(false);
    }
  }, [audioElement]);

  const updateVisualizerData = useCallback(() => {
    if (!analyzerRef.current || !dataArrayRef.current || !waveformArrayRef.current) return;

    // Get frequency data
    analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
    setFrequencyData(new Uint8Array(dataArrayRef.current));

    // Get waveform data
    analyzerRef.current.getByteTimeDomainData(waveformArrayRef.current);
    setWaveformData(new Uint8Array(waveformArrayRef.current));

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateVisualizerData);
    }
  }, [isPlaying]);

  const startVisualization = useCallback(async () => {
    if (!audioContextRef.current) {
      await initializeAudioContext();
    }

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying && analyzerRef.current) {
      updateVisualizerData();
    }
  }, [initializeAudioContext, updateVisualizerData, isPlaying]);

  const stopVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopVisualization();
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (analyzerRef.current) {
      analyzerRef.current.disconnect();
      analyzerRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsVisualizerActive(false);
  }, [stopVisualization]);

  // Effect to handle play/pause
  useEffect(() => {
    if (isPlaying && audioElement) {
      startVisualization();
    } else {
      stopVisualization();
    }
  }, [isPlaying, audioElement, startVisualization, stopVisualization]);

  // Effect to initialize when audio element changes
  useEffect(() => {
    if (audioElement && !audioContextRef.current) {
      initializeAudioContext();
    }
  }, [audioElement, initializeAudioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Helper functions for visualization components
  const getAverageFrequency = useCallback(() => {
    if (!frequencyData.length) return 0;
    const sum = frequencyData.reduce((acc, val) => acc + val, 0);
    return sum / frequencyData.length;
  }, [frequencyData]);

  const getBassFrequency = useCallback(() => {
    if (!frequencyData.length) return 0;
    // Bass frequencies are typically in the first 10% of the spectrum
    const bassEnd = Math.floor(frequencyData.length * 0.1);
    const bassData = frequencyData.slice(0, bassEnd);
    const sum = bassData.reduce((acc, val) => acc + val, 0);
    return sum / bassData.length;
  }, [frequencyData]);

  const getMidFrequency = useCallback(() => {
    if (!frequencyData.length) return 0;
    // Mid frequencies are in the middle 60% of the spectrum
    const midStart = Math.floor(frequencyData.length * 0.2);
    const midEnd = Math.floor(frequencyData.length * 0.8);
    const midData = frequencyData.slice(midStart, midEnd);
    const sum = midData.reduce((acc, val) => acc + val, 0);
    return sum / midData.length;
  }, [frequencyData]);

  const getTrebleFrequency = useCallback(() => {
    if (!frequencyData.length) return 0;
    // Treble frequencies are in the last 20% of the spectrum
    const trebleStart = Math.floor(frequencyData.length * 0.8);
    const trebleData = frequencyData.slice(trebleStart);
    const sum = trebleData.reduce((acc, val) => acc + val, 0);
    return sum / trebleData.length;
  }, [frequencyData]);

  const getNormalizedFrequencyData = useCallback((barCount = 32) => {
    if (!frequencyData.length) return new Array(barCount).fill(0);
    
    const normalized = [];
    const binSize = Math.floor(frequencyData.length / barCount);
    
    for (let i = 0; i < barCount; i++) {
      const start = i * binSize;
      const end = start + binSize;
      const slice = frequencyData.slice(start, end);
      const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      normalized.push(average / 255); // Normalize to 0-1 range
    }
    
    return normalized;
  }, [frequencyData]);

  return {
    frequencyData,
    waveformData,
    isVisualizerActive,
    getAverageFrequency,
    getBassFrequency,
    getMidFrequency,
    getTrebleFrequency,
    getNormalizedFrequencyData,
    startVisualization,
    stopVisualization,
    cleanup
  };
};