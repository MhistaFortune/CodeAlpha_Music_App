import { useRef, useState } from 'react';
import { UploadCloud, Play, Clock, Music } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import type { Track } from '../store/usePlayerStore';

function formatTime(seconds?: number) {
  if (!seconds || isNaN(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Library() {
  const { libraryTracks, addTracksToLibrary, playTrack, setQueue, currentTrack, isPlaying } = usePlayerStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => resolve(0);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const newTracks: Track[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/')) continue;

      const duration = await extractDuration(file);
      const title = file.name.replace(/\.[^/.]+$/, ""); // strip extension
      
      newTracks.push({
        id: crypto.randomUUID(),
        title,
        artist: 'Unknown Artist', // default fallback
        url: URL.createObjectURL(file),
        duration
      });
    }

    addTracksToLibrary(newTracks);
    setIsProcessing(false);
  };

  const handlePlayTracker = (track: Track) => {
    setQueue(libraryTracks);
    playTrack(track);
  };

  return (
    <div className="pb-8 text-white min-h-[calc(100vh-200px)]">
      <div className="flex items-end gap-6 mb-8 mt-4">
        <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-800 shadow-2xl flex items-center justify-center rounded-md">
          <Music className="w-20 h-20 text-white/80" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest mb-2">Playlist</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">Local Files</h1>
          <p className="text-gray-400 text-sm font-medium">
            {libraryTracks.length} tracks
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        className={`w-full py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer mb-8
          ${isHovering ? 'border-[#3b82f6] bg-[#3b82f6]/10' : 'border-[#1e3357] bg-[#101d36] hover:border-gray-500'}`}
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsHovering(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className={`w-10 h-10 mb-4 ${isHovering ? 'text-[#3b82f6]' : 'text-gray-400'}`} />
        <p className="font-semibold text-lg text-gray-200 mb-1">
          {isProcessing ? 'Processing files...' : 'Drag and drop audio files here'}
        </p>
        <p className="text-sm text-gray-400 mb-4">or click to browse your device</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="audio/*"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button 
          className="bg-white text-[#050a15] font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-full hover:scale-105 transition"
        >
          Select Files
        </button>
      </div>

      {/* Library Table */}
      {libraryTracks.length > 0 && (
        <div className="mt-8">
          <div className="grid grid-cols-[16px_1fr_minmax(120px,200px)_60px] gap-4 px-4 py-2 border-b border-[#1e3357] text-sm text-gray-400 font-medium tracking-wider mb-4">
            <div className="text-center">#</div>
            <div>Title</div>
            <div>Artist</div>
            <div className="flex justify-end pr-2"><Clock className="w-4 h-4" /></div>
          </div>

          <div className="flex flex-col gap-1">
            {libraryTracks.map((track, index) => {
              const isActive = currentTrack?.id === track.id;
              return (
                <div 
                  key={track.id}
                  onClick={() => handlePlayTracker(track)}
                  className={`grid grid-cols-[16px_1fr_minmax(120px,200px)_60px] gap-4 px-4 py-3 rounded-md hover:bg-[#1e3357] group cursor-pointer items-center transition-colors
                    ${isActive ? 'bg-[#1e3357]/60' : ''}`}
                >
                  <div className="relative flex justify-center text-gray-400 w-4 h-4">
                    {isActive && isPlaying ? (
                       <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" alt="playing" className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    ) : (
                      <span className="group-hover:opacity-0 transition-opacity absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm">
                        {index + 1}
                      </span>
                    )}
                    <Play className={`w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${isActive && !isPlaying ? 'opacity-100' : ''}`} />
                  </div>
                  
                  <div className="flex items-center truncate">
                    <span className={`font-medium truncate ${isActive ? 'text-[#3b82f6]' : 'text-white'}`}>
                      {track.title}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400 truncate">
                    {track.artist}
                  </div>
                  
                  <div className="text-sm text-gray-400 flex justify-end">
                    {formatTime(track.duration)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
