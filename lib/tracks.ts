import type { Track } from "./audioQueue";

// Sonic Acrylic — Alternates (2019/2021), full album in track order.
// Spotify + Bandcamp deeplink per song; Apple Music points to the album page
// (per-song IDs aren't exposed in the public album HTML); YouTube Music points
// to the artist channel (no easy per-track deeplink without the Music API).
const APPLE_ALBUM = "https://music.apple.com/us/album/alternates/1558388633";
const YT_ARTIST = "https://music.youtube.com/channel/UCwwk1oiRuKOWE6rgidXs3-g";

export const TRACKS: Track[] = [
  {
    id: "moments-away",
    title: "Moments Away",
    artist: "Sonic Acrylic",
    file: "/audio/01-moments-away.mp3",
    duration_sec: 252,
    streaming_links: {
      spotify: "https://open.spotify.com/track/5lseRs2qTrCz4BQkEN75kS",
      apple_music: APPLE_ALBUM,
      youtube_music: YT_ARTIST,
      bandcamp: "https://sonicacrylic.bandcamp.com/track/moments-away",
    },
  },
  {
    id: "masqeraduh",
    title: "Masqeraduh",
    artist: "Sonic Acrylic",
    file: "/audio/02-masqeraduh.mp3",
    duration_sec: 167,
    streaming_links: {
      spotify: "https://open.spotify.com/track/0K2V7lGRpdxClm7rnizUej",
      apple_music: APPLE_ALBUM,
      youtube_music: YT_ARTIST,
      bandcamp: "https://sonicacrylic.bandcamp.com/track/masqeraduh",
    },
  },
  {
    id: "black-eye",
    title: "Black Eye",
    artist: "Sonic Acrylic",
    file: "/audio/03-black-eye.mp3",
    duration_sec: 208,
    streaming_links: {
      spotify: "https://open.spotify.com/track/1uwgcoHRix6sdGsH7JiIsa",
      apple_music: APPLE_ALBUM,
      youtube_music: YT_ARTIST,
      bandcamp: "https://sonicacrylic.bandcamp.com/track/black-eye",
    },
  },
  {
    id: "disasteroid",
    title: "Disasteroid",
    artist: "Sonic Acrylic",
    file: "/audio/04-disasteroid.mp3",
    duration_sec: 180,
    streaming_links: {
      spotify: "https://open.spotify.com/track/4PFjmwE15VQDoIe7c4dL1M",
      apple_music: APPLE_ALBUM,
      youtube_music: YT_ARTIST,
      bandcamp: "https://sonicacrylic.bandcamp.com/track/disasteroid",
    },
  },
  {
    id: "been-around",
    title: "Been Around",
    artist: "Sonic Acrylic",
    file: "/audio/05-been-around.mp3",
    duration_sec: 221,
    streaming_links: {
      spotify: "https://open.spotify.com/track/4TfTDOGdkdFZMYhYaZgJPW",
      apple_music: APPLE_ALBUM,
      youtube_music: YT_ARTIST,
      bandcamp: "https://sonicacrylic.bandcamp.com/track/been-around-2",
    },
  },
  {
    id: "forever",
    title: "Forever",
    artist: "Sonic Acrylic",
    file: "/audio/06-forever.mp3",
    duration_sec: 207,
    streaming_links: {
      spotify: "https://open.spotify.com/track/1eEt3vW2gHsUBAbw6xN2zJ",
      apple_music: APPLE_ALBUM,
      youtube_music: YT_ARTIST,
      bandcamp: "https://sonicacrylic.bandcamp.com/track/forever",
    },
  },
  {
    id: "alternates",
    title: "Alternates",
    artist: "Sonic Acrylic",
    file: "/audio/07-alternates.mp3",
    duration_sec: 297,
    streaming_links: {
      spotify: "https://open.spotify.com/track/2o4xU1ycwHbPg9fQ3X56i7",
      apple_music: APPLE_ALBUM,
      youtube_music: YT_ARTIST,
      bandcamp: "https://sonicacrylic.bandcamp.com/track/alternates",
    },
  },
];
