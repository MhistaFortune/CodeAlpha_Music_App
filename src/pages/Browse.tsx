import { useEffect, useState, useMemo } from 'react';
import { Search, ArrowUpDown, Server, HardDrive } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import type { Track } from '../store/usePlayerStore';
import { musicService } from '../services/musicService';
import { TrackList } from '../components/TrackList';

export function Browse() {
  const { libraryTracks } = usePlayerStore();
  const [apiTracks, setApiTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  
  const [sortConfig, setSortConfig] = useState<'title' | 'artist' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    let active = true;
    
    const fetchApiTracks = async () => {
      setIsLoading(true);
      try {
        const results = query 
          ? await musicService.searchSongs(query) 
          : await musicService.getSongs();
        if (active) setApiTracks(results);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    // Debounce search by 300ms
    const timer = setTimeout(() => {
      fetchApiTracks();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Handle Local Filtering synchronously matching the debounced query
  const localTracks = useMemo(() => {
    if (!query) return libraryTracks;
    const lowerQuery = query.toLowerCase();
    return libraryTracks.filter(
      (track) =>
        track.title.toLowerCase().includes(lowerQuery) ||
        track.artist.toLowerCase().includes(lowerQuery)
    );
  }, [libraryTracks, query]);

  // Handle unified sorting
  const handleSort = (key: 'title' | 'artist') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig === key && sortOrder === 'asc') {
      direction = 'desc';
    }
    setSortConfig(key);
    setSortOrder(direction);
  };

  const sortFunction = (a: Track, b: Track) => {
    if (sortConfig === null) return 0;
    if (a[sortConfig] < b[sortConfig]) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (a[sortConfig] > b[sortConfig]) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  };

  const sortedApiTracks = useMemo(() => [...apiTracks].sort(sortFunction), [apiTracks, sortConfig, sortOrder]);
  const sortedLocalTracks = useMemo(() => [...localTracks].sort(sortFunction), [localTracks, sortConfig, sortOrder]);

  return (
    <div className="pb-8 text-white min-h-[calc(100vh-200px)] pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Browse Music</h1>
        
        <div className="relative w-full md:w-80 shadow-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search API & Local Files..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#1e3357] text-white text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => handleSort('title')}
          className={`text-[11px] font-bold uppercase tracking-widest py-2 px-5 rounded-full border transition flex items-center gap-2
            ${sortConfig === 'title' ? 'border-[#3b82f6] text-[#3b82f6] bg-[#3b82f6]/10' : 'border-[#2a4470] text-gray-400 hover:border-gray-500 hover:text-white'}`}
        >
          Title <ArrowUpDown className="w-3 h-3" />
        </button>
        <button 
          onClick={() => handleSort('artist')}
          className={`text-[11px] font-bold uppercase tracking-widest py-2 px-5 rounded-full border transition flex items-center gap-2
            ${sortConfig === 'artist' ? 'border-[#3b82f6] text-[#3b82f6] bg-[#3b82f6]/10' : 'border-[#2a4470] text-gray-400 hover:border-gray-500 hover:text-white'}`}
        >
          Artist <ArrowUpDown className="w-3 h-3" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin drop-shadow-md"></div>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* External Mock API Segment */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-gray-300 font-bold tracking-wide border-b border-[#1e3357] pb-2">
              <Server className="w-5 h-5 text-[#3b82f6]" />
              <h2>Cloud Catalog</h2>
            </div>
            {sortedApiTracks.length === 0 ? (
              <div className="py-6 text-gray-500 italic text-sm text-center border border-dashed border-[#1e3357] rounded">
                No cloud tracks found matching "{query}"
              </div>
            ) : (
              <TrackList tracks={sortedApiTracks} />
            )}
          </div>

          {/* Local Uploads Segment */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-gray-300 font-bold tracking-wide border-b border-[#1e3357] pb-2">
              <HardDrive className="w-5 h-5 text-purple-500" />
              <h2>Local Files</h2>
            </div>
            {sortedLocalTracks.length === 0 ? (
              <div className="py-6 text-gray-500 italic text-sm text-center border border-dashed border-[#1e3357] rounded">
                {libraryTracks.length === 0 
                  ? "You haven't uploaded any local files yet."
                  : `No local tracks found matching "${query}"`}
              </div>
            ) : (
              <TrackList tracks={sortedLocalTracks} />
            )}
          </div>

        </div>
      )}
    </div>
  );
}
