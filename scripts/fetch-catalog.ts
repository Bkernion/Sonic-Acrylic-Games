/**
 * Fetch one artist's full Spotify catalog and cache it to data/catalogs/<slug>.json.
 *
 * Usage:
 *   npm run catalog -- "Phoebe Bridgers"
 *   npm run catalog -- "The National" --force   # re-fetch even if cached
 *
 * The cached JSON contains:
 *   - artist: { id, name, genres, popularity }
 *   - albums: [{ id, name, release_date, release_year, album_type, total_tracks, tracks: [...] }, ...]
 *
 * Uses Spotify's Client Credentials flow. The artist's "top tracks" endpoint
 * returns 403 for newly-created apps (a late-2024 Spotify policy change), so we
 * walk albums → tracks instead, which gives a richer catalog anyway.
 */

import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CATALOGS_DIR = join(ROOT, "data/catalogs");

type Artist = {
  id: string;
  name: string;
  genres?: string[];
  popularity?: number;
};

type Track = {
  id: string;
  name: string;
  track_number: number;
  duration_ms: number;
  explicit?: boolean;
};

type Album = {
  id: string;
  name: string;
  release_date: string;     // YYYY-MM-DD or YYYY-MM or YYYY
  release_year: number;
  album_type: string;       // album | single | compilation
  total_tracks: number;
  tracks: Track[];
};

type Catalog = {
  artist: Artist;
  fetched_at: string;
  albums: Album[];
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")        // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getToken(): Promise<string> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET missing from .env.local");
  }
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!r.ok) throw new Error(`Token request failed: ${r.status} ${await r.text()}`);
  return (await r.json()).access_token;
}

const REQUEST_SPACING_MS = 350;     // pre-emptive pacing — cheaper than retries
const MAX_RETRY_WAIT_MS = 8_000;    // cap Spotify's Retry-After hint
const MAX_RETRIES = 2;

let lastRequestAt = 0;
async function pace() {
  const since = Date.now() - lastRequestAt;
  if (since < REQUEST_SPACING_MS) {
    await new Promise((res) => setTimeout(res, REQUEST_SPACING_MS - since));
  }
  lastRequestAt = Date.now();
}

async function spotifyGet<T>(token: string, url: string, attempt = 0): Promise<T> {
  await pace();
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (r.status === 429) {
    if (attempt >= MAX_RETRIES) throw new Error(`Rate-limited after ${MAX_RETRIES + 1} attempts on ${url}`);
    const hint = Number(r.headers.get("Retry-After") ?? "1") * 1000;
    const wait = Math.min(hint, MAX_RETRY_WAIT_MS);
    process.stdout.write(`    rate-limited, sleeping ${wait}ms (attempt ${attempt + 1}/${MAX_RETRIES})\n`);
    await new Promise((res) => setTimeout(res, wait));
    return spotifyGet<T>(token, url, attempt + 1);
  }
  if (!r.ok) throw new Error(`GET ${url} → ${r.status} ${await r.text()}`);
  return r.json() as Promise<T>;
}

async function searchArtist(token: string, name: string): Promise<Artist> {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(`artist:"${name}"`)}&type=artist&limit=5&market=US`;
  type SearchResp = { artists: { items: (Artist & { genres: string[]; popularity: number })[] } };
  const data = await spotifyGet<SearchResp>(token, url);
  if (!data.artists?.items?.length) throw new Error(`No Spotify artist found for "${name}"`);
  // Prefer exact name match (case-insensitive); otherwise take first result.
  const exact = data.artists.items.find((a) => a.name.toLowerCase() === name.toLowerCase());
  const chosen = exact ?? data.artists.items[0];
  return {
    id: chosen.id,
    name: chosen.name,
    genres: chosen.genres,
    popularity: chosen.popularity,
  };
}

async function fetchAllAlbums(
  token: string,
  artistId: string,
): Promise<{ id: string; name: string; release_date: string; album_type: string; total_tracks: number }[]> {
  // Studio albums and singles only — skip compilations and "appears on".
  type AlbumsPage = {
    items: { id: string; name: string; release_date: string; album_type: string; total_tracks: number }[];
    next: string | null;
  };
  const all: AlbumsPage["items"] = [];
  let next: string | null =
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=10&market=US`;
  while (next) {
    const page: AlbumsPage = await spotifyGet<AlbumsPage>(token, next);
    all.push(...page.items);
    next = page.next;
  }
  return all;
}

