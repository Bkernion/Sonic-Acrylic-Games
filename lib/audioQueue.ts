export type StreamingLinks = {
  spotify?: string;
  apple_music?: string;
  youtube_music?: string;
  bandcamp?: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  file: string;
  duration_sec: number;
  streaming_links: StreamingLinks;
};

export type QueueState = {
  tracks: Track[];
  index: number;
  isPlaying: boolean;
  positionSec: number;
};

export function initQueue(tracks: Track[]): QueueState {
  return { tracks, index: 0, isPlaying: false, positionSec: 0 };
}

export function currentTrack(q: QueueState): Track | undefined {
  return q.tracks[q.index];
}

export function advance(q: QueueState): QueueState {
  if (q.tracks.length === 0) return q;
  return { ...q, index: (q.index + 1) % q.tracks.length, positionSec: 0 };
}

export function prev(q: QueueState): QueueState {
  if (q.tracks.length === 0) return q;
  return { ...q, index: (q.index - 1 + q.tracks.length) % q.tracks.length, positionSec: 0 };
}

export function setIndex(q: QueueState, i: number): QueueState {
  if (q.tracks.length === 0) return q;
  const clamped = Math.max(0, Math.min(q.tracks.length - 1, i));
  return { ...q, index: clamped, positionSec: 0 };
}
