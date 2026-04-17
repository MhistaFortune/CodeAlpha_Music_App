import { Play, Music, Trash2 } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { TrackList } from '../components/TrackList';

interface PlaylistDetailProps {
  playlistId: string;
}

export function PlaylistDetail({ playlistId }: PlaylistDetailProps) {
  const { playlists, playTrack, setQueue, deletePlaylist, removeTrackFromPlaylist } = usePlayerStore();
  const playlist = playlists.find(p => p.id === playlistId);

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Music className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Playlist Not Found</h2>
        <p>This playlist may have been deleted.</p>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      setQueue(playlist.tracks);
      playTrack(playlist.tracks[0]);
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    removeTrackFromPlaylist(playlist.id, trackId);
  };

  return (
    <div className="text-white min-h-[calc(100vh-200px)]">
      {/* Header Profile */}
      <div className="flex items-end gap-6 mb-8 mt-4">
        <div className="w-48 h-48 bg-gradient-to-br from-[#3b82f6] to-[#050a15] shadow-2xl flex items-center justify-center rounded-md border border-[#1e3357]">
          {playlist.tracks.length > 0 && playlist.tracks[0].albumArt ? (
            <img src={playlist.tracks[0].albumArt} alt="cover preview" className="w-full h-full object-cover" />
          ) : (
            <Music className="w-20 h-20 text-white/50" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2">Playlist</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 truncate text-white max-w-[800px]">
            {playlist.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
            <span className="text-white">You</span>
            <span>•</span>
            <span>{playlist.tracks.length} songs</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <button 
          onClick={handlePlayAll}
          disabled={playlist.tracks.length === 0}
          className="w-14 h-14 flex items-center justify-center bg-[#3b82f6] text-[#050a15] rounded-full hover:scale-105 transition shadow-xl disabled:opacity-50 disabled:hover:scale-100"
        >
          <Play className="w-6 h-6 fill-current ml-1" />
        </button>

        <button 
          onClick={() => {
            if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
              deletePlaylist(playlist.id);
            }
          }}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#1e3357] rounded-full transition"
          title="Delete Playlist"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      {playlist.tracks.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-[#1e3357] rounded-lg">
          <h3 className="text-xl font-bold text-white mb-2">It's a bit empty here...</h3>
          <p>Go to Browse or Local Files to add some songs!</p>
        </div>
      ) : (
        <TrackList tracks={playlist.tracks} onRemoveTrack={handleRemoveTrack} />
      )}
    </div>
  );
}
