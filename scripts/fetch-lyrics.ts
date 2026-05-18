/**
 * Fetch lyrics for every track in a cached catalog and cache them to
 * data/lyrics/<slug>.json.
 *
 * Usage:
 *   npm run lyrics -- "Phoebe Bridgers"           # single artist
 *   npm run lyrics -- --all                       # every cached catalog
 *   npm run lyrics -- "Pink Floyd" --force        # re-fetch
 *
 * Setup (one-time):
 *   1. Register at https://genius.com/api-clients (free)
 *   2. Copy the "Client Access Token"
 *   3. Add to .env.local:   GENIUS_ACCESS_TOKEN=your_token_here
 *
 * Strategy:
 *   - Read catalog from data/catalogs/<slug>.json
 *   - For each unique track title:
 *       1. Genius API search → pick best song match by primary_artist
 *       2. Fetch the Genius HTML page
 *       3. Extract lyrics from <div data-lyrics-container> blocks
 *   - Write data/lyrics/<slug>.json with { title -> { url, lyrics } } map
 *
 * Output is gitignored — it's denormalized API data, ~1-5KB per song,
 * ~30-100KB per artist, ~3-5MB across all 37 catalogs.
 *
 * Pacing: 1 req/sec (configurable). Genius rate-limits are loose for the
 * free tier but the HTML scrape pages are heavier; staying conservative
 * keeps us friendly. Expect ~30-60 min for a full bulk fetch.
 */

import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CATALOGS_DIR = join(ROOT, "data/catalogs");
const LYRICS_DIR = join(ROOT, "data/lyrics");

const REQUEST_SPACING_MS = 1_000;     // 1 req/s — Genius free tier is generous but HTML scrape is heavy
const MAX_RETRY_WAIT_MS = 15_000;
const MAX_RETRIES = 3;

const GENIUS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

type Track = { id: string; name: string };
type Album = { name: string; tracks: Track[] };
type Catalog = { artist: { id: string; name: string }; albums: Album[] };

type LyricEntry = {
  title: string;          // exact catalog title we searched for
  matched_title?: string; // what Genius returned (may differ in casing/punct)
  genius_id?: number;
  url?: string;
  lyrics?: string;
  status: "ok" | "no_match" | "scrape_failed" | "error";
  error?: string;
};

