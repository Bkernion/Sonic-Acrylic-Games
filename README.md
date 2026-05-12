# Sonic Acrylic Games

A daily word-and-music puzzle from Sonic Acrylic. v0 ships a single Connections-style game as a lead magnet at https://games.sonicacrylic.com.

## Stack

- Next.js 16 (App Router, Turbopack) — TypeScript
- Tailwind CSS v4
- `@neondatabase/serverless` for runtime DB queries (`pg` for migrations)
- Vitest + React Testing Library — unit tests
- Playwright — E2E (iPhone 13 viewport, Chromium)
- Hosted on Vercel

## Develop

```bash
npm install
cp .env.example .env.local  # fill in DATABASE_URL (Neon pooled connection string)
npm run db:migrate
npm run seed:all
rm -rf .next/dev  # workaround for Turbopack RocksDB crash on apostrophe in path
npm run dev
```

Open http://localhost:3000.

## Test

```bash
npm test           # vitest unit tests
npm run test:e2e   # playwright e2e (auto-boots dev server)
```

## Add a puzzle

1. Create `data/puzzles/YYYY-MM-DD.json` matching the schema (see `scripts/seed-day.ts` for the type). 5 lineup artists, 4 categories of 4 song titles each.
2. Run `npm run seed:day -- YYYY-MM-DD` to upsert just that day, or `npm run seed:all` to upsert every file under `data/puzzles/`.

The script auto-shuffles the 16 tiles deterministically by date.

## Deploy

Production runs on Vercel. The main branch deploys to preview; `vercel --prod` deploys to production. The database is Neon.

Custom domain: `games.sonicacrylic.com` (CNAME from Wix → `cname.vercel-dns.com`).

## Project structure

```
app/                Next.js App Router
  api/              5 API routes (puzzle/check/streak/capture/event)
  connections/      Connections game page (client)
  page.tsx          Home (server)
components/
  brand/            AppBar, StreakChip, NowPlaying (Provider + Full + Mini + Icons)
  connections/      Grid, Tile, Mistakes, ActionRow, WinModal
  home/             Hero, GameCard, SideB
lib/                Pure helpers: db, date, device, shuffle, connections, audioQueue, tracks
data/puzzles/       Hand-curated JSON, one file per day
db/migrations/      SQL migrations (one .sql file each)
scripts/            migrate, seed-day, cleanup-test-emails
tests/
  unit/             Vitest
  e2e/              Playwright
docs/superpowers/   Specs and implementation plans
```

## References

- Design spec: `docs/superpowers/specs/2026-05-11-sonic-acrylic-games-v0-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-11-sonic-acrylic-games-v0.md`
- Original design handoff: `design_handoff_sonic_acrylic_games/`
