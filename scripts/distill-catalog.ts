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

const cat = JSON.parse(readFileSync(path, "utf8")) as Catalog;
const out = {
  artist: cat.artist.name,
  genres: cat.artist.genres ?? [],
  albums: cat.albums
    .filter((a) => a.album_type === "album")     // skip singles + EPs for puzzle proposing
    .sort((a, b) => a.release_year - b.release_year)
    .map((a) => ({
      name: a.name,
      year: a.release_year,
      tracks: a.tracks.map((t) => ({ n: t.track_number, name: t.name })),
    })),
  singles_count: cat.albums.filter((a) => a.album_type === "single").length,
};

console.log(JSON.stringify(out, null, 2));
