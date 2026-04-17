import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ChevronDown } from 'lucide-react';
import type { Track } from '../../store/usePlayerStore';

interface NowPlayingFullProps {
  onClose: () => void;
  currentTrack: Track;
  isPlaying: boolean;
  displayTime: number;
  duration: number;
  progressPercent: number;
  handleTogglePlay: () => void;
  handleSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSeekMouseUp: () => void;
  formatTime: (seconds: number) => string;
  nextTrack: () => void;
  previousTrack: () => void;
  isLiked: boolean;
  toggleLike: (id: string) => void;
  isShuffle: boolean;
  repeatMode: 'OFF' | 'ALL' | 'ONE';
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export function NowPlayingFull({
  onClose,
  currentTrack,
  isPlaying,
  displayTime,
  duration,
  progressPercent,
  handleTogglePlay,
  handleSeekChange,
  handleSeekMouseUp,
  formatTime,
  nextTrack,
  previousTrack,
  isLiked,
  toggleLike,
  isShuffle,
  repeatMode,
  toggleShuffle,
  toggleRepeat
}: NowPlayingFullProps) {
  
  // Create a safe high-res image URL safely handling empty track images
  const albumArtUrl = currentTrack.albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden bg-[#050a15] text-white animate-in slide-in-from-bottom duration-300">
      
      {/* Blurred Background Filter */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-40 scale-110 blur-3xl pointer-events-none"
        style={{ backgroundImage: `url(${albumArtUrl})` }}
      />
      
      {/* Heavy gradient to dark out bottom part */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050a15]/50 to-[#050a15] z-0 pointer-events-none" />

      {/* Top Bar Navigation */}
      <div className="relative w-full z-10 flex items-center justify-between px-6 pt-10 pb-4">
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronDown className="w-8 h-8 opacity-80 hover:opacity-100" />
        </button>
        <span className="text-xs uppercase tracking-widest font-bold opacity-80">Now Playing</span>
        <div className="w-12" /> {/* Empty spacer for centered text */}
      </div>

      {/* Album Artwork */}
      <div className="relative z-10 w-full max-w-md px-8 flex-1 flex items-center justify-center">
        <div className="w-full aspect-square rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-[#0a1426]">
          <img 
            src={albumArtUrl}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Track Details & Main Controls */}
      <div className="relative z-10 w-full max-w-md px-8 pb-16 flex flex-col gap-6">
        
        {/* Texts & Like Button */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col overflow-hidden pr-4">
            <h2 className="text-2xl font-bold truncate tracking-tight">{currentTrack.title}</h2>
            <p className="text-lg opacity-60 truncate">{currentTrack.artist}</p>
          </div>
          <button 
            onClick={() => toggleLike(currentTrack.id)}
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95 flex-shrink-0"
          >
            <Heart className={`w-8 h-8 ${isLiked ? 'fill-[#3b82f6] text-[#3b82f6]' : 'text-white'}`} />
          </button>
        </div>

        {/* Scrubber Timeline */}
        <div className="flex flex-col gap-2">
          <div className="group relative h-2 w-full flex items-center cursor-pointer">
             <div className="absolute left-0 h-1.5 bg-white/20 rounded-full w-full pointer-events-none transition" />
             <div 
               className="absolute left-0 h-1.5 bg-white group-hover:bg-[#3b82f6] rounded-full pointer-events-none transition-colors"
               style={{ width: `${progressPercent}%` }}
             />
             <input 
               type="range"
               min={0}
               max={duration || 100}
               value={displayTime}
               onChange={handleSeekChange}
               onMouseUp={handleSeekMouseUp}
               onTouchEnd={handleSeekMouseUp}
               className="absolute w-full h-full opacity-0 cursor-pointer"
             />
          </div>
          <div className="flex justify-between text-xs font-semibold opacity-60 font-mono tracking-wider">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Big Buttons Layout */}
        <div className="flex items-center justify-between pb-4">
          <button onClick={toggleShuffle} className={`transition ${isShuffle ? 'text-[#3b82f6] opacity-100' : 'opacity-50 hover:opacity-100'}`}>
            <Shuffle className="w-6 h-6" />
          </button>
          
          <button onClick={previousTrack} className="opacity-80 hover:opacity-100 transition hover:-translate-x-1">
            <SkipBack className="w-10 h-10 fill-current" />
          </button>
          
          <button 
            onClick={handleTogglePlay} 
            className="w-20 h-20 flex items-center justify-center bg-[#3b82f6] text-[#050a15] rounded-full hover:scale-105 transition hover:bg-[#6099f7] shadow-xl"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 fill-current" />
            ) : (
              <Play className="w-10 h-10 fill-current ml-2" />
            )}
          </button>
          
          <button onClick={nextTrack} className="opacity-80 hover:opacity-100 transition hover:translate-x-1">
            <SkipForward className="w-10 h-10 fill-current" />
          </button>
          
          <button onClick={toggleRepeat} className={`transition ${repeatMode !== 'OFF' ? 'text-[#3b82f6] opacity-100' : 'opacity-50 hover:opacity-100'}`}>
            {repeatMode === 'ONE' ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
          </button>
        </div>

      </div>
    </div>
  );
}
