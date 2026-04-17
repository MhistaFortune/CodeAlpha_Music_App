import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseAudioOptions {
  src?: string;
  autoPlay?: boolean;
  initialVolume?: number;
  loop?: boolean;
  onEnded?: () => void;
}

export function useAudio({ src, autoPlay = false, initialVolume = 1, loop = false, onEnded }: UseAudioOptions = {}) {
  // Use a ref to hold the audio object so we don't recreate it unnecessarily
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
    }
  }, [loop]);

  // Setup the audio element
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = initialVolume;

    // Cleanup when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manage src and event listeners when src changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // If no src is provided, just reset
    if (!src) {
        audio.src = '';
        setCurrentTime(0);
        setDuration(0);
        return;
    }

    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEndedRef.current) onEndedRef.current();
    };
    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load audio source.');
    };

    // Attach listeners
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Load the new source
    setIsLoading(true);
    setError(null);
    audio.src = src;
    
    if (autoPlay) {
      audio.play().catch(e => console.error('Autoplay failed:', e));
    }

    return () => {
      // Remove listeners
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src, autoPlay]);

  // Methods
  const play = useCallback(() => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(e => console.error('Playback failed:', e));
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !audioRef.current.src) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error('Playback failed:', e));
    }
  }, [isPlaying]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      const boundedTime = Math.max(0, Math.min(time, duration || 0));
      audioRef.current.currentTime = boundedTime;
      setCurrentTime(boundedTime);
    }
  }, [duration]);

  const seekForward = useCallback((amount: number = 10) => {
    if (audioRef.current) {
      seek(audioRef.current.currentTime + amount);
    }
  }, [seek]);

  const seekBackward = useCallback((amount: number = 10) => {
    if (audioRef.current) {
      seek(audioRef.current.currentTime - amount);
    }
  }, [seek]);

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      const boundedVolume = Math.max(0, Math.min(newVolume, 1));
      audioRef.current.volume = boundedVolume;
      setVolumeState(boundedVolume);
    }
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    play,
    pause,
    togglePlayPause,
    stop,
    seek,
    seekForward,
    seekBackward,
    setVolume,
  };
}
