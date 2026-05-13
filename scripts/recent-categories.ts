/**
 * Print every category name shipped in the last N days, so the puzzle coach
 * can see what's stale before proposing new puzzles.
 *
 * Usage:
 *   npm run history              # default: last 14 days
 *   npm run history -- 30        # last 30 days
 *   npm run history -- 30 --json # machine-readable
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PUZZLES_DIR = join(ROOT, "data/puzzles");
const DEFAULT_DAYS = 14;

const args = process.argv.slice(2);
const days = (() => {
  const n = args.map(Number).find((v) => Number.isFinite(v));
  return n ?? DEFAULT_DAYS;
})();
const json = args.includes("--json");

const today = new Date().toISOString().slice(0, 10);
const cutoff = (() => {
  const d = new Date(today + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
})();

type PuzzleFile = {
  date: string;
  edition_no: number;
  lineup_artists: string[];
  connections_categories: { name: string; difficulty: 1 | 2 | 3 | 4; members: string[] }[];
};

type Row = {
  date: string;
  edition: number;
  difficulty: number;
  name: string;
  lineup: string[];
};

const rows: Row[] = [];

if (existsSync(PUZZLES_DIR)) {
  for (const f of readdirSync(PUZZLES_DIR).sort().reverse()) {
    if (!f.endsWith(".json") || f.startsWith(".") || f.startsWith("_")) continue;
    const date = f.replace(/\.json$/, "");
    if (date < cutoff) continue;
    if (date > today) continue;
    try {
      const data = JSON.parse(readFileSync(join(PUZZLES_DIR, f), "utf8")) as PuzzleFile;
      for (const c of data.connections_categories ?? []) {
        rows.push({
          date,
          edition: data.edition_no,
          difficulty: c.difficulty,
          name: c.name,
          lineup: data.lineup_artists,
        });
      }
    } catch {}
  }
}

if (json) {
  console.log(JSON.stringify({ days, cutoff, today, rows }, null, 2));
} else {
  console.log(`Categories shipped between ${cutoff} and ${today} (${rows.length} across ${new Set(rows.map((r) => r.date)).size} days):\n`);
  let lastDate = "";
  for (const r of rows) {
    if (r.date !== lastDate) {
      console.log(`\n${r.date} (ed.${r.edition}) — ${r.lineup.join(" · ")}`);
      lastDate = r.date;
    }
    console.log(`  [${r.difficulty}] ${r.name}`);
  }
  console.log("");
}
