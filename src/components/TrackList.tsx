import React, { useState, useEffect, useRef } from 'react';
import { Play, Clock, MoreHorizontal, Plus, Check } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import type { Track } from '../store/usePlayerStore';

function formatTime(seconds?: number) {
  if (!seconds || isNaN(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface TrackListProps {
  tracks: Track[];
  onRemoveTrack?: (trackId: string) => void;
}

export function TrackList({ tracks, onRemoveTrack }: TrackListProps) {
  const { playTrack, setQueue, currentTrack, isPlaying, playlists, addTrackToPlaylist } = usePlayerStore();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlayTracker = (track: Track) => {
    setQueue(tracks);
    playTrack(track);
  };

  const handleAddToPlaylist = (e: React.MouseEvent, playlistId: string, track: Track) => {
    e.stopPropagation();
    addTrackToPlaylist(playlistId, track);
    setMenuOpenId(null);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-[minmax(0,1fr)_50px] md:grid-cols-[16px_1fr_minmax(120px,200px)_80px] gap-4 px-2 md:px-4 py-2 border-b border-[#1e3357] text-sm text-gray-400 font-medium tracking-wider mb-4">
        <div className="hidden md:block text-center">#</div>
        <div>Title</div>
        <div className="hidden md:block">Artist</div>
        <div className="flex justify-end pr-2"><Clock className="w-4 h-4" /></div>
      </div>

      <div className="flex flex-col gap-1 pb-16">
        {tracks.map((track, index) => {
          const isActive = currentTrack?.id === track.id;
          const isMenuOpen = menuOpenId === track.id;
          
          return (
            <div 
              key={track.id}
              className={`grid grid-cols-[minmax(0,1fr)_50px] md:grid-cols-[16px_1fr_minmax(120px,200px)_80px] gap-4 px-2 md:px-4 py-3 rounded-md hover:bg-[#1e3357] group cursor-pointer items-center transition-colors relative
                ${isActive ? 'bg-[#1e3357]/60' : ''}`}
            >
              <div className="hidden md:flex relative justify-center text-gray-400 w-4 h-4" onClick={() => handlePlayTracker(track)}>
                {isActive && isPlaying ? (
                   <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" alt="playing" className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                ) : (
                  <span className="group-hover:opacity-0 transition-opacity absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm">
                    {index + 1}
                  </span>
                )}
                <Play className={`w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${isActive && !isPlaying ? 'opacity-100' : ''}`} />
              </div>
              
              <div className="flex items-center min-w-0 gap-3" onClick={() => handlePlayTracker(track)}>
                {track.albumArt && (
                  <img src={track.albumArt} alt={track.title} className="w-10 h-10 object-cover rounded shadow-md flex-shrink-0" />
                )}
                <div className="flex flex-col min-w-0 flex-1 justify-center py-1">
                  <div className={`font-medium text-[13px] md:text-sm leading-snug break-words whitespace-normal ${isActive ? 'text-[#3b82f6]' : 'text-white'}`}>
                    {track.title}
                  </div>
                  <div className="md:hidden text-[11px] text-gray-400 break-words whitespace-normal leading-snug mt-0.5" onClick={(e) => { e.stopPropagation(); handlePlayTracker(track); }}>
                    {track.artist}
                  </div>
                </div>
              </div>
              
              <div className="hidden md:block text-sm text-gray-400 break-words whitespace-normal pr-2" onClick={() => handlePlayTracker(track)}>
                {track.artist}
              </div>
              
              <div className="flex justify-end items-center gap-1 md:gap-3 pr-2">
                <span className="text-sm text-gray-400">{formatTime(track.duration)}</span>
                
                {/* Context Menu Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : track.id); }}
                  className="text-gray-400 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div 
                    ref={menuRef}
                    className="absolute right-8 top-10 w-48 bg-[#1e3357] border border-[#2a4470] shadow-2xl rounded-md z-50 py-1"
                  >
                    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#2a4470] mb-1">
                      Add to Playlist
                    </div>
                    {playlists.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-gray-500 italic">No playlists yet</div>
                    ) : (
                      playlists.map(pl => {
                        const hasTrack = pl.tracks.some(t => t.id === track.id);
                        return (
                          <button
                            key={pl.id}
                            onClick={(e) => hasTrack ? e.stopPropagation() : handleAddToPlaylist(e, pl.id, track)}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between
                              ${hasTrack ? 'text-gray-500 cursor-not-allowed' : 'text-gray-200 hover:bg-[#2a4470]'}`}
                          >
                            <span className="truncate pr-2">{pl.name}</span>
                            {hasTrack ? <Check className="w-3 h-3 text-[#3b82f6]" /> : <Plus className="w-3 h-3 opacity-50" />}
                          </button>
                        );
                      })
                    )}
                    {onRemoveTrack && (
                       <>
                         <div className="border-t border-[#2a4470] my-1"></div>
                         <button
                           onClick={(e) => { e.stopPropagation(); onRemoveTrack(track.id); setMenuOpenId(null); }}
                           className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#2a4470]"
                         >
                           Remove from this Playlist
                         </button>
                       </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
