import type { Track } from '../store/usePlayerStore';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const musicService = {
  /**
   * Fetch all mock songs using the global fetch API, simulating a network delay.
   */
  async getSongs(): Promise<Track[]> {
    try {
      // Simulate typical API network latency (800ms)
      await delay(800);
      
      const response = await fetch('/api/songs.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const data: Track[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  },

  /**
   * Search query against the mock data source.
   */
  async searchSongs(query: string): Promise<Track[]> {
    try {
      // Simulated API response time for search endpoint
      await delay(500);

      const response = await fetch('/api/songs.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const allTracks: Track[] = await response.json();
      const lowerQuery = query.toLowerCase();
      
      return allTracks.filter(
        track =>
          track.title.toLowerCase().includes(lowerQuery) ||
          track.artist.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching songs:', error);
      throw error;
    }
  }
};
