import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback to .env
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const dir = join(process.cwd(), "db/migrations");
const files = readdirSync(dir).filter((f) => /^\d.*\.sql$/.test(f)).sort();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env.local and re-run.");
    process.exit(1);
  }
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false, checkServerIdentity: () => undefined } : undefined,
  });
  await client.connect();
  for (const f of files) {
    const text = readFileSync(join(dir, f), "utf8");
    console.log(`Running ${f}`);
    await client.query(text);
  }
  await client.end();
  console.log("Migrations complete.");
}

main().catch((e) => { console.error(e); process.exit(1); });