async function fetchAlbumTracks(token: string, albumId: string): Promise<Track[]> {
  type TracksPage = {
    items: { id: string; name: string; track_number: number; duration_ms: number; explicit: boolean }[];
    next: string | null;
  };
  const all: TracksPage["items"] = [];
  let next: string | null = `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=20&market=US`;
  while (next) {
    const page: TracksPage = await spotifyGet<TracksPage>(token, next);
    all.push(...page.items);
    next = page.next;
  }
  return all.map((t) => ({
    id: t.id,
    name: t.name,
    track_number: t.track_number,
    duration_ms: t.duration_ms,
    explicit: t.explicit,
  }));
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const name = args.filter((a) => !a.startsWith("--")).join(" ").trim();
  if (!name) {
    console.error("Usage: npm run catalog -- \"<Artist Name>\" [--force]");
    process.exit(1);
  }

  mkdirSync(CATALOGS_DIR, { recursive: true });
  const slug = slugify(name);
  const outPath = join(CATALOGS_DIR, `${slug}.json`);

  if (existsSync(outPath) && !force) {
    const existing = JSON.parse(readFileSync(outPath, "utf8")) as Catalog;
    console.log(`Already cached: ${existing.artist.name} (${existing.albums.length} albums, fetched ${existing.fetched_at}).`);
    console.log(`Re-fetch with --force.`);
    return;
  }

  const token = await getToken();
  console.log(`Searching for "${name}"…`);
  const artist = await searchArtist(token, name);
  console.log(`  ✓ ${artist.name} (id ${artist.id}, popularity ${artist.popularity ?? "?"}/100)`);
  if (artist.genres?.length) console.log(`  genres: ${artist.genres.slice(0, 5).join(", ")}`);

  console.log(`Fetching albums…`);
  const albumStubs = await fetchAllAlbums(token, artist.id);
  console.log(`  ✓ ${albumStubs.length} albums + singles`);

  const albums: Album[] = [];
  let failedAlbums = 0;
  for (const a of albumStubs) {
    try {
      const tracks = await fetchAlbumTracks(token, a.id);
      const year = Number(a.release_date.slice(0, 4));
      albums.push({
        id: a.id,
        name: a.name,
        release_date: a.release_date,
        release_year: Number.isFinite(year) ? year : 0,
        album_type: a.album_type,
        total_tracks: a.total_tracks,
        tracks,
      });
      process.stdout.write(`  · ${a.name} (${a.release_date.slice(0, 4)}, ${tracks.length} tracks)\n`);
    } catch (e) {
      failedAlbums++;
      process.stdout.write(`  ! skipped ${a.name} (${a.release_date.slice(0, 4)}): ${(e as Error).message.split("\n")[0]}\n`);
    }
  }
  if (failedAlbums) {
    console.warn(`  ${failedAlbums} album(s) failed and were skipped. Re-run with --force to retry.`);
  }

  const catalog: Catalog = {
    artist,
    fetched_at: new Date().toISOString(),
    albums: albums.sort((x, y) => x.release_year - y.release_year),
  };
  writeFileSync(outPath, JSON.stringify(catalog, null, 2));

  const tracksTotal = albums.reduce((n, a) => n + a.tracks.length, 0);
  console.log(`\n✓ Wrote ${outPath}`);
  console.log(`  ${albums.length} albums · ${tracksTotal} tracks · ${(JSON.stringify(catalog).length / 1024).toFixed(1)} KB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
