/**
 * Fetch one artist's full catalog from Deezer and cache it to
 * data/catalogs/<slug>.json.
 *
 * Usage:
 *   npm run catalog -- "Phoebe Bridgers"
 *   npm run catalog -- "The Allman Brothers Band" --id 86 --force
 *   npm run catalog -- "Some Artist" --force
 *
 * Deezer's public API needs no auth for catalog reads. Generous rate limits
 * (50 req / 5 s). The output shape matches what distill-catalog.ts expects
 * (kept compatible with the older Spotify-backed cache).
 *
 * We moved off Spotify on 2026-05-13 after Spotify locked Development Mode
 * access (one Client ID per developer + endpoint restrictions, see
 * https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security).
 */

import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CATALOGS_DIR = join(ROOT, "data/catalogs");

const REQUEST_SPACING_MS = 120;     // ~8 req/s, well under Deezer's 10/s steady-state ceiling
const MAX_RETRY_WAIT_MS = 8_000;
const MAX_RETRIES = 3;

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
  release_date: string;
  release_year: number;
  album_type: string;       // album | single | ep | compilation
  total_tracks: number;
  tracks: Track[];
};

type Catalog = {
  source: "deezer";
  artist: Artist;
  fetched_at: string;
  albums: Album[];
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let lastRequestAt = 0;
async function pace() {
  const since = Date.now() - lastRequestAt;
  if (since < REQUEST_SPACING_MS) {
    await new Promise((res) => setTimeout(res, REQUEST_SPACING_MS - since));
  }
  lastRequestAt = Date.now();
}

async function deezerGet<T>(url: string, attempt = 0): Promise<T> {
  await pace();
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (r.status === 429 || r.status >= 500) {
    if (attempt >= MAX_RETRIES) throw new Error(`Failed after ${MAX_RETRIES + 1} attempts: ${r.status} ${url}`);
    const wait = Math.min(MAX_RETRY_WAIT_MS, 500 * Math.pow(2, attempt));
    process.stdout.write(`    ${r.status} retrying in ${wait}ms (attempt ${attempt + 1}/${MAX_RETRIES})\n`);
    await new Promise((res) => setTimeout(res, wait));
    return deezerGet<T>(url, attempt + 1);
  }
  if (!r.ok) throw new Error(`GET ${url} → ${r.status} ${await r.text()}`);
  const data = await r.json() as T & { error?: { code: number; message: string } };
  // Deezer returns 200 with { error: { code, message } } for some errors (e.g. quota)
  if ((data as { error?: unknown }).error) {
    const e = (data as { error: { code: number; message: string } }).error;
    if (e.code === 4 && attempt < MAX_RETRIES) {                  // quota exceeded
      const wait = 5_000 + 2_000 * attempt;
      process.stdout.write(`    quota hit, sleeping ${wait}ms (attempt ${attempt + 1}/${MAX_RETRIES})\n`);
      await new Promise((res) => setTimeout(res, wait));
      return deezerGet<T>(url, attempt + 1);
    }
    throw new Error(`Deezer error ${e.code}: ${e.message} (${url})`);
  }
  return data;
}

type DeezerSearchArtist = {
  id: number;
  name: string;
  nb_album: number;
  nb_fan: number;
};
type DeezerArtist = {
  id: number;
  name: string;
  nb_album: number;
  nb_fan: number;
};
type DeezerAlbumStub = {
  id: number;
  title: string;
  release_date: string;        // YYYY-MM-DD or sometimes YYYY
  record_type: string;         // album | single | ep | compilation
};
type DeezerTrack = {
  id: number;
  title: string;
  track_position: number;
  duration: number;            // seconds
  explicit_lyrics: boolean;
};
type DeezerListResp<T> = {
  data: T[];
  total: number;
  next?: string;
};

async function searchArtist(name: string): Promise<Artist> {
  const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=10`;
  const data = await deezerGet<DeezerListResp<DeezerSearchArtist>>(url);
  if (!data.data?.length) throw new Error(`No Deezer artist found for "${name}"`);
  // Prefer an exact name match (case-insensitive); fall back to the highest-fanned result.
  const exact = data.data.find((a) => a.name.toLowerCase() === name.toLowerCase());
  const chosen = exact ?? data.data.sort((x, y) => (y.nb_fan ?? 0) - (x.nb_fan ?? 0))[0];
  return { id: String(chosen.id), name: chosen.name, popularity: chosen.nb_fan };
}

async function fetchArtistById(id: string): Promise<Artist> {
  const data = await deezerGet<DeezerArtist>(`https://api.deezer.com/artist/${id}`);
  return { id: String(data.id), name: data.name, popularity: data.nb_fan };
}

async function fetchAllAlbums(artistId: string): Promise<DeezerAlbumStub[]> {
  const out: DeezerAlbumStub[] = [];
  let next: string | undefined = `https://api.deezer.com/artist/${artistId}/albums?limit=100&index=0`;
  while (next) {
    const page = await deezerGet<DeezerListResp<DeezerAlbumStub>>(next);
    out.push(...page.data);
    next = page.next;
  }
  return out;
}

async function fetchAlbumTracks(albumId: string): Promise<Track[]> {
  const out: Track[] = [];
  let next: string | undefined = `https://api.deezer.com/album/${albumId}/tracks?limit=100&index=0`;
  while (next) {
    const page = await deezerGet<DeezerListResp<DeezerTrack>>(next);
    for (const t of page.data) {
      out.push({
        id: String(t.id),
        name: t.title,
        track_number: t.track_position,
        duration_ms: (t.duration ?? 0) * 1000,
        explicit: t.explicit_lyrics,
      });
    }
    next = page.next;
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const idIdx = args.indexOf("--id");
  const explicitId = idIdx >= 0 ? args[idIdx + 1] : undefined;
  const name = args
    .filter((a, i) => !a.startsWith("--") && (idIdx < 0 || i !== idIdx + 1))
    .join(" ")
    .trim();
  if (!name && !explicitId) {
    console.error('Usage: npm run catalog -- "<Artist Name>" [--id <deezer_id>] [--force]');
    process.exit(1);
  }

  mkdirSync(CATALOGS_DIR, { recursive: true });
  const slug = name ? slugify(name) : `deezer-${explicitId}`;
  const outPath = join(CATALOGS_DIR, `${slug}.json`);

  if (existsSync(outPath) && !force) {
    const existing = JSON.parse(readFileSync(outPath, "utf8")) as Catalog;
    console.log(
      `Already cached: ${existing.artist.name} (${existing.albums.length} releases, fetched ${existing.fetched_at}, source=${existing.source ?? "spotify"}).`,
    );
    console.log("Re-fetch with --force.");
    return;
  }

  let artist: Artist;
  if (explicitId) {
    console.log(`Fetching artist by Deezer id ${explicitId}…`);
    artist = await fetchArtistById(explicitId);
  } else {
    console.log(`Searching Deezer for "${name}"…`);
    artist = await searchArtist(name);
  }
  console.log(`  ✓ ${artist.name} (id ${artist.id}, fans ${artist.popularity ?? "?"})`);

  console.log("Fetching albums…");
  const albumStubs = await fetchAllAlbums(artist.id);
  console.log(`  ✓ ${albumStubs.length} releases`);

  const albums: Album[] = [];
  let failed = 0;
  for (const a of albumStubs) {
    try {
      const tracks = await fetchAlbumTracks(String(a.id));
      const year = Number(a.release_date.slice(0, 4));
      albums.push({
        id: String(a.id),
        name: a.title,
        release_date: a.release_date,
        release_year: Number.isFinite(year) ? year : 0,
        album_type: a.record_type,
        total_tracks: tracks.length,
        tracks,
      });
      process.stdout.write(`  · ${a.title} (${a.release_date.slice(0, 4)}, ${tracks.length} tracks)\n`);
    } catch (e) {
      failed++;
      process.stdout.write(`  ! skipped ${a.title} (${a.release_date.slice(0, 4)}): ${(e as Error).message.split("\n")[0]}\n`);
    }
  }
  if (failed) console.warn(`  ${failed} release(s) failed and were skipped.`);

  const catalog: Catalog = {
    source: "deezer",
    artist,
    fetched_at: new Date().toISOString(),
    albums: albums.sort((x, y) => x.release_year - y.release_year),
  };
  writeFileSync(outPath, JSON.stringify(catalog, null, 2));

  const tracksTotal = albums.reduce((n, a) => n + a.tracks.length, 0);
  console.log(`\n✓ Wrote ${outPath}`);
  console.log(`  ${albums.length} releases · ${tracksTotal} tracks · ${(JSON.stringify(catalog).length / 1024).toFixed(1)} KB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
