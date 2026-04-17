import { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, MonitorSpeaker, ListMusic, Maximize2, VolumeX, Volume1, Heart } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAudio } from '../../hooks/useAudio';
import { NowPlayingFull } from '../player/NowPlayingFull';

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function BottomPlayer() {
  const { currentTrack, isPlaying: storeIsPlaying, nextTrack, previousTrack, pause: storePause, playTrack, likedSongIds, toggleLike, isShuffle, repeatMode, toggleShuffle, toggleRepeat } = usePlayerStore();
  const [isNowPlayingExpanded, setIsNowPlayingExpanded] = useState(false);
  
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    play, 
    pause, 
    seek, 
    setVolume 
  } = useAudio({ 
    src: currentTrack?.url,
    autoPlay: true,
    loop: repeatMode === 'ONE',
    onEnded: () => {
      // The audio element handles repeating natively when loop is true
      // and won't fire the 'ended' event. 
      // If this fires, it means we must play the next track.
      nextTrack();
    }
  });

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Sync store state to audio
  useEffect(() => {
    if (storeIsPlaying && !isPlaying && currentTrack) play();
    if (!storeIsPlaying && isPlaying) pause();
  }, [storeIsPlaying, currentTrack, play, pause, isPlaying]);

  const handleTogglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      storePause();
    } else {
      playTrack(currentTrack);
    }
  };

  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: [
          { 
            src: currentTrack.albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=512&auto=format&fit=crop', 
            sizes: '512x512', 
            type: 'image/jpeg' 
          }
        ]
      });

      navigator.mediaSession.setActionHandler('play', handleTogglePlay);
      navigator.mediaSession.setActionHandler('pause', handleTogglePlay);
      navigator.mediaSession.setActionHandler('previoustrack', () => previousTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
    }
  }, [currentTrack, handleTogglePlay, previousTrack, nextTrack]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeeking(true);
    setSeekValue(Number(e.target.value));
  };

  const handleSeekMouseUp = () => {
    setIsSeeking(false);
    seek(seekValue);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const displayTime = isSeeking ? seekValue : currentTime;
  const progressPercent = duration ? (displayTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  const isLiked = currentTrack ? likedSongIds.includes(currentTrack.id) : false;

  return (
    <>
      {isNowPlayingExpanded && currentTrack && (
        <NowPlayingFull
          onClose={() => setIsNowPlayingExpanded(false)}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          displayTime={displayTime}
          duration={duration}
          progressPercent={progressPercent}
          handleTogglePlay={handleTogglePlay}
          handleSeekChange={handleSeekChange}
          handleSeekMouseUp={handleSeekMouseUp}
          formatTime={formatTime}
          nextTrack={nextTrack}
          previousTrack={previousTrack}
          isLiked={isLiked}
          toggleLike={toggleLike}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          toggleShuffle={toggleShuffle}
          toggleRepeat={toggleRepeat}
        />
      )}
      <footer className="h-16 md:h-24 bg-[#050a15] border-t border-[#1e3357] flex items-center justify-between px-2 md:px-4 fixed bottom-16 md:bottom-0 w-full z-[45] md:z-50 text-white">
      {/* 1. Track Info */}
      <div className="flex items-center w-[60%] md:w-1/3 min-w-[150px] md:min-w-[200px]">
        {currentTrack ? (
          <>
            <div 
              className="w-10 h-10 md:w-14 md:h-14 bg-[#1e3357] rounded-md flex-shrink-0 relative overflow-hidden group shadow-lg cursor-pointer hover:opacity-80 transition"
              onClick={() => setIsNowPlayingExpanded(true)}
            >
              <img 
                src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'} 
                alt="Album cover" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-3 md:ml-4 flex items-center flex-1 min-w-0 pr-2">
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 
                  className="text-sm font-semibold truncate hover:underline cursor-pointer leading-tight pb-0.5"
                  onClick={() => setIsNowPlayingExpanded(true)}
                >
                  {currentTrack.title}
                </h4>
                <p 
                  className="text-xs text-gray-400 truncate hover:underline cursor-pointer leading-tight pt-0.5"
                  onClick={() => setIsNowPlayingExpanded(true)}
                >
                  {currentTrack.artist}
                </p>
              </div>
              <button 
                onClick={() => toggleLike(currentTrack.id)}
                className="ml-3 focus:outline-none transition-transform hover:scale-110 active:scale-95 flex-shrink-0"
              >
                <Heart 
                  className={`w-4 h-4 ${isLiked ? 'fill-[#3b82f6] text-[#3b82f6]' : 'text-gray-400 hover:text-white'}`} 
                />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center text-gray-500 text-sm">
            No track selected
          </div>
        )}
      </div>

      {/* 2. Main Controls */}
      <div className="hidden md:flex flex-col items-center flex-1 max-w-[45%]">
        <div className="flex items-center gap-6 mb-2">
          <button onClick={toggleShuffle} className={`transition hover:text-white ${isShuffle ? 'text-[#3b82f6]' : 'text-gray-400'}`}>
            <Shuffle className="w-4 h-4" />
          </button>
          <button 
            onClick={previousTrack}
            className="text-gray-400 hover:text-white transition disabled:opacity-50"
            disabled={!currentTrack}
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button 
            onClick={handleTogglePlay}
            disabled={!currentTrack}
            className="w-8 h-8 flex items-center justify-center bg-white text-[#050a15] rounded-full hover:scale-105 transition hover:bg-gray-200 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-1" />
            )}
          </button>
          
          <button 
            onClick={nextTrack}
            className="text-gray-400 hover:text-white transition disabled:opacity-50"
            disabled={!currentTrack}
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button onClick={toggleRepeat} className={`transition hover:text-white ${repeatMode !== 'OFF' ? 'text-[#3b82f6]' : 'text-gray-400'}`}>
            {repeatMode === 'ONE' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3 text-xs text-gray-400">
          <span className="min-w-[40px] text-right text-[11px] font-medium">{formatTime(displayTime)}</span>
          
          <div className="flex-1 group relative h-3 flex items-center">
            {/* Custom Range Track */}
            <div className="absolute left-0 h-1 bg-[#4d4d4d] rounded-full w-full pointer-events-none group-hover:bg-[#5e5e5e] transition" />
            <div 
              className="absolute left-0 h-1 bg-white group-hover:bg-[#3b82f6] rounded-full pointer-events-none transition-colors"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Hidden Input */}
            <input 
              type="range"
              min={0}
              max={duration || 100}
              value={displayTime}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              onTouchEnd={handleSeekMouseUp}
              disabled={!currentTrack}
              className="absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
          
          <span className="min-w-[40px] text-[11px] font-medium">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Right Controls */}
      <div className="flex items-center justify-end w-[40%] md:w-1/3 gap-3 text-gray-400 pr-2">
        {/* Mobile-only Play/Pause */}
        <div className="md:hidden flex items-center pr-2">
           <button 
             onClick={handleTogglePlay}
             disabled={!currentTrack}
             className="text-white hover:scale-105 transition disabled:opacity-50"
           >
             {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
           </button>
        </div>

        <button className="hover:text-white transition hidden md:block">
          <ListMusic className="w-4 h-4" />
        </button>
        <button className="hover:text-white transition hidden md:block">
          <MonitorSpeaker className="w-4 h-4" />
        </button>
        
        <div className="hidden md:flex items-center gap-2 w-28 group">
          <button 
            className="hover:text-white transition"
            onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
          >
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <div className="flex-1 relative h-3 flex items-center">
            <div className="absolute left-0 h-1 bg-[#4d4d4d] rounded-full w-full pointer-events-none group-hover:bg-[#5e5e5e] transition" />
            <div 
              className="absolute left-0 h-1 bg-white group-hover:bg-[#3b82f6] rounded-full pointer-events-none transition-colors"
              style={{ width: `${volumePercent}%` }}
            />
            <input 
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="absolute w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
        
        <button 
          className="hover:text-white transition hidden md:block"
          onClick={() => { if(currentTrack) setIsNowPlayingExpanded(true); }}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
    </>
  );
}
