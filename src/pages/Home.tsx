import { useEffect, useState, useMemo } from 'react';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import type { Track } from '../store/usePlayerStore';
import { musicService } from '../services/musicService';
import { getMoodMixes, getRecommendations } from '../utils/recommendations';

export function Home() {
  const { recentlyPlayed, libraryTracks, playTrack, setQueue } = usePlayerStore();
  const { user } = useAuthStore();
  const [apiTracks, setApiTracks] = useState<Track[]>([]);

  useEffect(() => {
    // Prime the discovery engine with the freshest cloud catalog data asynchronously
    musicService.getSongs().then(setApiTracks).catch(console.error);
  }, []);

  // Aggregation matrices for RecSys
  const combinedCatalog = useMemo(() => [...libraryTracks, ...apiTracks], [libraryTracks, apiTracks]);

  const recommendedTracks = useMemo(() => {
    return getRecommendations(combinedCatalog, recentlyPlayed);
  }, [combinedCatalog, recentlyPlayed]);

  const moodMixes = useMemo(() => {
    return getMoodMixes(combinedCatalog);
  }, [combinedCatalog]);

  const handlePlayCollection = (tracks: Track[], indexStart: number) => {
    if (tracks.length === 0) return;
    setQueue(tracks);
    playTrack(tracks[indexStart]);
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  return (
    <div className="pb-16 pt-4 text-white">
      {/* 1. Intelligent Greeting */}
      <h2 className="text-3xl font-bold mb-6 tracking-tight">{greeting}{user?.username ? `, ${user.username}` : ''}</h2>
      
      {recentlyPlayed.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {recentlyPlayed.slice(0, 6).map((track, idx) => (
            <div 
              key={`${track.id}-${idx}-top`} 
              onClick={() => handlePlayCollection(recentlyPlayed, idx)}
              className="group flex flex-row items-center bg-[#1e3357]/60 hover:bg-[#2a4470] transition rounded-md overflow-hidden cursor-pointer relative"
            >
              <img 
                src={track.albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'} 
                alt={track.title} 
                className="w-16 h-16 object-cover shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
              />
              <span className="font-bold ml-4 p-2 truncate flex-1">{track.title}</span>
              <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition shadow-lg rounded-full">
                <button className="w-12 h-12 flex items-center justify-center bg-[#3b82f6] text-[#050a15] rounded-full hover:scale-105 transition shadow-[0_8px_8px_rgba(0,0,0,0.3)]">
                   <Play className="w-6 h-6 fill-current ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 mb-8 italic">You haven't played any tracks yet. Check out the Browse tab to get started!</p>
      )}

      {/* 2. Personalized Recommendations */}
      {recommendedTracks.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 tracking-tight hover:underline cursor-pointer inline-block">Recommended For You</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {recommendedTracks.map((track, idx) => (
              <div 
                key={`${track.id}-rec`} 
                onClick={() => handlePlayCollection(recommendedTracks, idx)}
                className="bg-[#101d36] hover:bg-[#1e3357] p-4 rounded-lg transition group cursor-pointer border border-transparent hover:border-[#1e3357] flex flex-col"
              >
                <div className="relative mb-4 w-full aspect-square">
                  <img 
                    src={track.albumArt || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=200&auto=format&fit=crop'} 
                    alt="Cover" 
                    className="w-full h-full object-cover rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)] bg-[#1e3357]" 
                  />
                  <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition shadow-lg rounded-full">
                    <button className="w-12 h-12 flex items-center justify-center bg-[#3b82f6] text-[#050a15] rounded-full hover:scale-105 transition shadow-[0_8px_8px_rgba(0,0,0,0.3)]">
                       <Play className="w-6 h-6 fill-current ml-1" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold mb-1 truncate">{track.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{track.artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Pre-compiled Mood Playlists */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 tracking-tight hover:underline cursor-pointer inline-block">Mood Mixes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(moodMixes).map(([mood, tracks], idx) => {
            if (tracks.length === 0) return null;
            // Generate a random-looking gradient for each mood card
            const gradients = [
              'from-purple-600 to-blue-900',
              'from-orange-500 to-red-900',
              'from-[#3b82f6] to-[#050a15]'
            ];
            
            return (
              <div 
                key={mood}
                onClick={() => handlePlayCollection(tracks, 0)}
                className={`bg-gradient-to-br ${gradients[idx % 3]} p-6 rounded-xl aspect-[2/1] relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition`}
              >
                 <div className="absolute inset-0 bg-[#050a15]/20 group-hover:bg-transparent transition-colors z-10" />
                 <div className="relative z-20 h-full flex flex-col justify-between">
                   <h3 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">{mood}</h3>
                   <div className="flex justify-between items-end">
                     <p className="text-sm font-semibold opacity-90">{tracks.length} Tracks</p>
                     <button className="w-14 h-14 flex items-center justify-center bg-white text-[#050a15] rounded-full hover:scale-105 transition translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-xl">
                       <Play className="w-6 h-6 fill-current ml-1" />
                     </button>
                   </div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
