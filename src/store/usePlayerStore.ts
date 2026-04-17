import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  url: string;
  duration?: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
}

interface PlayerState {
  // State properties
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  volume: number;
  currentTime: number;
  isShuffle: boolean;
  repeatMode: 'OFF' | 'ALL' | 'ONE';
  
  // Persistent Collections
  libraryTracks: Track[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
  likedSongIds: string[];
  
  // Actions
  playTrack: (track: Track) => void;
  pause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setQueue: (tracks: Track[]) => void;
  addTracksToLibrary: (tracks: Track[]) => void;
  
  // Playlist Actions
  createPlaylist: (name: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  
  // User Prefs
  toggleLike: (trackId: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentTrack: null,
      isPlaying: false,
      queue: [],
      volume: 1, // 0 to 1
      currentTime: 0,
      isShuffle: false,
      repeatMode: 'OFF',
      libraryTracks: [],
      playlists: [
        { id: 'fav', name: 'Favorites', tracks: [], createdAt: Date.now() }
      ],
      recentlyPlayed: [],
      likedSongIds: [],

      // Actions
      playTrack: (track) => {
        set((state) => {
          if (state.currentTrack?.id === track.id) {
            return { isPlaying: true };
          }
          
          const existsInQueue = state.queue.some(t => t.id === track.id);
          const newQueue = existsInQueue ? state.queue : [track, ...state.queue];

          const filteredHistory = state.recentlyPlayed.filter(t => t.id !== track.id);
          const updatedRecentlyPlayed = [track, ...filteredHistory].slice(0, 20);

          return {
            currentTrack: track,
            isPlaying: true,
            queue: newQueue,
            currentTime: 0,
            recentlyPlayed: updatedRecentlyPlayed
          };
        });
      },

      pause: () => set({ isPlaying: false }),

      nextTrack: () => {
        const { currentTrack, queue, isShuffle } = get();
        if (!currentTrack || queue.length === 0) return;

        if (isShuffle) {
          const randomIndex = Math.floor(Math.random() * queue.length);
          get().playTrack(queue[randomIndex]);
          return;
        }

        const currentIndex = queue.findIndex((track) => track.id === currentTrack.id);
        if (currentIndex >= 0 && currentIndex < queue.length - 1) {
          get().playTrack(queue[currentIndex + 1]);
        } else if (currentIndex === queue.length - 1) {
          if (get().repeatMode === 'ALL') {
            get().playTrack(queue[0]);
          } else {
            set({ isPlaying: false, currentTime: 0 });
          }
        }
      },

      previousTrack: () => {
        const { currentTrack, queue, currentTime } = get();
        if (!currentTrack || queue.length === 0) return;

        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }

        const currentIndex = queue.findIndex((track) => track.id === currentTrack.id);
        if (currentIndex > 0) {
          get().playTrack(queue[currentIndex - 1]);
        } else {
          if (get().repeatMode === 'ALL') {
            get().playTrack(queue[queue.length - 1]);
          } else {
            set({ currentTime: 0 });
          }
        }
      },

      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      toggleRepeat: () => set((state) => {
        const nextMode = { 'OFF': 'ALL', 'ALL': 'ONE', 'ONE': 'OFF' } as const;
        return { repeatMode: nextMode[state.repeatMode] || 'OFF' };
      }),

      setVolume: (volume) => {
        const boundedVolume = Math.max(0, Math.min(volume, 1));
        set({ volume: boundedVolume });
      },

      setCurrentTime: (time) => set({ currentTime: time }),
      
      setQueue: (tracks) => set({ queue: tracks }),

      addTracksToLibrary: (tracks) => set((state) => ({ 
        libraryTracks: [...state.libraryTracks, ...tracks] 
      })),

      createPlaylist: (name) => {
        set((state) => ({
          playlists: [
            ...state.playlists,
            { id: `pl_${crypto.randomUUID()}`, name, tracks: [], createdAt: Date.now() }
          ]
        }));
      },

      addTrackToPlaylist: (playlistId, track) => {
        set((state) => ({
          playlists: state.playlists.map(pl => {
            if (pl.id === playlistId) {
              if (pl.tracks.some(t => t.id === track.id)) return pl;
              return { ...pl, tracks: [...pl.tracks, track] };
            }
            return pl;
          })
        }));
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        set((state) => ({
          playlists: state.playlists.map(pl => {
            if (pl.id === playlistId) {
              return { ...pl, tracks: pl.tracks.filter(t => t.id !== trackId) };
            }
            return pl;
          })
        }));
      },

      deletePlaylist: (playlistId) => {
        set((state) => ({
          playlists: state.playlists.filter(pl => pl.id !== playlistId)
        }));
      },
      
      toggleLike: (trackId) => {
        set((state) => {
          const isLiked = state.likedSongIds.includes(trackId);
          return {
            likedSongIds: isLiked 
              ? state.likedSongIds.filter(id => id !== trackId) 
              : [...state.likedSongIds, trackId]
          }
        });
      }
    }),
    {
      name: 'soundscape-storage', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        libraryTracks: state.libraryTracks,
        playlists: state.playlists,
        likedSongIds: state.likedSongIds,
        recentlyPlayed: state.recentlyPlayed,
        volume: state.volume,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode
      }),
    }
  )
);
