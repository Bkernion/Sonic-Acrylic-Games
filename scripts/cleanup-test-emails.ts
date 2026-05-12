import { config } from "dotenv";
config({ path: ".env.local" });
config();
import pg from "pg";

async function main() {
  const c = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const r = await c.query(
    "DELETE FROM email_captures WHERE email LIKE 'playwright-test-%@example.com'"
  );
  console.log(`Deleted ${r.rowCount} test captures.`);
  await c.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
