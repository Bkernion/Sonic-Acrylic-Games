import type { Track } from "./audioQueue";

// Streaming-platform links point to Sonic Acrylic's artist/profile pages so taps
// from any track land on a page where the listener can pick something to play.
// When per-song MP3s ship under /public/audio/, swap `file` and optionally
// replace each track's streaming_links with the specific song URLs on each DSP.
export const TRACKS: Track[] = [
  {
    id: "forever",
    title: "Forever",
    artist: "Sonic Acrylic",
    file: "/audio/forever.mp3",
    duration_sec: 210,
    streaming_links: {
      spotify: "https://open.spotify.com/artist/32wz4FBeWBEXWVPLuEshz1",
      apple_music: "https://music.apple.com/us/artist/sonic-acrylic/1396100230",
      youtube_music: "https://music.youtube.com/channel/UCwwk1oiRuKOWE6rgidXs3-g",
      bandcamp: "https://sonicacrylic.bandcamp.com/album/alternates",
    },
  },
];
