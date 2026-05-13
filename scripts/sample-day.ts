/**
 * Sample the day's puzzle inputs: pick a decade (random) then 5 artists from
 * that decade (random), date-seeded so the same date always yields the same
 * lineup. Respects a 14-day artist cooldown against previously-seeded puzzles.
 *
 * Usage:
 *   npm run sample -- 2026-05-14
 *   npm run sample -- 2026-05-14 --range 14    # 14 consecutive days starting from the given date
 *
 * Output (JSON to stdout): one or more { date, decade, artists } objects.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const ARTISTS_PATH = join(ROOT, "data/artists.json");
const PUZZLES_DIR = join(ROOT, "data/puzzles");

const COOLDOWN_DAYS = 14;
const DECADES = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"] as const;
type Decade = (typeof DECADES)[number];

type ArtistPool = {
  [k: string]: string[] | { totals?: Record<string, number>; [k: string]: unknown };
};

// Mulberry32 PRNG, seeded by xmur3 hash — same scheme as lib/shuffle.ts.
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}
function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededRng(seed: string): () => number {
  return mulberry32(xmur3(seed)());
}
function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}
function pickN<T>(arr: readonly T[], n: number, rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, n);
}

function addDays(yyyyMmDd: string, n: number): string {
  const d = new Date(yyyyMmDd + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function loadArtistPool(): Record<Decade, string[]> {
  const raw = JSON.parse(readFileSync(ARTISTS_PATH, "utf8")) as ArtistPool;
  const out = {} as Record<Decade, string[]>;
  for (const d of DECADES) {
    const v = raw[d];
    if (!Array.isArray(v)) throw new Error(`artists.json missing list for ${d}`);
    out[d] = v as string[];
  }
  return out;
}

function loadRecentlyUsedArtists(beforeDate: string, withinDays: number): Set<string> {
  const used = new Set<string>();
  if (!existsSync(PUZZLES_DIR)) return used;
  for (const f of readdirSync(PUZZLES_DIR)) {
    if (!f.endsWith(".json") || f.startsWith(".") || f.startsWith("_")) continue;
    const d = f.replace(/\.json$/, "");
    if (d >= beforeDate) continue;                                  // not yet "the past"
    if (d < addDays(beforeDate, -withinDays)) continue;             // beyond cooldown window
    try {
      const data = JSON.parse(readFileSync(join(PUZZLES_DIR, f), "utf8")) as { lineup_artists?: string[] };
      for (const a of data.lineup_artists ?? []) used.add(a);
    } catch {}
  }
  return used;
}

type Lineup = { date: string; decade: Decade; artists: string[]; warnings?: string[] };

function sampleOneDay(
  date: string,
  pool: Record<Decade, string[]>,
  cooldown: Set<string>,
): Lineup {
  const rng = seededRng(date);
  const decade: Decade = pick(DECADES, rng);
  const all = pool[decade];
  const fresh = all.filter((a) => !cooldown.has(a));
  const warnings: string[] = [];

  let artists: string[];
  if (fresh.length >= 5) {
    artists = pickN(fresh, 5, rng);
  } else {
    // Cooldown drained this decade — fall back: top up with any from the decade.
    warnings.push(
      `Only ${fresh.length} non-cooldown artists in ${decade}; padding from the full ${decade} pool (cooldown ignored for top-up).`,
    );
    const padded = [...fresh, ...pickN(all.filter((a) => !fresh.includes(a)), 5 - fresh.length, rng)];
    artists = pickN(padded, 5, rng);
  }

  return { date, decade, artists, ...(warnings.length ? { warnings } : {}) };
}

function main() {
  const args = process.argv.slice(2);
  const startDate = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
  if (!startDate) {
    console.error("Usage: npm run sample -- YYYY-MM-DD [--range N]");
    process.exit(1);
  }
  const rangeIdx = args.indexOf("--range");
  const range = rangeIdx >= 0 ? Math.max(1, parseInt(args[rangeIdx + 1] ?? "1", 10)) : 1;

  const pool = loadArtistPool();
  const lineups: Lineup[] = [];

  for (let i = 0; i < range; i++) {
    const date = addDays(startDate, i);
    // Cooldown = artists from real past puzzles within COOLDOWN_DAYS + artists
    // we've already sampled in this run within COOLDOWN_DAYS.
    const cooldown = loadRecentlyUsedArtists(date, COOLDOWN_DAYS);
    for (const prev of lineups) {
      const daysAgo = Math.round(
        (new Date(date + "T12:00:00Z").getTime() - new Date(prev.date + "T12:00:00Z").getTime()) / 86400000,
      );
      if (daysAgo > 0 && daysAgo <= COOLDOWN_DAYS) for (const a of prev.artists) cooldown.add(a);
    }
    lineups.push(sampleOneDay(date, pool, cooldown));
  }

  console.log(JSON.stringify(range === 1 ? lineups[0] : lineups, null, 2));
}

main();
