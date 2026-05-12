import type { Track } from "./audioQueue";

// Placeholder. Replace with real tracks once Ben supplies MP3s + streaming links.
// File paths point at /public/audio/. Names are stand-ins.
export const TRACKS: Track[] = [
  {
    id: "placeholder-1",
    title: "Placeholder One",
    artist: "Sonic Acrylic",
    file: "/audio/placeholder-1.mp3",
    duration_sec: 180,
    streaming_links: {
      spotify: "https://open.spotify.com/artist/PLACEHOLDER",
      apple_music: "https://music.apple.com/us/artist/PLACEHOLDER",
      youtube_music: "https://music.youtube.com/channel/PLACEHOLDER",
      bandcamp: "https://sonicacrylic.bandcamp.com",
    },
  },
];
