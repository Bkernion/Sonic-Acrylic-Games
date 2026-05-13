/**
 * Print a slim view of a cached Spotify catalog — just track name, album,
 * year — so it's cheap to read into a chat context for puzzle proposing.
 *
 * Usage:
 *   npm run distill -- "Phoebe Bridgers"
 *   npm run distill -- phoebe-bridgers
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CATALOGS_DIR = join(ROOT, "data/catalogs");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Track = { name: string; track_number: number; duration_ms: number };
type Album = {
  name: string;
  release_year: number;
  album_type: string;
  total_tracks: number;
  tracks: Track[];
};
type Catalog = {
  artist: { id: string; name: string; genres?: string[] };
  albums: Album[];
};

const arg = process.argv.slice(2).join(" ").trim();
if (!arg) {
  console.error('Usage: npm run distill -- "<artist name or slug>"');
  process.exit(1);
}

const slug = arg.includes("-") && !arg.includes(" ") ? arg : slugify(arg);
const path = join(CATALOGS_DIR, `${slug}.json`);
if (!existsSync(path)) {
  console.error(`No cached catalog at ${path}. Run: npm run catalog -- "${arg}"`);
  process.exit(2);
}

/** Strip a re-release / deluxe / remaster qualifier off an album name so we can
 *  group different versions of the same record together. "Led Zeppelin II
 *  (Remaster)" and "Led Zeppelin II (Deluxe Edition)" → "Led Zeppelin II". */
function canonicalAlbumName(n: string): string {
  return n
    .replace(/\s*\([^)]*(?:Remaster|Edition|Anniversary|Expanded|Deluxe|Special|Bonus|Reissue|Mono|Stereo|Reissued|Re-Issue|Re-?Mastered)[^)]*\)\s*/gi, "")
    .replace(/\s*-\s*(?:Remaster(?:ed)?|Deluxe|Bonus|Re-?Issue|Reissue|Anniversary|Expanded).*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip "- Remaster", "(2006 Remaster)", "(Live)", "(Demo)", etc. off a track
 *  name so the puzzle tile shows the canonical title. */
function canonicalTrackName(n: string): string {
  return n
    .replace(/\s*-\s*(?:\d{4}\s+)?(?:Remaster(?:ed)?|Mono|Stereo|Mix|Single Version|Album Version|Edit|Live|Demo|Backing Track|Rough Mix.*|Alternative.*|Original Take.*|Bonus Track|Outtake|Reissue).*$/i, "")
    .replace(/\s*\((?:\d{4}\s+)?(?:Remaster(?:ed)?|Mono|Stereo|Mix \d+|Single Version|Album Version|Edit|Live|Demo|Bonus Track|Alternate.*|Original.*|Reissue)[^)]*\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

const cat = JSON.parse(readFileSync(path, "utf8")) as Catalog;

// 1. Filter to studio albums (skip singles + compilations).
// 2. Group by canonical album name and keep the earliest-year version that has
//    the most tracks, so deluxe / anniversary editions collapse into one.
// 3. Within each kept album, dedupe tracks by canonical name (skip remasters
//    + live + demos when a clean version exists).
type AlbumKey = string;
const byCanon = new Map<AlbumKey, Album>();
for (const a of cat.albums) {
  if (a.album_type !== "album") continue;
  const key = canonicalAlbumName(a.name).toLowerCase();
  const existing = byCanon.get(key);
  if (!existing) {
    byCanon.set(key, a);
    continue;
  }
  // Prefer the version with a cleaner name (shorter ⇒ less suffix);
  // tiebreak on more tracks.
  const aLen = a.name.length;
  const eLen = existing.name.length;
  if (aLen < eLen || (aLen === eLen && a.tracks.length > existing.tracks.length)) {
    byCanon.set(key, a);
  }
}

const albums = [...byCanon.values()]
  .map((a) => {
    // Within an album, dedupe tracks by canonical name. Skip rough mixes,
    // demos, live, alt takes — keep the cleanest version of each title.
    const seen = new Set<string>();
    const tracks: { n: number; name: string }[] = [];
    for (const t of a.tracks) {
      const canon = canonicalTrackName(t.name);
      if (seen.has(canon.toLowerCase())) continue;
      // Skip tracks where the canonical name is empty (e.g. "(Live)" alone)
      if (!canon) continue;
      seen.add(canon.toLowerCase());
      tracks.push({ n: t.track_number, name: canon });
    }
    return {
      name: canonicalAlbumName(a.name),
      year: a.release_year,
      tracks,
    };
  })
  .sort((a, b) => a.year - b.year);

const out = {
  artist: cat.artist.name,
  genres: cat.artist.genres ?? [],
  albums,
  singles_count: cat.albums.filter((a) => a.album_type === "single").length,
};

console.log(JSON.stringify(out, null, 2));