type LyricsFile = {
  source: "genius";
  artist: string;
  fetched_at: string;
  tracks: Record<string, LyricEntry>;   // keyed by exact catalog title
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

async function geniusApi(path: string, attempt = 0): Promise<unknown> {
  await pace();
  const url = `https://api.genius.com${path}`;
  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GENIUS_TOKEN}`,
      Accept: "application/json",
    },
  });
  if (r.status === 429 || r.status >= 500) {
    if (attempt >= MAX_RETRIES) throw new Error(`Genius API failed after ${MAX_RETRIES + 1} attempts: ${r.status}`);
    const wait = Math.min(MAX_RETRY_WAIT_MS, 1_000 * Math.pow(2, attempt));
    process.stdout.write(`    ${r.status} retrying in ${wait}ms\n`);
    await new Promise((res) => setTimeout(res, wait));
    return geniusApi(path, attempt + 1);
  }
  if (!r.ok) throw new Error(`Genius API ${r.status}: ${await r.text()}`);
  return r.json();
}

async function geniusHtml(url: string, attempt = 0): Promise<string> {
  await pace();
  const r = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (sonic-acrylic-games puzzle pipeline)",
      Accept: "text/html",
    },
  });
  if (r.status === 429 || r.status >= 500) {
    if (attempt >= MAX_RETRIES) throw new Error(`Genius HTML fetch failed after ${MAX_RETRIES + 1} attempts: ${r.status}`);
    const wait = Math.min(MAX_RETRY_WAIT_MS, 1_500 * Math.pow(2, attempt));
    process.stdout.write(`    ${r.status} retrying in ${wait}ms\n`);
    await new Promise((res) => setTimeout(res, wait));
    return geniusHtml(url, attempt + 1);
  }
  if (!r.ok) throw new Error(`Genius HTML ${r.status}: ${url}`);
  return r.text();
}

/**
 * Extract lyrics from a Genius song page. Modern Genius wraps lyrics in
 * <div data-lyrics-container="true"> blocks with <br> for newlines and
 * span/a tags for annotations.
 */
function extractLyrics(html: string): string | null {
  const matches = html.matchAll(/<div[^>]*data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/gi);
  const blocks: string[] = [];
  for (const m of matches) blocks.push(m[1]);
  if (blocks.length === 0) return null;
  const raw = blocks.join("\n");
  // Replace <br> with newlines, strip tags, decode entities
  const text = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/​/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text || null;
}

type SearchHit = {
  type: string;
  result: {
    id: number;
    title: string;
    url: string;
    primary_artist: { id: number; name: string };
  };
};
type SearchResp = { response: { hits: SearchHit[] } };

/**
 * Pick the best Genius search hit for an (artist, title) query.
 * Strategy: prefer hits whose primary_artist matches our artist (case-insensitive,
 * normalized). Fall back to the first song-type hit.
 */
function pickBestHit(hits: SearchHit[], artistName: string): SearchHit | null {
  const songHits = hits.filter((h) => h.type === "song");
  if (songHits.length === 0) return null;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const targetArtist = norm(artistName);
  // 1. Exact primary_artist match
  const exact = songHits.find((h) => norm(h.result.primary_artist.name) === targetArtist);
  if (exact) return exact;
  // 2. primary_artist contains the target (handles "Tom Petty" vs "Tom Petty and the Heartbreakers")
  const partial = songHits.find((h) => {
    const a = norm(h.result.primary_artist.name);
    return a.includes(targetArtist) || targetArtist.includes(a);
  });
  if (partial) return partial;
  // 3. First hit
  return songHits[0];
}

async function fetchOne(artistName: string, title: string): Promise<LyricEntry> {
  const q = `${artistName} ${title}`.replace(/\s+/g, " ").trim();
  try {
    const search = (await geniusApi(`/search?q=${encodeURIComponent(q)}`)) as SearchResp;
    const hit = pickBestHit(search.response.hits, artistName);
    if (!hit) {
      return { title, status: "no_match" };
    }
    const html = await geniusHtml(hit.result.url);
    const lyrics = extractLyrics(html);
    if (!lyrics) {
      return { title, matched_title: hit.result.title, genius_id: hit.result.id, url: hit.result.url, status: "scrape_failed" };
    }
    return {
      title,
      matched_title: hit.result.title,
      genius_id: hit.result.id,
      url: hit.result.url,
      lyrics,
      status: "ok",
    };
  } catch (e) {
    return { title, status: "error", error: (e as Error).message };
  }
}

/**
 * Build a deduplicated list of canonical track titles for an artist.
 * Strips parenthetical noise like "(Remastered)", "(Live)", etc.
 */
function uniqueTracks(catalog: Catalog): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const album of catalog.albums) {
    for (const t of album.tracks) {
      // Skip live/demo/remix/instrumental variants — we want the canonical song
      if (/\b(live|demo|rehearsal|remix|alternate|instrumental|outtake|session|edit|reprise|stereo|mono|remastered)\b/i.test(t.name)) {
        continue;
      }
      const clean = t.name.replace(/\s*\([^)]*\)\s*$/, "").trim();
      if (!clean) continue;
      const key = clean.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(clean);
    }
  }
  return out;
}

async function fetchArtist(slug: string, force = false): Promise<void> {
  const catalogPath = join(CATALOGS_DIR, `${slug}.json`);
  if (!existsSync(catalogPath)) {
    console.error(`! No catalog at ${catalogPath} - run \`npm run catalog -- "<name>"\` first.`);
    return;
  }
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;
  const artistName = catalog.artist.name;
  const outPath = join(LYRICS_DIR, `${slug}.json`);

  let existing: LyricsFile | null = null;
  if (existsSync(outPath)) {
    existing = JSON.parse(readFileSync(outPath, "utf8")) as LyricsFile;
  }

  const titles = uniqueTracks(catalog);
  const tracks: Record<string, LyricEntry> = existing?.tracks ?? {};
  const todo = force
    ? titles
    : titles.filter((t) => !tracks[t] || tracks[t].status === "error");

  console.log(`\n=== ${artistName} (${titles.length} unique tracks, ${todo.length} to fetch) ===`);
  if (todo.length === 0) {
    console.log("  - all tracks already cached");
    return;
  }

  let ok = 0, miss = 0, err = 0;
  for (let i = 0; i < todo.length; i++) {
    const title = todo[i];
    process.stdout.write(`  [${i + 1}/${todo.length}] ${title.slice(0, 60).padEnd(60)} `);
    const entry = await fetchOne(artistName, title);
    tracks[title] = entry;
    if (entry.status === "ok") {
      ok++;
      process.stdout.write(`ok ${entry.lyrics!.length} chars\n`);
    } else if (entry.status === "no_match") {
      miss++;
      process.stdout.write(`no match\n`);
    } else if (entry.status === "scrape_failed") {
      miss++;
      process.stdout.write(`scrape failed\n`);
    } else {
      err++;
      process.stdout.write(`error: ${entry.error?.slice(0, 50)}\n`);
    }
    // Save incrementally so a crash doesn't lose work
    if ((i + 1) % 10 === 0 || i === todo.length - 1) {
      const file: LyricsFile = {
        source: "genius",
        artist: artistName,
        fetched_at: new Date().toISOString(),
        tracks,
      };
      writeFileSync(outPath, JSON.stringify(file, null, 2));
    }
  }

  console.log(`  -> ${ok} ok, ${miss} missing, ${err} errors`);
  console.log(`  wrote ${outPath}`);
}

async function main() {
  if (!GENIUS_TOKEN) {
    console.error("GENIUS_ACCESS_TOKEN not set.");
    console.error("");
    console.error("Setup:");
    console.error("  1. Register at https://genius.com/api-clients (free, no review needed)");
    console.error("  2. Create a new API Client (any app name, e.g. 'sonic-acrylic-games')");
    console.error("  3. Copy the 'Client Access Token'");
    console.error("  4. Add to .env.local:");
    console.error("       GENIUS_ACCESS_TOKEN=your_token_here");
    console.error("  5. Re-run this script");
    process.exit(1);
  }

  mkdirSync(LYRICS_DIR, { recursive: true });

  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const all = args.includes("--all");
  const name = args.filter((a) => !a.startsWith("--")).join(" ").trim();

  if (all) {
    const slugs = readdirSync(CATALOGS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    console.log(`Fetching lyrics for ${slugs.length} artists...`);
    for (const slug of slugs) {
      try {
        await fetchArtist(slug, force);
      } catch (e) {
        console.error(`! ${slug}: ${(e as Error).message}`);
      }
    }
    console.log("\nDone.");
    return;
  }

  if (!name) {
    console.error('Usage: npm run lyrics -- "<Artist Name>" [--force]');
    console.error('       npm run lyrics -- --all [--force]');
    process.exit(1);
  }

  const slug = slugify(name);
  await fetchArtist(slug, force);
}

main().catch((e) => { console.error(e); process.exit(1); });
