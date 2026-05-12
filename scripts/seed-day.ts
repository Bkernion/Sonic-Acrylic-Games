import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback to .env
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { sql } from "../lib/db";
import { seededShuffle } from "../lib/shuffle";

type PuzzleFile = {
  date: string;
  edition_no: number;
  lineup_artists: string[];
  theme_pull_quote?: string;
  marginalia_quote?: string;
  connections_categories: { name: string; difficulty: 1|2|3|4; members: string[] }[];
};

function buildTiles(p: PuzzleFile): string[] {
  const all = p.connections_categories.flatMap((c) => c.members);
  if (all.length !== 16) {
    throw new Error(`Puzzle ${p.date}: expected 16 tiles, got ${all.length}`);
  }
  return seededShuffle(all, p.date);
}

async function seedOne(path: string) {
  const data = JSON.parse(readFileSync(path, "utf8")) as PuzzleFile;
  const tiles = buildTiles(data);
  await sql`
    INSERT INTO daily_puzzles
      (date, edition_no, lineup_artists, theme_pull_quote, marginalia_quote,
       connections_categories, connections_tiles)
    VALUES (
      ${data.date}, ${data.edition_no},
      ${JSON.stringify(data.lineup_artists)}::jsonb,
      ${data.theme_pull_quote ?? null},
      ${data.marginalia_quote ?? null},
      ${JSON.stringify(data.connections_categories)}::jsonb,
      ${JSON.stringify(tiles)}::jsonb
    )
    ON CONFLICT (date) DO UPDATE SET
      edition_no = EXCLUDED.edition_no,
      lineup_artists = EXCLUDED.lineup_artists,
      theme_pull_quote = EXCLUDED.theme_pull_quote,
      marginalia_quote = EXCLUDED.marginalia_quote,
      connections_categories = EXCLUDED.connections_categories,
      connections_tiles = EXCLUDED.connections_tiles
  `;
  console.log(`Seeded ${data.date} (edition ${data.edition_no}).`);
}

async function main() {
  const arg = process.argv[2];
  if (arg && arg !== "--all") {
    await seedOne(join(process.cwd(), "data/puzzles", `${arg}.json`));
    return;
  }
  const dir = join(process.cwd(), "data/puzzles");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith(".") && !f.startsWith("_")).sort()) {
    await seedOne(join(dir, f));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
