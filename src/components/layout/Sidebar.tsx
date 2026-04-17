import React, { useState } from 'react';
import { Home, Library as LibraryIcon, Compass, ListMusic, Plus } from 'lucide-react';
import type { ViewState } from '../../App';
import { usePlayerStore } from '../../store/usePlayerStore';

interface SidebarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { playlists, createPlaylist } = usePlayerStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  return (
    <aside className="hidden md:flex w-64 bg-[#050a15] border-r border-[#1e3357] flex-col h-full text-gray-300 overflow-y-auto">
      <div className="p-6 pb-2">
        <h1 className="text-white text-2xl font-bold tracking-tight mb-8">
          SoundScape
        </h1>
      </div>
      
      <nav className="px-4 space-y-2">
        <div className="bg-[#1e3357] rounded-lg p-4 space-y-4">
          <button 
            onClick={() => setCurrentView('home')} 
            className={`w-full flex items-center gap-4 font-semibold transition-colors ${currentView === 'home' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Home className="w-6 h-6" />
            Home
          </button>
          <button 
            onClick={() => setCurrentView('browse')} 
            className={`w-full flex items-center gap-4 font-semibold transition-colors ${currentView === 'browse' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Compass className="w-6 h-6" />
            Browse
          </button>
          <button 
            onClick={() => setCurrentView('library')} 
            className={`w-full flex items-center gap-4 font-semibold transition-colors ${currentView === 'library' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <LibraryIcon className="w-6 h-6" />
            Local Files
          </button>
        </div>
      </nav>

      {/* Playlists Dynamic Section */}
      <div className="px-4 mt-6 flex items-center justify-between group text-gray-400 hover:text-white transition-colors cursor-pointer">
        <div className="flex items-center gap-2 font-bold text-sm tracking-wider uppercase">
          <ListMusic className="w-4 h-4" /> Expand Playlists
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsCreating(true); }}
          className="p-1 hover:bg-[#1e3357] rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pb-6 mt-4 flex-1 overflow-y-auto">
        {isCreating && (
          <form onSubmit={handleCreate} className="mb-4">
            <input 
              autoFocus
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              onBlur={() => setIsCreating(false)}
              className="w-full bg-[#1e3357] text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-white"
            />
          </form>
        )}

        <div className="space-y-3 text-sm font-medium">
          {playlists.map(pl => (
            <p 
              key={pl.id}
              onClick={() => setCurrentView(`playlist_${pl.id}`)}
              className={`cursor-pointer px-2 transition-colors truncate ${currentView === `playlist_${pl.id}` ? 'text-[#3b82f6] font-bold' : 'hover:text-white'}`}
            >
              {pl.name}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}
