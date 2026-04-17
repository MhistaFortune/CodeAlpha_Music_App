import type { Track } from '../store/usePlayerStore';

/**
 * Deterministically buckets a track into a discrete integer bracket [0, 1, 2].
 * Extremely fast hashing methodology suitable for offline pseudo-random distributions.
 */
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 3;
}

export function getMoodMixes(tracks: Track[]) {
  const mixes: Record<string, Track[]> = {
    'Chill & Focus Workspace': [],
    'Upbeat Electronic Energy': [],
    'Late Night Lo-Fi Vibes': []
  };
  
  const keys = Object.keys(mixes);

  tracks.forEach(track => {
    // Generate an absolute deterministic bucket using string hashing
    const bucket = stringToHash(track.title + track.artist);
    mixes[keys[bucket]].push(track);
  });

  return mixes;
}

export function getRecommendations(allTracks: Track[], recentlyPlayed: Track[]): Track[] {
  if (recentlyPlayed.length === 0) {
    // No history, return generic tracks pseudo-randomly
    return allTracks.filter(t => stringToHash(t.id) === 1).slice(0, 5);
  }

  // Aggregate user history tracking
  const artistCounts: Record<string, number> = {};
  recentlyPlayed.forEach(track => {
    artistCounts[track.artist] = (artistCounts[track.artist] || 0) + 1;
  });

  // Pull top 2 highly correlated artists
  const topArtists = Object.keys(artistCounts)
    .sort((a, b) => artistCounts[b] - artistCounts[a])
    .slice(0, 2);

  if (topArtists.length === 0) return [];

  const recentIds = new Set(recentlyPlayed.map(t => t.id));
  
  // Find tracks from these top artists that the user HAS NOT listened to yet
  const recommendations = allTracks.filter(
    track => topArtists.includes(track.artist) && !recentIds.has(track.id)
  );

  // If local DB doesn't have enough unplayed tracks by these specific artists, inject deterministic discovery tracks
  if (recommendations.length < 5) {
     const fillers = allTracks.filter(track => !recentIds.has(track.id) && stringToHash(track.title) === 0);
     return [...recommendations, ...fillers].slice(0, 6);
  }

  return recommendations.slice(0, 6);
}
