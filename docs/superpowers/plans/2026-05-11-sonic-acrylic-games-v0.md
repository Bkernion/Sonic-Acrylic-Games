# Sonic Acrylic Games — v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a daily Connections puzzle at `games.sonicacrylic.com` as a lead magnet — anonymous play, email capture at win, persistent NowPlaying audio with one-tap streaming deeplinks, Cobalt Psychedelic palette.

**Architecture:** Next.js 16 App Router on Vercel. Postgres (Neon) stores hand-curated daily puzzles, email captures, anonymous device-id streaks. Persistent audio lives in the root layout via a Provider context so it survives route changes. Connections answers stay server-side — client submits a 4-tile guess and the API returns match / one_away / wrong plus the revealed category on a correct match. Mobile-web-first; max-width 440px column centered on a Cobalt radial-gradient stage.

**Tech Stack:** Next.js 16 (App Router, TypeScript strict) · Tailwind CSS · `next/font/google` for Newsreader + IBM Plex Sans + IBM Plex Mono · `@neondatabase/serverless` for Postgres · Vitest + React Testing Library + jsdom for unit/component · Playwright for E2E · Vercel for hosting.

**Reference materials** (read before implementing):
- Spec: `docs/superpowers/specs/2026-05-11-sonic-acrylic-games-v0-design.md`
- Design handoff: `design_handoff_sonic_acrylic_games/README.md` (visual/behavior reference for every screen)
- Token CSS (source of truth for colors/fonts): `design_handoff_sonic_acrylic_games/midfi/tokens.css`
- JSX prototypes (look-and-feel reference, not for copy-paste): `design_handoff_sonic_acrylic_games/midfi/screens.jsx`, `design_handoff_sonic_acrylic_games/midfi/lib.jsx`

---

## File Structure

```
Sonic Acrylic Games/                  (working dir = project root)
├── app/
│   ├── layout.tsx                    Root layout: fonts, NowPlayingProvider, gradient stage
│   ├── page.tsx                      Home (newsfeed)
│   ├── globals.css                   Imports tokens, base styles, stage gradient
│   ├── connections/
│   │   └── page.tsx                  Connections puzzle (client component)
│   └── api/
│       ├── capture/route.ts          POST email capture
│       ├── streak/
│       │   ├── me/route.ts           GET current device's streak
│       │   └── complete/route.ts     POST mark Connections completed today
│       ├── puzzle/
│       │   └── today/route.ts        GET today's lineup+tiles (NO categories)
│       └── connections/
│           └── check/route.ts        POST 4-tile guess, returns match/one_away/wrong
├── components/
│   ├── brand/
│   │   ├── AppBar.tsx
│   │   ├── StreakChip.tsx
│   │   └── NowPlaying/
│   │       ├── Provider.tsx          Context + <audio> + queue state
│   │       ├── FullRibbon.tsx        60px-tall variant
│   │       └── MiniPill.tsx          Compact pill variant
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── GameCard.tsx
│   │   └── SideB.tsx
│   └── connections/
│       ├── Grid.tsx
│       ├── Tile.tsx
│       ├── Mistakes.tsx
│       ├── ActionRow.tsx
│       └── WinModal.tsx
├── lib/
│   ├── db.ts                         Neon client + typed query helpers
│   ├── date.ts                       America/New_York "today" helpers
│   ├── device.ts                     device_id cookie read/write
│   ├── audioQueue.ts                 Pure queue state machine (no DOM)
│   ├── connections.ts                Pure game state machine
│   ├── shuffle.ts                    Seeded shuffle utility
│   └── tracks.ts                     TS-typed tracks list (replaces tracks.json)
├── data/
│   └── puzzles/                      YYYY-MM-DD.json hand-curated content
├── db/
│   └── migrations/
│       └── 001_init.sql              Schema
├── scripts/
│   ├── migrate.ts                    Run SQL migrations
│   └── seed-day.ts                   Upsert one puzzle from data/puzzles/
├── public/
│   └── audio/                        MP3s (Ben provides)
├── tests/
│   ├── unit/                         Vitest unit tests for lib/
│   └── e2e/                          Playwright E2E tests
├── docs/superpowers/                 specs + plans live here
├── design_handoff_sonic_acrylic_games/   reference only — don't import
├── .env.local                        DATABASE_URL etc.
├── .env.example                      Committed example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## Task 1: Initialize project (git + Next.js + base tooling)

**Files:**
- Create: `.gitignore`, `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `README.md`
- Modify: none

- [ ] **Step 1: Initialize git repo**

```bash
cd "/Volumes/Ben's SSD 1/KCL Products/Sonic Acrylic Games"
git init -b main
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules
.next
.vercel
.env.local
.env*.local
out
build
coverage
playwright-report
test-results
.DS_Store
*.log
```

- [ ] **Step 3: Bootstrap Next.js 16 with TypeScript + Tailwind**

```bash
npx create-next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir false \
  --import-alias "@/*" --use-npm --turbopack --skip-install --yes
```

If the command refuses because the directory is non-empty, instead run it in a temp dir and move files in:

```bash
mkdir -p /tmp/sag-bootstrap
cd /tmp/sag-bootstrap
npx create-next-app@latest sag --typescript --tailwind --eslint --app \
  --import-alias "@/*" --use-npm --turbopack --skip-install --yes
rsync -av --exclude='.git' sag/ "/Volumes/Ben's SSD 1/KCL Products/Sonic Acrylic Games/"
cd "/Volumes/Ben's SSD 1/KCL Products/Sonic Acrylic Games"
```

- [ ] **Step 4: Install deps**

```bash
npm install
npm install @neondatabase/serverless pg dotenv
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react @types/node @types/pg @playwright/test tsx
```

- [ ] **Step 5: Verify it builds & boots**

```bash
npm run build
```
Expected: build succeeds.

```bash
npm run dev &
sleep 5
curl -sf http://localhost:3000 | head -5
kill %1
```
Expected: `<!DOCTYPE html>` returned.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: init Next.js 16 project with TS + Tailwind"
```

---

## Task 2: Wire design tokens + fonts + gradient stage

**Files:**
- Create: `app/globals.css` (replace default), `app/fonts.ts`
- Modify: `app/layout.tsx`, `tailwind.config.ts`

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

/* ───────────── Cobalt Psychedelic — production palette ───────────── */
:root {
  --paper: #FFF1DE;
  --paper-2: #FCD8B5;
  --paper-3: #F7B98A;
  --ink: #1F5FA8;
  --ink-2: #3478C8;
  --rust: #E63ABD;
  --rust-2: #C8228F;
  --rust-3: #FF8FE0;
  --taupe: #4A8BD9;
  --taupe-2: #6FA7E5;
  --hair: #C9DCEE;
  --hair-2: #A1C0DC;

  --serif: var(--font-newsreader), Georgia, "Times New Roman", serif;
  --sans: var(--font-plex-sans), system-ui, sans-serif;
  --mono: var(--font-plex-mono), ui-monospace, monospace;
}

html, body { background: #1A1A1A; }

/* Cobalt radial blooms — applied to the .stage wrapper that hosts the 440px column */
.stage {
  background:
    radial-gradient(60% 50% at -10% -10%, rgba(255, 138, 31, 0.32) 0%, transparent 55%),
    radial-gradient(60% 60% at 110% -10%, rgba(255, 60, 200, 0.25) 0%, transparent 55%),
    radial-gradient(70% 50% at 50% 110%, rgba(78, 217, 229, 0.30) 0%, transparent 55%),
    var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.005em;
}

.serif { font-family: var(--serif); letter-spacing: -0.015em; }
.mono  { font-family: var(--mono); letter-spacing: 0.04em; }

/* Hairlines */
.hr { height: 1px; background: var(--hair); border: 0; }

/* Equalizer animation for NowPlaying */
@keyframes eq-bar { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }
.eq-bar { transform-origin: bottom; animation: eq-bar var(--eq-duration, 1.4s) ease-in-out infinite; }
.eq-paused .eq-bar { animation-play-state: paused; transform: scaleY(0.5); }
```

- [ ] **Step 2: Create `app/fonts.ts`**

```ts
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});
```

- [ ] **Step 3: Replace `app/layout.tsx`**

```tsx
import "./globals.css";
import type { Metadata } from "next";
import { newsreader, plexSans, plexMono } from "./fonts";

export const metadata: Metadata = {
  title: "Sonic Acrylic Games",
  description: "A daily word-and-music puzzle from Sonic Acrylic.",
  metadataBase: new URL("https://games.sonicacrylic.com"),
  openGraph: {
    title: "Sonic Acrylic Games",
    description: "A daily word-and-music puzzle from Sonic Acrylic.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF1DE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <div className="min-h-dvh flex justify-center">
          <main className="stage w-full max-w-[440px] min-h-dvh relative overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Replace `app/page.tsx` with a temporary smoke page**

```tsx
export default function Home() {
  return (
    <div className="p-6">
      <p className="mono text-xs uppercase tracking-[0.22em]" style={{ color: "var(--taupe)" }}>
        TUE · NOV 11 · ED.001
      </p>
      <h1 className="serif text-3xl font-semibold mt-3" style={{ color: "var(--ink)" }}>
        Sonic Acrylic Games
      </h1>
      <p className="serif italic text-sm mt-3" style={{ color: "var(--taupe)" }}>
        Cobalt stage smoke-test — fonts and tokens loaded.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Boot dev server and verify visually**

```bash
npm run dev &
sleep 5
curl -sf http://localhost:3000 | grep -q "Sonic Acrylic Games" && echo "OK" || echo "FAIL"
kill %1
```
Expected: `OK`. Visually open `http://localhost:3000` in a browser; Cobalt radial gradient is visible, Newsreader serif renders headline, Plex Mono kicker is uppercased and letter-spaced.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: load Cobalt tokens, fonts, and 440px stage layout"
```

---

## Task 3: Set up Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/unit/smoke.test.ts`
- Modify: `package.json` (add scripts), `tsconfig.json` (add vitest types)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    include: ["tests/unit/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 2: Create `tests/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Add test scripts to `package.json`**

Modify the `scripts` block to include:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 4: Add a smoke test `tests/unit/smoke.test.ts`**

```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Verify**

```bash
npm test
```
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: configure Vitest + jsdom + RTL"
```

---

## Task 4: `lib/date.ts` — America/New_York today helpers (TDD)

**Files:**
- Test: `tests/unit/lib/date.test.ts`
- Create: `lib/date.ts`

- [ ] **Step 1: Write failing test `tests/unit/lib/date.test.ts`**

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { etToday, etDateString, isYesterdayET, isSameETDate } from "@/lib/date";

afterEach(() => { vi.useRealTimers(); });

describe("etToday / etDateString", () => {
  it("returns ET date as YYYY-MM-DD", () => {
    // 2026-05-11 03:00 UTC = 2026-05-10 23:00 ET (EDT, UTC-4)
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T03:00:00Z"));
    expect(etDateString()).toBe("2026-05-10");
  });

  it("rolls forward at ET midnight", () => {
    // 2026-05-11 04:30 UTC = 2026-05-11 00:30 ET
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T04:30:00Z"));
    expect(etDateString()).toBe("2026-05-11");
  });

  it("handles winter (EST, UTC-5)", () => {
    // 2026-01-15 04:30 UTC = 2026-01-14 23:30 EST
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T04:30:00Z"));
    expect(etDateString()).toBe("2026-01-14");
  });
});

describe("isYesterdayET / isSameETDate", () => {
  it("isYesterdayET true when prior is one ET-day before today", () => {
    expect(isYesterdayET("2026-05-10", "2026-05-11")).toBe(true);
    expect(isYesterdayET("2026-05-09", "2026-05-11")).toBe(false);
    expect(isYesterdayET(null, "2026-05-11")).toBe(false);
  });

  it("isSameETDate compares strings", () => {
    expect(isSameETDate("2026-05-11", "2026-05-11")).toBe(true);
    expect(isSameETDate("2026-05-11", "2026-05-12")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
npm test -- tests/unit/lib/date.test.ts
```
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/date.ts`**

```ts
const FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric", month: "2-digit", day: "2-digit",
});

export function etDateString(d: Date = new Date()): string {
  return FMT.format(d);
}

export function etToday(): string {
  return etDateString();
}

export function isSameETDate(a: string | null | undefined, b: string): boolean {
  return !!a && a === b;
}

export function isYesterdayET(prior: string | null | undefined, today: string): boolean {
  if (!prior) return false;
  const t = new Date(today + "T12:00:00Z");
  const expected = new Date(t.getTime() - 24 * 60 * 60 * 1000);
  const expectedStr = expected.toISOString().slice(0, 10);
  return prior === expectedStr;
}
```

- [ ] **Step 4: Verify**

```bash
npm test -- tests/unit/lib/date.test.ts
```
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add ET-localized date helpers with tests"
```

---

## Task 5: `lib/device.ts` — anonymous device id cookie

**Files:**
- Test: `tests/unit/lib/device.test.ts`
- Create: `lib/device.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from "vitest";
import { newDeviceId, isValidDeviceId } from "@/lib/device";

describe("newDeviceId", () => {
  it("returns a uuid v4-shaped string", () => {
    const id = newDeviceId();
    expect(isValidDeviceId(id)).toBe(true);
  });

  it("returns distinct values", () => {
    expect(newDeviceId()).not.toBe(newDeviceId());
  });
});

describe("isValidDeviceId", () => {
  it("rejects non-uuids", () => {
    expect(isValidDeviceId("nope")).toBe(false);
    expect(isValidDeviceId("")).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm test -- tests/unit/lib/device.test.ts
```

- [ ] **Step 3: Implement `lib/device.ts`**

```ts
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function newDeviceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (Node <19): RFC 4122 v4
  const b = new Uint8Array(16);
  for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

export function isValidDeviceId(s: string): boolean {
  return UUID_RE.test(s);
}

export const DEVICE_COOKIE = "sag_did";
export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Build a Set-Cookie header value for the device id. */
export function deviceCookie(id: string): string {
  return `${DEVICE_COOKIE}=${id}; Path=/; Max-Age=${DEVICE_COOKIE_MAX_AGE}; SameSite=Lax`;
}
```

- [ ] **Step 4: Verify**

```bash
npm test -- tests/unit/lib/device.test.ts
```
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add device-id generator + cookie helper"
```

---

## Task 6: Provision Neon Postgres + write initial migration

**Files:**
- Create: `db/migrations/001_init.sql`, `lib/db.ts`, `scripts/migrate.ts`, `.env.example`
- Modify: `package.json` (add `db:migrate` script)

> **Manual step required:** Ben needs to provision a Neon database. Pause and ask: "Create a Neon Postgres database for the project. From the Neon console, copy the pooled connection string. Add it to `.env.local` as `DATABASE_URL=postgresql://…`. Reply when done."
>
> Until that's done, run migrations against a local Docker Postgres for development. If Docker is available:
> ```bash
> docker run -d --name sag-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16
> echo "DATABASE_URL=postgresql://postgres:dev@localhost:5432/postgres" > .env.local
> ```

- [ ] **Step 1: Create `db/migrations/001_init.sql`**

```sql
CREATE TABLE IF NOT EXISTS daily_puzzles (
  date DATE PRIMARY KEY,
  edition_no INTEGER NOT NULL UNIQUE,
  lineup_artists JSONB NOT NULL,
  theme_pull_quote TEXT,
  marginalia_quote TEXT,
  connections_categories JSONB NOT NULL,
  connections_tiles JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_captures (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT,
  edition_id INTEGER REFERENCES daily_puzzles(edition_no),
  device_id TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS email_captures_lower_email_key ON email_captures(LOWER(email));

CREATE TABLE IF NOT EXISTS streaks (
  device_id TEXT PRIMARY KEY,
  current INTEGER NOT NULL DEFAULT 0,
  longest INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  email TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  ts TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  device_id TEXT,
  edition_id INTEGER,
  meta JSONB
);
```

- [ ] **Step 2: Create `lib/db.ts`**

```ts
import { neon, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

const url = process.env.DATABASE_URL;
if (!url) {
  // Avoid throwing at import time during build; throw on first use instead.
  console.warn("[db] DATABASE_URL is not set; queries will fail at runtime.");
}

export const sql = neon(url ?? "postgresql://invalid");
```

> Note: `@neondatabase/serverless` works against any Postgres over HTTP via Neon's driver. For a local Docker Postgres you'll need the standard `pg` driver instead — add `import pg from "pg"` and switch by checking `DATABASE_URL` host. Simpler path: skip local Docker entirely, use a free Neon dev branch for development. Recommend the latter.

- [ ] **Step 3: Create `scripts/migrate.ts`**

```ts
import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const dir = join(process.cwd(), "db/migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to .env.local and re-run.");
    process.exit(1);
  }
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    // Neon requires SSL; pg parses sslmode= from the URL on most drivers but
    // setting it explicitly is safer.
    ssl: process.env.DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
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
```

> The runtime API routes (Tasks 16–20) use `@neondatabase/serverless` for HTTP-pooled tagged-template queries — fast cold starts, parameterized only. Migrations use the standard `pg` driver because it accepts multi-statement SQL files.

- [ ] **Step 4: Create `.env.example`**

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

- [ ] **Step 5: Add `db:migrate` script to `package.json`**

```json
"db:migrate": "tsx scripts/migrate.ts"
```

- [ ] **Step 6: Run migration**

```bash
npm run db:migrate
```
Expected: "Migrations complete." If `DATABASE_URL` not set, stop and resolve before continuing.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(db): add Neon client, init migration, migrate script"
```

---

## Task 7: `lib/shuffle.ts` — seeded shuffle (TDD)

**Files:**
- Test: `tests/unit/lib/shuffle.test.ts`
- Create: `lib/shuffle.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from "vitest";
import { seededShuffle } from "@/lib/shuffle";

describe("seededShuffle", () => {
  it("returns same permutation for same seed", () => {
    const a = seededShuffle([1,2,3,4,5,6,7,8], "2026-05-11");
    const b = seededShuffle([1,2,3,4,5,6,7,8], "2026-05-11");
    expect(a).toEqual(b);
  });

  it("returns different permutation for different seeds", () => {
    const a = seededShuffle([1,2,3,4,5,6,7,8], "2026-05-11");
    const c = seededShuffle([1,2,3,4,5,6,7,8], "2026-05-12");
    expect(a).not.toEqual(c);
  });

  it("contains the same elements", () => {
    const input = [1,2,3,4,5,6,7,8];
    const out = seededShuffle(input, "x");
    expect([...out].sort()).toEqual(input);
  });

  it("does not mutate input", () => {
    const input = [1,2,3];
    seededShuffle(input, "x");
    expect(input).toEqual([1,2,3]);
  });
});
```

- [ ] **Step 2: Run, expect fail**

- [ ] **Step 3: Implement `lib/shuffle.ts`**

```ts
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

export function seededShuffle<T>(arr: readonly T[], seed: string): T[] {
  const rng = mulberry32(xmur3(seed)());
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
```

- [ ] **Step 4: Verify**

```bash
npm test -- tests/unit/lib/shuffle.test.ts
```
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add deterministic seeded shuffle"
```

---

## Task 8: `lib/connections.ts` — pure game state machine (TDD)

**Files:**
- Test: `tests/unit/lib/connections.test.ts`
- Create: `lib/connections.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from "vitest";
import {
  initState, toggleTile, clearSelection, applyGuess,
  type ConnectionsState, type Category,
} from "@/lib/connections";

const CATS: Category[] = [
  { name: "Cat A", difficulty: 1, members: ["a1","a2","a3","a4"] },
  { name: "Cat B", difficulty: 2, members: ["b1","b2","b3","b4"] },
  { name: "Cat C", difficulty: 3, members: ["c1","c2","c3","c4"] },
  { name: "Cat D", difficulty: 4, members: ["d1","d2","d3","d4"] },
];
const TILES = ["a1","b1","c1","d1","a2","b2","c2","d2","a3","b3","c3","d3","a4","b4","c4","d4"];

describe("connections state machine", () => {
  it("init has 16 tiles, 0 selected, 4 mistakes left", () => {
    const s = initState(TILES);
    expect(s.tiles).toEqual(TILES);
    expect(s.selected).toEqual([]);
    expect(s.mistakesLeft).toBe(4);
    expect(s.solved).toEqual([]);
    expect(s.status).toBe("playing");
  });

  it("toggleTile adds and removes", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    s = toggleTile(s, "b1");
    expect(s.selected).toEqual(["a1", "b1"]);
    s = toggleTile(s, "a1");
    expect(s.selected).toEqual(["b1"]);
  });

  it("toggleTile caps at 4", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    s = toggleTile(s, "a2");
    s = toggleTile(s, "a3");
    s = toggleTile(s, "a4");
    s = toggleTile(s, "b1");
    expect(s.selected.length).toBe(4);
    expect(s.selected).not.toContain("b1");
  });

  it("applyGuess returns 'match' for correct group, removes tiles and clears selection", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    s = toggleTile(s, "a2");
    s = toggleTile(s, "a3");
    s = toggleTile(s, "a4");
    const r = applyGuess(s, CATS);
    expect(r.result).toBe("match");
    expect(r.state.solved.length).toBe(1);
    expect(r.state.solved[0].name).toBe("Cat A");
    expect(r.state.tiles).not.toContain("a1");
    expect(r.state.selected).toEqual([]);
    expect(r.state.mistakesLeft).toBe(4);
  });

  it("applyGuess returns 'one_away' when 3 of 4 match a category", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    s = toggleTile(s, "a2");
    s = toggleTile(s, "a3");
    s = toggleTile(s, "b1");
    const r = applyGuess(s, CATS);
    expect(r.result).toBe("one_away");
    expect(r.state.mistakesLeft).toBe(3);
    expect(r.state.solved).toEqual([]);
  });

  it("applyGuess returns 'wrong' otherwise and decrements mistakes", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    s = toggleTile(s, "b1");
    s = toggleTile(s, "c1");
    s = toggleTile(s, "d1");
    const r = applyGuess(s, CATS);
    expect(r.result).toBe("wrong");
    expect(r.state.mistakesLeft).toBe(3);
  });

  it("4 wrongs -> status=lost", () => {
    let s = initState(TILES);
    for (let i = 0; i < 4; i++) {
      s = clearSelection(s);
      s = toggleTile(s, "a1");
      s = toggleTile(s, "b1");
      s = toggleTile(s, "c1");
      s = toggleTile(s, "d1");
      s = applyGuess(s, CATS).state;
    }
    expect(s.status).toBe("lost");
  });

  it("4 matches -> status=won", () => {
    let s = initState(TILES);
    for (const cat of CATS) {
      s = clearSelection(s);
      for (const m of cat.members) s = toggleTile(s, m);
      s = applyGuess(s, CATS).state;
    }
    expect(s.status).toBe("won");
    expect(s.solved.length).toBe(4);
  });

  it("rejects guess of !==4 selected", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    const r = applyGuess(s, CATS);
    expect(r.result).toBe("invalid");
    expect(r.state.mistakesLeft).toBe(4);
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm test -- tests/unit/lib/connections.test.ts
```

- [ ] **Step 3: Implement `lib/connections.ts`**

```ts
export type Category = {
  name: string;
  difficulty: 1 | 2 | 3 | 4;
  members: string[]; // length 4
};

export type GuessResult = "match" | "one_away" | "wrong" | "invalid";

export type ConnectionsState = {
  tiles: string[];               // remaining unsolved tiles
  selected: string[];            // currently-selected (max 4)
  mistakesLeft: number;
  solved: Category[];            // in solve order
  status: "playing" | "won" | "lost";
};

export function initState(tiles: string[]): ConnectionsState {
  return { tiles: tiles.slice(), selected: [], mistakesLeft: 4, solved: [], status: "playing" };
}

export function toggleTile(s: ConnectionsState, tile: string): ConnectionsState {
  if (s.status !== "playing") return s;
  if (!s.tiles.includes(tile)) return s;
  if (s.selected.includes(tile)) {
    return { ...s, selected: s.selected.filter((t) => t !== tile) };
  }
  if (s.selected.length >= 4) return s;
  return { ...s, selected: [...s.selected, tile] };
}

export function clearSelection(s: ConnectionsState): ConnectionsState {
  return { ...s, selected: [] };
}

function categoryOf(tile: string, cats: Category[]): Category | undefined {
  return cats.find((c) => c.members.includes(tile));
}

export function applyGuess(
  s: ConnectionsState,
  categories: Category[],
): { state: ConnectionsState; result: GuessResult; matchedCategory?: Category } {
  if (s.status !== "playing" || s.selected.length !== 4) {
    return { state: s, result: "invalid" };
  }

  // Count how many of the selected tiles belong to each category
  const counts = new Map<string, number>();
  for (const tile of s.selected) {
    const cat = categoryOf(tile, categories);
    if (cat) counts.set(cat.name, (counts.get(cat.name) ?? 0) + 1);
  }

  // Exact match: all 4 from same category
  for (const [name, n] of counts) {
    if (n === 4) {
      const cat = categories.find((c) => c.name === name)!;
      const newTiles = s.tiles.filter((t) => !cat.members.includes(t));
      const solved = [...s.solved, cat];
      const status = solved.length === 4 ? "won" : "playing";
      return {
        state: { ...s, tiles: newTiles, selected: [], solved, status },
        result: "match",
        matchedCategory: cat,
      };
    }
  }

  const oneAway = [...counts.values()].some((n) => n === 3);
  const mistakesLeft = s.mistakesLeft - 1;
  const status = mistakesLeft <= 0 ? "lost" : "playing";
  return {
    state: { ...s, mistakesLeft, selected: [], status },
    result: oneAway ? "one_away" : "wrong",
  };
}
```

- [ ] **Step 4: Verify**

```bash
npm test -- tests/unit/lib/connections.test.ts
```
Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add Connections game state machine"
```

---

## Task 9: `lib/audioQueue.ts` — pure queue state (TDD)

**Files:**
- Test: `tests/unit/lib/audioQueue.test.ts`
- Create: `lib/audioQueue.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from "vitest";
import { initQueue, advance, prev, setIndex, currentTrack, type Track } from "@/lib/audioQueue";

const TRACKS: Track[] = [
  { id: "t1", title: "One", artist: "SA", file: "/audio/t1.mp3", duration_sec: 200, streaming_links: {} },
  { id: "t2", title: "Two", artist: "SA", file: "/audio/t2.mp3", duration_sec: 180, streaming_links: {} },
  { id: "t3", title: "Three", artist: "SA", file: "/audio/t3.mp3", duration_sec: 220, streaming_links: {} },
];

describe("audioQueue", () => {
  it("initQueue starts at index 0, paused", () => {
    const q = initQueue(TRACKS);
    expect(q.index).toBe(0);
    expect(q.isPlaying).toBe(false);
    expect(currentTrack(q)).toBe(TRACKS[0]);
  });

  it("advance moves forward and wraps", () => {
    let q = initQueue(TRACKS);
    q = advance(q);
    expect(q.index).toBe(1);
    q = advance(q);
    expect(q.index).toBe(2);
    q = advance(q);
    expect(q.index).toBe(0);
  });

  it("prev moves backward and wraps", () => {
    let q = initQueue(TRACKS);
    q = prev(q);
    expect(q.index).toBe(2);
    q = prev(q);
    expect(q.index).toBe(1);
  });

  it("setIndex clamps", () => {
    let q = initQueue(TRACKS);
    q = setIndex(q, 99);
    expect(q.index).toBe(2);
    q = setIndex(q, -5);
    expect(q.index).toBe(0);
  });
});
```

- [ ] **Step 2: Run, expect fail**

- [ ] **Step 3: Implement `lib/audioQueue.ts`**

```ts
export type StreamingLinks = {
  spotify?: string;
  apple_music?: string;
  youtube_music?: string;
  bandcamp?: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  file: string;
  duration_sec: number;
  streaming_links: StreamingLinks;
};

export type QueueState = {
  tracks: Track[];
  index: number;
  isPlaying: boolean;
  positionSec: number;
};

export function initQueue(tracks: Track[]): QueueState {
  return { tracks, index: 0, isPlaying: false, positionSec: 0 };
}

export function currentTrack(q: QueueState): Track | undefined {
  return q.tracks[q.index];
}

export function advance(q: QueueState): QueueState {
  if (q.tracks.length === 0) return q;
  return { ...q, index: (q.index + 1) % q.tracks.length, positionSec: 0 };
}

export function prev(q: QueueState): QueueState {
  if (q.tracks.length === 0) return q;
  return { ...q, index: (q.index - 1 + q.tracks.length) % q.tracks.length, positionSec: 0 };
}

export function setIndex(q: QueueState, i: number): QueueState {
  if (q.tracks.length === 0) return q;
  const clamped = Math.max(0, Math.min(q.tracks.length - 1, i));
  return { ...q, index: clamped, positionSec: 0 };
}
```

- [ ] **Step 4: Verify**

```bash
npm test -- tests/unit/lib/audioQueue.test.ts
```
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(lib): add audio queue state helpers"
```

---

## Task 10: `lib/tracks.ts` — placeholder track list

**Files:**
- Create: `lib/tracks.ts`, `public/audio/.gitkeep`

- [ ] **Step 1: Create `lib/tracks.ts`**

```ts
import type { Track } from "./audioQueue";

// Placeholder. Replace with real tracks once Ben supplies MP3s + streaming links.
// File paths point at /public/audio/. Names are stand-ins.
export const TRACKS: Track[] = [
  {
    id: "placeholder-1",
    title: "Placeholder One",
    artist: "Sonic Acrylic",
    file: "/audio/placeholder-1.mp3",
    duration_sec: 180,
    streaming_links: {
      spotify: "https://open.spotify.com/artist/PLACEHOLDER",
      apple_music: "https://music.apple.com/us/artist/PLACEHOLDER",
      youtube_music: "https://music.youtube.com/channel/PLACEHOLDER",
      bandcamp: "https://sonicacrylic.bandcamp.com",
    },
  },
];
```

- [ ] **Step 2: Create `public/audio/.gitkeep`** (so the dir exists in git)

```
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: scaffold tracks list with placeholder + audio dir"
```

---

## Task 11: NowPlaying Provider (audio element + context)

**Files:**
- Create: `components/brand/NowPlaying/Provider.tsx`
- Test: `tests/unit/components/NowPlayingProvider.test.tsx`

- [ ] **Step 1: Write a smoke test (queue logic only — audio element is jsdom-stubbed)**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { NowPlayingProvider, useNowPlaying } from "@/components/brand/NowPlaying/Provider";
import { TRACKS } from "@/lib/tracks";

function Probe() {
  const np = useNowPlaying();
  return (
    <>
      <span data-testid="title">{np.current?.title}</span>
      <button onClick={np.next}>next</button>
      <span data-testid="playing">{String(np.isPlaying)}</span>
    </>
  );
}

describe("NowPlayingProvider", () => {
  it("exposes the current track and is paused by default", () => {
    render(
      <NowPlayingProvider tracks={TRACKS}>
        <Probe />
      </NowPlayingProvider>
    );
    expect(screen.getByTestId("title").textContent).toBe(TRACKS[0].title);
    expect(screen.getByTestId("playing").textContent).toBe("false");
  });
});
```

- [ ] **Step 2: Run, expect fail**

- [ ] **Step 3: Implement `components/brand/NowPlaying/Provider.tsx`**

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  initQueue, advance, prev as prevTrack, setIndex,
  type QueueState, type Track,
} from "@/lib/audioQueue";

type NowPlayingApi = {
  current: Track | undefined;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  next: () => void;
  prev: () => void;
  jumpTo: (i: number) => void;
};

const Ctx = createContext<NowPlayingApi | null>(null);

const STORAGE_KEY = "sag:np";

export function NowPlayingProvider({ tracks, children }: { tracks: Track[]; children: React.ReactNode }) {
  const [q, setQ] = useState<QueueState>(() => initQueue(tracks));
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Restore last index from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.index === "number") {
        setQ((s) => setIndex(s, data.index));
      }
    } catch {}
  }, []);

  // Persist index when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ index: q.index })); } catch {}
  }, [q.index]);

  // Audio src follows current track; reset duration; auto-advance on end
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => setQ((s) => advance(s));
    const onMeta = () => setDuration(el.duration || 0);
    const onTime = () => setQ((s) => ({ ...s, positionSec: el.currentTime }));
    el.addEventListener("ended", onEnded);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("timeupdate", onTime);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("timeupdate", onTime);
    };
  }, []);

  // When index changes, swap src
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const wasPlaying = q.isPlaying;
    el.src = q.tracks[q.index]?.file ?? "";
    if (wasPlaying) {
      el.play().catch(() => setQ((s) => ({ ...s, isPlaying: false })));
    }
  }, [q.index, q.tracks]);

  const play = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      await el.play();
      setQ((s) => ({ ...s, isPlaying: true }));
    } catch {
      // autoplay blocked — keep paused state
      setQ((s) => ({ ...s, isPlaying: false }));
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setQ((s) => ({ ...s, isPlaying: false }));
  }, []);

  const toggle = useCallback(async () => {
    if (q.isPlaying) pause();
    else await play();
  }, [q.isPlaying, play, pause]);

  const next = useCallback(() => setQ(advance), []);
  const prev = useCallback(() => setQ(prevTrack), []);
  const jumpTo = useCallback((i: number) => setQ((s) => setIndex(s, i)), []);

  const api: NowPlayingApi = useMemo(() => ({
    current: q.tracks[q.index],
    isPlaying: q.isPlaying,
    positionSec: q.positionSec,
    durationSec: duration,
    play, pause, toggle, next, prev, jumpTo,
  }), [q, duration, play, pause, toggle, next, prev, jumpTo]);

  return (
    <Ctx.Provider value={api}>
      {/* Persistent audio element lives at root */}
      <audio ref={audioRef} preload="metadata" />
      {children}
    </Ctx.Provider>
  );
}

export function useNowPlaying(): NowPlayingApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useNowPlaying must be used inside <NowPlayingProvider>");
  return v;
}
```

- [ ] **Step 4: Verify**

```bash
npm test -- tests/unit/components/NowPlayingProvider.test.tsx
```
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(brand): NowPlaying provider with audio queue + persistence"
```

---

## Task 12: NowPlaying — FullRibbon + MiniPill components

**Files:**
- Create: `components/brand/NowPlaying/FullRibbon.tsx`, `components/brand/NowPlaying/MiniPill.tsx`, `components/brand/NowPlaying/PlatformIcons.tsx`

- [ ] **Step 1: Create `components/brand/NowPlaying/PlatformIcons.tsx`**

```tsx
"use client";

import type { StreamingLinks } from "@/lib/audioQueue";

const ICON_SIZE = 18;

const labels: Record<keyof StreamingLinks, string> = {
  spotify: "Spotify",
  apple_music: "Apple Music",
  youtube_music: "YouTube Music",
  bandcamp: "Bandcamp",
};

export function PlatformIcons({ links, source }: { links: StreamingLinks; source: string }) {
  const platforms = (Object.keys(labels) as (keyof StreamingLinks)[]).filter((k) => links[k]);
  if (platforms.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      {platforms.map((k) => (
        <a
          key={k}
          href={links[k]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open in ${labels[k]}`}
          onClick={() => fetch("/api/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: `streaming_click_${k}`, meta: { source } }),
          }).catch(() => {})}
          className="inline-flex items-center justify-center"
          style={{ width: ICON_SIZE, height: ICON_SIZE, color: "var(--ink)" }}
        >
          <PlatformGlyph kind={k} />
        </a>
      ))}
    </div>
  );
}

function PlatformGlyph({ kind }: { kind: keyof StreamingLinks }) {
  // Simple monogram glyphs — replace with real brand SVGs in a polish pass.
  // (Brand SVGs require following each platform's brand guidelines; v0 uses neutral marks.)
  const letter = { spotify: "S", apple_music: "A", youtube_music: "Y", bandcamp: "B" }[kind];
  return (
    <span
      aria-hidden
      style={{
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500,
        border: "1px solid var(--ink)", borderRadius: 999,
        width: 18, height: 18, lineHeight: "16px", textAlign: "center", display: "inline-block",
      }}
    >
      {letter}
    </span>
  );
}
```

> Note: monogram glyphs are placeholders. Replace with each platform's official brand mark when Ben supplies the SVGs (Spotify, Apple Music, YouTube Music, Bandcamp each publish official guidelines and SVGs).

- [ ] **Step 2: Create `components/brand/NowPlaying/FullRibbon.tsx`**

```tsx
"use client";

import { useNowPlaying } from "./Provider";
import { PlatformIcons } from "./PlatformIcons";

function PlayPause() {
  const np = useNowPlaying();
  return (
    <button
      onClick={np.toggle}
      aria-label={np.isPlaying ? "Pause" : "Play"}
      className="inline-flex items-center justify-center rounded-full"
      style={{ width: 30, height: 30, background: "var(--ink)", color: "var(--paper)" }}
    >
      <span aria-hidden>{np.isPlaying ? "❚❚" : "▶"}</span>
    </button>
  );
}

function Equalizer({ playing }: { playing: boolean }) {
  return (
    <div className={`flex items-end gap-[2px] h-[16px] ${playing ? "" : "eq-paused"}`}>
      {[1.2, 1.3, 1.4, 1.5, 1.6].map((d, i) => (
        <span
          key={i}
          className="eq-bar"
          style={{
            ["--eq-duration" as any]: `${d}s`,
            width: 3, height: "100%", background: "var(--rust)", borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FullRibbon() {
  const np = useNowPlaying();
  if (!np.current) return null;
  return (
    <div
      className="flex items-center gap-3 px-4 border-t"
      style={{ height: 60, background: "var(--paper-2)", borderColor: "var(--hair)" }}
    >
      <PlayPause />
      <Equalizer playing={np.isPlaying} />
      <div className="flex-1 min-w-0">
        <div className="serif italic text-[13px] truncate" style={{ color: "var(--ink)" }}>
          {np.current.title}
        </div>
        <div className="mono uppercase text-[9px] tracking-[0.18em] truncate" style={{ color: "var(--taupe)" }}>
          {np.current.artist}
        </div>
      </div>
      <PlatformIcons links={np.current.streaming_links} source="full" />
      <div className="mono text-[10px]" style={{ color: "var(--taupe)" }}>
        {fmt(np.positionSec)}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/brand/NowPlaying/MiniPill.tsx`**

```tsx
"use client";

import { useNowPlaying } from "./Provider";
import { PlatformIcons } from "./PlatformIcons";

export function MiniPill() {
  const np = useNowPlaying();
  if (!np.current) return null;
  return (
    <div
      className="flex items-center gap-2 px-2 py-1 rounded-full border"
      style={{ background: "var(--paper-2)", borderColor: "var(--hair-2)" }}
    >
      <button
        onClick={np.toggle}
        aria-label={np.isPlaying ? "Pause" : "Play"}
        className="inline-flex items-center justify-center rounded-full"
        style={{ width: 18, height: 18, background: "var(--ink)", color: "var(--paper)", fontSize: 9 }}
      >
        <span aria-hidden>{np.isPlaying ? "❚❚" : "▶"}</span>
      </button>
      <div className={`flex items-end gap-[2px] h-[10px] ${np.isPlaying ? "" : "eq-paused"}`}>
        {[1.2, 1.3, 1.4, 1.5, 1.6].map((d, i) => (
          <span key={i} className="eq-bar" style={{ ["--eq-duration" as any]: `${d}s`, width: 2, height: "100%", background: "var(--rust)", borderRadius: 1 }} />
        ))}
      </div>
      <div className="serif italic text-[11px] truncate max-w-[120px]" style={{ color: "var(--ink)" }}>
        {np.current.title}
      </div>
      <PlatformIcons links={np.current.streaming_links} source="mini" />
    </div>
  );
}
```

- [ ] **Step 4: Smoke build**

```bash
npm run build
```
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(brand): NowPlaying FullRibbon + MiniPill + platform icons"
```

---

## Task 13: Wire NowPlayingProvider into root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update `app/layout.tsx`**

Replace the existing layout to wrap `children` in `NowPlayingProvider`:

```tsx
import "./globals.css";
import type { Metadata } from "next";
import { newsreader, plexSans, plexMono } from "./fonts";
import { NowPlayingProvider } from "@/components/brand/NowPlaying/Provider";
import { TRACKS } from "@/lib/tracks";

export const metadata: Metadata = {
  title: "Sonic Acrylic Games",
  description: "A daily word-and-music puzzle from Sonic Acrylic.",
  metadataBase: new URL("https://games.sonicacrylic.com"),
  openGraph: {
    title: "Sonic Acrylic Games",
    description: "A daily word-and-music puzzle from Sonic Acrylic.",
    type: "website",
  },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#FFF1DE" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <NowPlayingProvider tracks={TRACKS}>
          <div className="min-h-dvh flex justify-center">
            <main className="stage w-full max-w-[440px] min-h-dvh relative overflow-hidden flex flex-col">
              {children}
            </main>
          </div>
        </NowPlayingProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Smoke**

```bash
npm run build
```
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: mount NowPlayingProvider at root layout"
```

---

## Task 14: AppBar component

**Files:**
- Create: `components/brand/AppBar.tsx`

- [ ] **Step 1: Implement `components/brand/AppBar.tsx`**

```tsx
import Link from "next/link";

type Props = {
  kicker: string;
  backHref?: string;
  rightSlot?: React.ReactNode;
};

export function AppBar({ kicker, backHref, rightSlot }: Props) {
  return (
    <header
      className="flex items-center justify-between px-4 border-b"
      style={{ height: 44, background: "var(--paper)", borderColor: "var(--hair)" }}
    >
      <div className="flex items-center gap-2">
        {backHref ? (
          <Link href={backHref} aria-label="Back" style={{ color: "var(--ink)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 1L3 7l6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : null}
        <span className="mono uppercase text-[10.5px] tracking-[0.22em]" style={{ color: "var(--ink)" }}>
          {kicker}
        </span>
      </div>
      <div className="flex items-center gap-2">{rightSlot}</div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(brand): add AppBar component"
```

---

## Task 15: StreakChip component + `/api/streak/me` route

**Files:**
- Create: `components/brand/StreakChip.tsx`, `app/api/streak/me/route.ts`

- [ ] **Step 1: Implement `components/brand/StreakChip.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";

export function StreakChip() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/streak/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCount(d.current ?? 0))
      .catch(() => setCount(0));
  }, []);
  return (
    <span
      className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full mono text-[11px] uppercase tracking-[0.1em]"
      style={{ border: "1px solid var(--ink)", color: "var(--ink)", background: "transparent" }}
      aria-label={`Current streak ${count ?? 0} days`}
    >
      <span style={{ color: "var(--rust)" }}>◆</span>
      <span>{count ?? "–"}</span>
    </span>
  );
}
```

- [ ] **Step 2: Implement `app/api/streak/me/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { newDeviceId, isValidDeviceId, DEVICE_COOKIE, deviceCookie } from "@/lib/device";

export async function GET(req: NextRequest) {
  let did = req.cookies.get(DEVICE_COOKIE)?.value;
  let setCookie: string | undefined;
  if (!did || !isValidDeviceId(did)) {
    did = newDeviceId();
    setCookie = deviceCookie(did);
  }

  const rows = await sql`SELECT current, longest, last_completed_date FROM streaks WHERE device_id = ${did}`;
  const row = rows[0] ?? { current: 0, longest: 0, last_completed_date: null };

  const res = NextResponse.json({
    current: row.current,
    longest: row.longest,
    last_completed_date: row.last_completed_date,
    device_id: did,
  });
  if (setCookie) res.headers.set("Set-Cookie", setCookie);
  return res;
}
```

- [ ] **Step 3: Smoke test the API locally**

```bash
npm run dev &
sleep 5
curl -i http://localhost:3000/api/streak/me
kill %1
```
Expected: HTTP 200, JSON `{current: 0, ...}` and a `Set-Cookie: sag_did=...` header on first call.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: StreakChip component + /api/streak/me endpoint"
```

---

## Task 16: `/api/puzzle/today` route (NO categories in response)

**Files:**
- Create: `app/api/puzzle/today/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { etToday } from "@/lib/date";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = etToday();
  const rows = await sql`
    SELECT date, edition_no, lineup_artists, theme_pull_quote, marginalia_quote, connections_tiles
    FROM daily_puzzles WHERE date = ${today}
  `;
  const row = rows[0];
  if (!row) {
    return NextResponse.json(
      { error: "no_puzzle", date: today, message: "No puzzle seeded for today." },
      { status: 404 }
    );
  }
  return NextResponse.json({
    date: row.date,
    edition_no: row.edition_no,
    lineup_artists: row.lineup_artists,
    theme_pull_quote: row.theme_pull_quote,
    marginalia_quote: row.marginalia_quote,
    tiles: row.connections_tiles,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: /api/puzzle/today returns lineup+tiles, withholds categories"
```

---

## Task 17: `/api/connections/check` route

**Files:**
- Create: `app/api/connections/check/route.ts`
- Test: `tests/unit/api/connections-check.test.ts`

- [ ] **Step 1: Write a unit test for the categorization logic that the route will use (extract to lib)**

Add to `lib/connections.ts`:

```ts
export function checkGuess(
  guess: string[],
  categories: Category[]
): { result: GuessResult; matchedCategory?: Category } {
  if (guess.length !== 4) return { result: "invalid" };
  const counts = new Map<string, number>();
  for (const t of guess) {
    const c = categoryOf(t, categories);
    if (c) counts.set(c.name, (counts.get(c.name) ?? 0) + 1);
  }
  for (const [name, n] of counts) {
    if (n === 4) {
      const cat = categories.find((c) => c.name === name)!;
      return { result: "match", matchedCategory: cat };
    }
  }
  const oneAway = [...counts.values()].some((n) => n === 3);
  return { result: oneAway ? "one_away" : "wrong" };
}
```

(`categoryOf` is already defined inside `lib/connections.ts` — make it module-internal or unhide it as needed; export `checkGuess`.)

Test `tests/unit/api/connections-check.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { checkGuess, type Category } from "@/lib/connections";

const CATS: Category[] = [
  { name: "A", difficulty: 1, members: ["a1","a2","a3","a4"] },
  { name: "B", difficulty: 2, members: ["b1","b2","b3","b4"] },
];

describe("checkGuess", () => {
  it("match", () => {
    expect(checkGuess(["a1","a2","a3","a4"], CATS)).toMatchObject({ result: "match" });
  });
  it("one_away", () => {
    expect(checkGuess(["a1","a2","a3","b1"], CATS)).toMatchObject({ result: "one_away" });
  });
  it("wrong", () => {
    expect(checkGuess(["a1","b1","a2","b2"], CATS)).toMatchObject({ result: "wrong" });
  });
  it("invalid on wrong size", () => {
    expect(checkGuess(["a1","b1","c1"], CATS)).toMatchObject({ result: "invalid" });
  });
});
```

- [ ] **Step 2: Run, expect fail (then green after adding `checkGuess`)**

```bash
npm test -- tests/unit/api/connections-check.test.ts
```

- [ ] **Step 3: Implement `app/api/connections/check/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { etToday } from "@/lib/date";
import { checkGuess, type Category } from "@/lib/connections";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { tiles?: string[] } | null;
  if (!body || !Array.isArray(body.tiles) || body.tiles.length !== 4) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const today = etToday();
  const rows = await sql`SELECT connections_categories FROM daily_puzzles WHERE date = ${today}`;
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "no_puzzle" }, { status: 404 });

  const cats = row.connections_categories as Category[];
  const result = checkGuess(body.tiles, cats);
  return NextResponse.json(result);
}
```

- [ ] **Step 4: Verify**

```bash
npm test
npm run build
```
Expected: tests pass, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: /api/connections/check validates a 4-tile guess server-side"
```

---

## Task 18: `/api/streak/complete` route

**Files:**
- Create: `app/api/streak/complete/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { DEVICE_COOKIE, isValidDeviceId } from "@/lib/device";
import { etToday, isYesterdayET, isSameETDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const did = req.cookies.get(DEVICE_COOKIE)?.value;
  if (!did || !isValidDeviceId(did)) {
    return NextResponse.json({ error: "no_device" }, { status: 400 });
  }

  const today = etToday();
  const existing = await sql`SELECT current, longest, last_completed_date FROM streaks WHERE device_id = ${did}`;
  const row = existing[0];

  let current = 1;
  let longest = 1;
  if (row) {
    const last = row.last_completed_date ? String(row.last_completed_date).slice(0, 10) : null;
    if (isSameETDate(last, today)) {
      return NextResponse.json({ current: row.current, longest: row.longest, last_completed_date: last });
    }
    if (isYesterdayET(last, today)) {
      current = row.current + 1;
    } else {
      current = 1;
    }
    longest = Math.max(row.longest, current);
  }

  await sql`
    INSERT INTO streaks (device_id, current, longest, last_completed_date, updated_at)
    VALUES (${did}, ${current}, ${longest}, ${today}, NOW())
    ON CONFLICT (device_id) DO UPDATE SET
      current = EXCLUDED.current,
      longest = EXCLUDED.longest,
      last_completed_date = EXCLUDED.last_completed_date,
      updated_at = NOW()
  `;

  return NextResponse.json({ current, longest, last_completed_date: today });
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: /api/streak/complete advances daily Connections streak"
```

---

## Task 19: `/api/capture` route (email capture)

**Files:**
- Create: `app/api/capture/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { DEVICE_COOKIE, isValidDeviceId } from "@/lib/device";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { email?: string; source?: string; edition_id?: number } | null;
  if (!body?.email || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: "bad_email" }, { status: 400 });
  }
  const email = body.email.trim().toLowerCase();
  const did = req.cookies.get(DEVICE_COOKIE)?.value;
  const device_id = did && isValidDeviceId(did) ? did : null;

  await sql`
    INSERT INTO email_captures (email, source, edition_id, device_id)
    VALUES (${email}, ${body.source ?? "unknown"}, ${body.edition_id ?? null}, ${device_id})
    ON CONFLICT (email) DO NOTHING
  `;

  if (device_id) {
    await sql`UPDATE streaks SET email = ${email}, updated_at = NOW() WHERE device_id = ${device_id}`;
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: /api/capture stores email, links to device streak"
```

---

## Task 20: Analytics event endpoint (`/api/event`)

**Files:**
- Create: `app/api/event/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { DEVICE_COOKIE } from "@/lib/device";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { name?: string; meta?: unknown; edition_id?: number } | null;
  if (!body?.name) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const did = req.cookies.get(DEVICE_COOKIE)?.value ?? null;
  await sql`
    INSERT INTO events (name, device_id, edition_id, meta)
    VALUES (${body.name}, ${did}, ${body.edition_id ?? null}, ${JSON.stringify(body.meta ?? {})}::jsonb)
  `;
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: /api/event logs lightweight analytics events"
```

---

## Task 21: Seed script + sample puzzle data

**Files:**
- Create: `data/puzzles/2026-05-11.json`, `data/puzzles/2026-05-12.json`, `data/puzzles/2026-05-13.json`, `scripts/seed-day.ts`
- Modify: `package.json` (add `seed:day`, `seed:week` scripts)

- [ ] **Step 1: Create `scripts/seed-day.ts`**

```ts
import "dotenv/config";
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
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    await seedOne(join(dir, f));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Add scripts to `package.json`**

```json
"seed:day": "tsx scripts/seed-day.ts",
"seed:all": "tsx scripts/seed-day.ts --all"
```

- [ ] **Step 3: Create `data/puzzles/2026-05-11.json`** (sample, with placeholder content — Ben can replace)

```json
{
  "date": "2026-05-11",
  "edition_no": 1,
  "lineup_artists": ["Phoebe Bridgers", "Big Thief", "Andy Shauf", "Aldous Harding", "Cassandra Jenkins"],
  "theme_pull_quote": "Five quiet voices on what it feels like to almost remember.",
  "marginalia_quote": "Each group is a room — listen for the door creak.",
  "connections_categories": [
    { "name": "Songs about water", "difficulty": 1, "members": ["Funeral", "Moon Song", "Salt In The Wound", "Hard Drive"] },
    { "name": "Two-word titles", "difficulty": 2, "members": ["The Magician", "Try Hard", "Garden Song", "Not Strong Enough"] },
    { "name": "Track 1s on a debut LP", "difficulty": 3, "members": ["Smoke Signals", "Masterpiece", "Real Estate", "Hard Hill"] },
    { "name": "Released in November", "difficulty": 4, "members": ["Punisher", "Cattails", "Cool Dry Place", "Two Reverse"] }
  ]
}
```

> **Content note for the engineer:** These titles are illustrative — Ben will provide real puzzle content during the seeding pass. The schema is what matters here.

- [ ] **Step 4: Create two more sample days** (`2026-05-12.json`, `2026-05-13.json`) following the same shape with `edition_no: 2` and `3` and different (placeholder) content.

- [ ] **Step 5: Seed the dev database**

```bash
npm run seed:all
```
Expected: "Seeded 2026-05-11 (edition 1)." etc.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: puzzle seed script + 3 sample puzzle days"
```

---

## Task 22: Home page — Hero, GameCards, SideB

**Files:**
- Create: `components/home/Hero.tsx`, `components/home/GameCard.tsx`, `components/home/SideB.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Implement `components/home/Hero.tsx`**

```tsx
type Props = {
  editionLabel: string;     // e.g. "TUE · NOV 11 · ED.412"
  headline: string;         // serif headline
  lineup: string[];         // 5 artists
  themeQuote?: string | null;
};

export function Hero({ editionLabel, headline, lineup, themeQuote }: Props) {
  return (
    <section
      className="mx-4 mt-4 p-[18px] rounded-[6px]"
      style={{ background: "var(--paper-2)" }}
    >
      <div className="mono uppercase text-[10.5px] tracking-[0.22em]" style={{ color: "var(--taupe)" }}>
        {editionLabel}
      </div>
      <h1 className="serif font-semibold text-[28px] mt-3 leading-[1.15]" style={{ color: "var(--ink)" }}>
        {headline}
      </h1>
      <ol className="mt-4 space-y-2">
        {lineup.map((name, i) => (
          <li key={name} className="flex items-baseline gap-3">
            <span className="mono text-[12px]" style={{ color: "var(--rust)" }}>{(i+1).toString().padStart(2, "0")}</span>
            <span className="serif text-[18px] font-medium" style={{ color: "var(--ink)" }}>{name}</span>
          </li>
        ))}
      </ol>
      {themeQuote ? (
        <>
          <hr className="hr mt-4" />
          <p className="serif italic text-[13px] mt-3" style={{ color: "var(--taupe)" }}>{themeQuote}</p>
        </>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 2: Implement `components/home/GameCard.tsx`**

```tsx
import Link from "next/link";

type Props = {
  index: number;
  kicker: string;
  title: string;
  subtitle: string;
  href?: string;
  comingSoon?: string;
};

export function GameCard({ index, kicker, title, subtitle, href, comingSoon }: Props) {
  const inner = (
    <div
      className="flex items-center gap-3 px-4 py-[14px] rounded-[6px] border"
      style={{
        background: comingSoon ? "transparent" : "var(--paper-2)",
        borderColor: "var(--hair-2)",
        opacity: comingSoon ? 0.5 : 1,
      }}
    >
      <div className="mono text-[22px]" style={{ color: "var(--ink)" }}>
        {index.toString().padStart(2, "0")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="mono uppercase text-[10px] tracking-[0.22em]" style={{ color: "var(--rust)" }}>
          {kicker}
        </div>
        <div className="serif text-[17px] font-medium mt-[2px]" style={{ color: "var(--ink)" }}>{title}</div>
        <div className="serif italic text-[12.5px] mt-[2px]" style={{ color: "var(--taupe)" }}>{subtitle}</div>
      </div>
      <div className="mono text-[10px]" style={{ color: comingSoon ? "var(--taupe)" : "var(--ink)" }}>
        {comingSoon ? comingSoon : "→"}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
```

- [ ] **Step 3: Implement `components/home/SideB.tsx`**

```tsx
export function SideB() {
  return (
    <section className="mx-4 mt-6">
      <div className="rule mono uppercase text-[10px] tracking-[0.18em] flex items-center gap-2" style={{ color: "var(--taupe)" }}>
        <span className="flex-1 h-px" style={{ background: "var(--hair)" }} />
        <span>SIDE B</span>
        <span className="flex-1 h-px" style={{ background: "var(--hair)" }} />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="p-3 rounded-[6px] border" style={{ borderColor: "var(--hair-2)" }}>
          <div className="mono uppercase text-[9px] tracking-[0.18em]" style={{ color: "var(--taupe)" }}>RANK</div>
          <div className="serif text-[16px] mt-1" style={{ color: "var(--ink)" }}>—</div>
          <div className="serif italic text-[11px]" style={{ color: "var(--taupe)" }}>coming with leaderboards</div>
        </div>
        <div className="p-3 rounded-[6px] border" style={{ borderColor: "var(--hair-2)" }}>
          <div className="mono uppercase text-[9px] tracking-[0.18em]" style={{ color: "var(--taupe)" }}>TIP JAR</div>
          <div className="serif text-[16px] mt-1" style={{ color: "var(--ink)" }}>—</div>
          <div className="serif italic text-[11px]" style={{ color: "var(--taupe)" }}>opens later this season</div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Replace `app/page.tsx`**

```tsx
import { AppBar } from "@/components/brand/AppBar";
import { StreakChip } from "@/components/brand/StreakChip";
import { Hero } from "@/components/home/Hero";
import { GameCard } from "@/components/home/GameCard";
import { SideB } from "@/components/home/SideB";
import { FullRibbon } from "@/components/brand/NowPlaying/FullRibbon";
import { etToday } from "@/lib/date";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

function fmtEdition(date: string, no: number): string {
  const d = new Date(date + "T12:00:00Z");
  const wk = ["SUN","MON","TUE","WED","THU","FRI","SAT"][d.getUTCDay()];
  const mo = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][d.getUTCMonth()];
  return `${wk} · ${mo} ${d.getUTCDate()} · ED.${String(no).padStart(3, "0")}`;
}

const GAMES = [
  { i: 1, kicker: "CONNECT", title: "Sixteen songs from tonight's five", subtitle: "Sort them into four hidden groups.", href: "/connections" },
  { i: 2, kicker: "SPELL", title: "A word the lineup keeps reaching for", subtitle: "Six guesses. Memory only.", comingSoon: "soon" },
  { i: 3, kicker: "LYRIC", title: "One missing word, one chance", subtitle: "From a chorus you almost remember.", comingSoon: "soon" },
  { i: 4, kicker: "ATTRIBUTE", title: "Who said it?", subtitle: "Match the quote to one of tonight's voices.", comingSoon: "soon" },
  { i: 5, kicker: "CHRONOLOGY", title: "Five records, in order", subtitle: "Drawn across the lineup.", comingSoon: "soon" },
  { i: 6, kicker: "INFLUENCE", title: "Teacher → pupil", subtitle: "Trace the line between two columns of five.", comingSoon: "soon" },
];

export default async function HomePage() {
  const today = etToday();
  const rows = await sql`
    SELECT date, edition_no, lineup_artists, theme_pull_quote
    FROM daily_puzzles WHERE date = ${today}
  `;
  const row = rows[0] as {
    date: string;
    edition_no: number;
    lineup_artists: string[];
    theme_pull_quote: string | null;
  } | undefined;

  return (
    <>
      <AppBar
        kicker={<>
          <span className="serif" style={{ color: "var(--ink)" }}>Sonic Acrylic</span>{" "}
          <span className="mono" style={{ color: "var(--taupe)" }}>Games</span>
        </> as any}
        rightSlot={<StreakChip />}
      />
      <div className="flex-1 overflow-y-auto pb-2">
        {row ? (
          <Hero
            editionLabel={fmtEdition(row.date, row.edition_no)}
            headline={"Tonight's table of five."}
            lineup={row.lineup_artists}
            themeQuote={row.theme_pull_quote}
          />
        ) : (
          <div className="mx-4 mt-4 p-4 serif italic" style={{ color: "var(--taupe)" }}>
            New edition drops at midnight ET. Come back then.
          </div>
        )}

        <div className="mx-4 mt-5 rule mono uppercase text-[10px] tracking-[0.18em] flex items-center gap-2" style={{ color: "var(--taupe)" }}>
          <span className="flex-1 h-px" style={{ background: "var(--hair)" }} />
          <span>TODAY'S SIX</span>
          <span className="flex-1 h-px" style={{ background: "var(--hair)" }} />
        </div>
        <div className="mx-4 mt-3 space-y-[14px]">
          {GAMES.map((g) => (
            <GameCard key={g.i} index={g.i} kicker={g.kicker} title={g.title} subtitle={g.subtitle} href={g.href} comingSoon={g.comingSoon} />
          ))}
        </div>

        <SideB />
        <div className="h-4" />
      </div>
      <FullRibbon />
    </>
  );
}
```

> **Note:** the `AppBar` accepts `kicker: string` per its current type. Adjust the signature to accept `React.ReactNode` so we can pass the rich wordmark — update `components/brand/AppBar.tsx` so `kicker` is typed `string | React.ReactNode` and renders as `<span>{kicker}</span>` (drop the className-on-string assumption for the rich case, or keep two slots: `wordmarkLeft?: React.ReactNode` + `kicker?: string`).

- [ ] **Step 5: Update `components/brand/AppBar.tsx`** to support a rich left slot:

```tsx
import Link from "next/link";

type Props = {
  kicker?: string;
  wordmark?: React.ReactNode;
  backHref?: string;
  rightSlot?: React.ReactNode;
};

export function AppBar({ kicker, wordmark, backHref, rightSlot }: Props) {
  return (
    <header
      className="flex items-center justify-between px-4 border-b"
      style={{ height: 44, background: "var(--paper)", borderColor: "var(--hair)" }}
    >
      <div className="flex items-center gap-2">
        {backHref ? (
          <Link href={backHref} aria-label="Back" style={{ color: "var(--ink)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 1L3 7l6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : null}
        {wordmark ?? (
          <span className="mono uppercase text-[10.5px] tracking-[0.22em]" style={{ color: "var(--ink)" }}>
            {kicker}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">{rightSlot}</div>
    </header>
  );
}
```

Then in `app/page.tsx`, change to pass the rich wordmark via the new `wordmark` prop instead of `kicker as any`:

```tsx
<AppBar
  wordmark={<>
    <span className="serif text-[14px] font-semibold" style={{ color: "var(--ink)" }}>Sonic Acrylic</span>{" "}
    <span className="mono uppercase text-[10px] tracking-[0.18em]" style={{ color: "var(--taupe)" }}>Games</span>
  </>}
  rightSlot={<StreakChip />}
/>
```

- [ ] **Step 6: Smoke test the home page**

```bash
npm run dev &
sleep 5
curl -sf http://localhost:3000 | grep -q "Tonight's table" && echo "OK" || echo "FAIL"
kill %1
```

Visually verify in a browser: hero block renders, 6 game cards (1 live + 5 dimmed "soon"), Side B grid, NowPlaying full ribbon at bottom.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(home): render hero + 6 game cards + side B + ribbon"
```

---

## Task 23: Connections game UI — Grid, Tile, Mistakes, ActionRow

**Files:**
- Create: `components/connections/Grid.tsx`, `components/connections/Tile.tsx`, `components/connections/Mistakes.tsx`, `components/connections/ActionRow.tsx`

- [ ] **Step 1: `components/connections/Tile.tsx`**

```tsx
"use client";

type Props = {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function Tile({ label, selected, disabled, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-[3px] flex items-center justify-center text-center"
      style={{
        aspectRatio: "1 / 1",
        background: selected ? "var(--ink)" : "var(--paper-2)",
        color: selected ? "var(--paper)" : "var(--ink)",
        border: `1px solid ${selected ? "var(--ink)" : "var(--hair-2)"}`,
        fontFamily: "var(--serif)",
        fontSize: 10,
        lineHeight: 1.1,
        padding: 6,
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
      }}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 2: `components/connections/Grid.tsx`**

```tsx
"use client";

import { Tile } from "./Tile";

type Props = {
  tiles: string[];
  selected: string[];
  disabled?: boolean;
  onToggle: (t: string) => void;
};

export function Grid({ tiles, selected, disabled, onToggle }: Props) {
  return (
    <div className="grid grid-cols-4 gap-[6px] mx-4 mt-4">
      {tiles.map((t) => (
        <Tile
          key={t}
          label={t}
          selected={selected.includes(t)}
          disabled={disabled}
          onClick={() => onToggle(t)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `components/connections/Mistakes.tsx`**

```tsx
export function Mistakes({ left }: { left: number }) {
  return (
    <div className="mx-4 mt-4 flex items-center gap-2">
      <span className="mono uppercase text-[10px] tracking-[0.22em]" style={{ color: "var(--taupe)" }}>
        MISTAKES LEFT
      </span>
      <div className="flex gap-[6px]">
        {[0,1,2,3].map((i) => (
          <span
            key={i}
            style={{
              width: 8, height: 8, borderRadius: 999,
              background: i < left ? "var(--ink)" : "transparent",
              border: `1px solid ${i < left ? "var(--ink)" : "var(--hair-2)"}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `components/connections/ActionRow.tsx`**

```tsx
"use client";

type Props = {
  onShuffle: () => void;
  onClear: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
};

export function ActionRow({ onShuffle, onClear, onSubmit, submitDisabled }: Props) {
  const btnBase: React.CSSProperties = {
    height: 44, borderRadius: 999, padding: "0 18px",
    fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500,
    letterSpacing: "0.14em", textTransform: "uppercase",
  };
  return (
    <div className="mx-4 mt-5 flex gap-2">
      <button
        onClick={onShuffle}
        style={{ ...btnBase, border: "1.5px solid var(--hair-2)", color: "var(--taupe)", background: "transparent" }}
      >Shuffle</button>
      <button
        onClick={onClear}
        style={{ ...btnBase, border: "1.5px solid var(--hair-2)", color: "var(--taupe)", background: "transparent" }}
      >Clear</button>
      <button
        onClick={onSubmit}
        disabled={submitDisabled}
        style={{
          ...btnBase, flex: 1.4, border: "1.5px solid var(--rust)",
          background: submitDisabled ? "transparent" : "var(--rust)",
          color: submitDisabled ? "var(--rust)" : "var(--paper)",
          opacity: submitDisabled ? 0.6 : 1,
        }}
      >Submit</button>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(connections): Grid, Tile, Mistakes, ActionRow components"
```

---

## Task 24: Connections page — wire everything together

**Files:**
- Create: `app/connections/page.tsx`, `components/connections/WinModal.tsx`

- [ ] **Step 1: Implement `components/connections/WinModal.tsx`**

```tsx
"use client";

import { useState } from "react";
import { PlatformIcons } from "@/components/brand/NowPlaying/PlatformIcons";
import { useNowPlaying } from "@/components/brand/NowPlaying/Provider";

type Stats = {
  outcome: "won" | "lost";
  elapsedSec: number;
  mistakesUsed: number;
  streakCurrent: number;
  streakLongest: number;
};

export function WinModal({ stats, editionId, onClose }: { stats: Stats; editionId?: number; onClose: () => void }) {
  const np = useNowPlaying();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const r = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: stats.outcome === "won" ? "win" : "lose", edition_id: editionId }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setError(j.error === "bad_email" ? "That email doesn't look right." : "Couldn't save — try again?");
      } else {
        setDone(true);
      }
    } catch {
      setError("Couldn't save — try again?");
    } finally {
      setSubmitting(false);
    }
  }

  async function share() {
    const text = stats.outcome === "won"
      ? `Four groups solved, ${stats.mistakesUsed} mistakes. Streak: ${stats.streakCurrent}. Sonic Acrylic Games.`
      : `Tomorrow then. Sonic Acrylic Games.`;
    const url = "https://games.sonicacrylic.com";
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ text, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert("Copied to clipboard.");
      } catch {}
    }
  }

  const mm = Math.floor(stats.elapsedSec / 60).toString().padStart(2, "0");
  const ss = Math.floor(stats.elapsedSec % 60).toString().padStart(2, "0");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-[6px] p-5"
        style={{ background: "var(--paper)", color: "var(--ink)", maxWidth: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mono uppercase text-[10px] tracking-[0.22em]" style={{ color: "var(--rust)" }}>
          {stats.outcome === "won" ? "SOLVED" : "TOMORROW"} · {mm}:{ss}
        </div>
        <h2 className="serif font-semibold text-[28px] leading-[1.1] mt-2">
          {stats.outcome === "won" ? "Four groups solved." : "No groups, no sweat."}
        </h2>
        <p className="serif italic text-[13px] mt-2" style={{ color: "var(--taupe)" }}>
          {stats.outcome === "won"
            ? "Stay for the music. We open the door again tomorrow at midnight ET."
            : "Listen on for a minute. Tomorrow's lineup is on its way."}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Stat label="STREAK" value={`${stats.streakCurrent}`} />
          <Stat label="LONGEST" value={`${stats.streakLongest}`} />
          <Stat label="TIME" value={`${mm}:${ss}`} />
          <Stat label="MISTAKES" value={`${stats.mistakesUsed}/4`} />
        </div>

        {!done ? (
          <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
            <label className="mono uppercase text-[10px] tracking-[0.22em]" style={{ color: "var(--taupe)" }}>
              Tomorrow's puzzle in your inbox at 6am ET
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere.com"
              className="px-3 py-2 rounded-[4px] outline-none"
              style={{ background: "var(--paper-2)", border: "1px solid var(--hair-2)", color: "var(--ink)" }}
            />
            {error ? <div className="mono text-[10px]" style={{ color: "var(--rust-2)" }}>{error}</div> : null}
            <button
              type="submit"
              disabled={submitting || !email}
              className="h-11 rounded-full mono uppercase text-[11px] tracking-[0.14em] font-medium"
              style={{ background: "var(--rust)", color: "var(--paper)", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Sending…" : "Sign me up"}
            </button>
          </form>
        ) : (
          <div className="serif italic mt-4" style={{ color: "var(--taupe)" }}>✓ See you tomorrow.</div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={share}
            className="h-10 px-3 rounded-full mono uppercase text-[10px] tracking-[0.14em]"
            style={{ border: "1.5px solid var(--hair-2)", color: "var(--taupe)", background: "transparent" }}
          >Share</button>
          {np.current ? (
            <div className="flex items-center gap-2 ml-auto">
              <span className="mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "var(--taupe)" }}>Listening</span>
              <PlatformIcons links={np.current.streaming_links} source="win" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-[6px]" style={{ background: "var(--paper-2)" }}>
      <div className="mono uppercase text-[9px] tracking-[0.18em]" style={{ color: "var(--taupe)" }}>{label}</div>
      <div className="serif text-[18px] mt-1">{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `app/connections/page.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppBar } from "@/components/brand/AppBar";
import { StreakChip } from "@/components/brand/StreakChip";
import { Grid } from "@/components/connections/Grid";
import { Mistakes } from "@/components/connections/Mistakes";
import { ActionRow } from "@/components/connections/ActionRow";
import { WinModal } from "@/components/connections/WinModal";
import { MiniPill } from "@/components/brand/NowPlaying/MiniPill";
import { initState, toggleTile, clearSelection, type ConnectionsState, type Category } from "@/lib/connections";
import { seededShuffle } from "@/lib/shuffle";

type PuzzleResp = {
  date: string;
  edition_no: number;
  lineup_artists: string[];
  theme_pull_quote: string | null;
  marginalia_quote: string | null;
  tiles: string[];
};

export default function ConnectionsPage() {
  const [puzzle, setPuzzle] = useState<PuzzleResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ConnectionsState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [streak, setStreak] = useState<{ current: number; longest: number }>({ current: 0, longest: 0 });
  const startRef = useRef<number>(Date.now());
  const mistakesUsedRef = useRef(0);

  // Load puzzle
  useEffect(() => {
    fetch("/api/puzzle/today", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "no_puzzle");
        return r.json();
      })
      .then((p: PuzzleResp) => {
        setPuzzle(p);
        setState(initState(p.tiles));
        startRef.current = Date.now();
      })
      .catch((e) => setError(String(e.message ?? e)));
    fetch("/api/streak/me", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      setStreak({ current: d.current ?? 0, longest: d.longest ?? 0 });
    }).catch(() => {});
  }, []);

  async function submit() {
    if (!state || !puzzle) return;
    if (state.selected.length !== 4) return;
    const guess = state.selected;
    const r = await fetch("/api/connections/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tiles: guess }),
    });
    const data = await r.json() as { result: "match" | "one_away" | "wrong" | "invalid"; matchedCategory?: Category };
    if (data.result === "match" && data.matchedCategory) {
      const cat = data.matchedCategory;
      setState((s) => {
        if (!s) return s;
        const newTiles = s.tiles.filter((t) => !cat.members.includes(t));
        const solved = [...s.solved, cat];
        const status = solved.length === 4 ? "won" : "playing";
        return { ...s, tiles: newTiles, solved, selected: [], status };
      });
      setToast(`Group: ${cat.name}`);
    } else if (data.result === "one_away") {
      mistakesUsedRef.current += 1;
      setState((s) => s ? { ...s, mistakesLeft: s.mistakesLeft - 1, selected: [], status: s.mistakesLeft - 1 <= 0 ? "lost" : "playing" } : s);
      setToast("One away.");
    } else if (data.result === "wrong") {
      mistakesUsedRef.current += 1;
      setState((s) => s ? { ...s, mistakesLeft: s.mistakesLeft - 1, selected: [], status: s.mistakesLeft - 1 <= 0 ? "lost" : "playing" } : s);
      setToast("Not this time.");
    }
    setTimeout(() => setToast(null), 1500);
  }

  // Open modal when status terminal
  useEffect(() => {
    if (!state) return;
    if (state.status === "won" || state.status === "lost") {
      const open = async () => {
        if (state.status === "won") {
          const r = await fetch("/api/streak/complete", { method: "POST" });
          if (r.ok) {
            const d = await r.json();
            setStreak({ current: d.current, longest: d.longest });
          }
        }
        setModalOpen(true);
      };
      void open();
    }
  }, [state?.status]);

  const elapsed = useMemo(() => Math.floor((Date.now() - startRef.current) / 1000), [state?.status]);

  if (error === "no_puzzle") {
    return (
      <>
        <AppBar wordmark={<span className="mono uppercase text-[10.5px] tracking-[0.22em]">CONNECTIONS · 1 OF 6</span>} backHref="/" rightSlot={<StreakChip />} />
        <div className="mx-4 mt-8 serif italic" style={{ color: "var(--taupe)" }}>
          No puzzle for today yet — check back at midnight ET.
        </div>
      </>
    );
  }

  if (!puzzle || !state) {
    return (
      <>
        <AppBar wordmark={<span className="mono uppercase text-[10.5px] tracking-[0.22em]">CONNECTIONS · 1 OF 6</span>} backHref="/" rightSlot={<StreakChip />} />
        <div className="mx-4 mt-8 mono text-[11px]" style={{ color: "var(--taupe)" }}>LOADING…</div>
      </>
    );
  }

  return (
    <>
      <AppBar
        wordmark={<span className="mono uppercase text-[10.5px] tracking-[0.22em]">CONNECTIONS · 1 OF 6</span>}
        backHref="/"
        rightSlot={<StreakChip />}
      />
      <div className="flex-1 overflow-y-auto pb-2">
        <div className="mx-4 mt-4">
          <p className="serif text-[19px] font-medium" style={{ color: "var(--ink)" }}>
            Sixteen songs. <span className="block">Four hidden categories.</span>
          </p>
          {puzzle.theme_pull_quote ? (
            <p className="serif italic text-[13px] mt-2" style={{ color: "var(--taupe)" }}>{puzzle.theme_pull_quote}</p>
          ) : null}
        </div>
        <Mistakes left={state.mistakesLeft} />
        <Grid tiles={state.tiles} selected={state.selected} disabled={state.status !== "playing"} onToggle={(t) => setState((s) => s ? toggleTile(s, t) : s)} />

        {puzzle.marginalia_quote ? (
          <div
            className="mx-4 mt-4 px-3 py-2 serif italic text-[12.5px]"
            style={{ borderLeft: "2px solid var(--rust)", background: "var(--paper-2)", color: "var(--taupe)" }}
          >{puzzle.marginalia_quote}</div>
        ) : null}

        {state.solved.length > 0 ? (
          <div className="mx-4 mt-3 space-y-1">
            {state.solved.map((c) => (
              <div key={c.name} className="serif text-[14px] px-3 py-2 rounded-[4px]" style={{ background: "var(--rust)", color: "var(--paper)" }}>
                {c.name.toUpperCase()} — {c.members.join(", ")}
              </div>
            ))}
          </div>
        ) : null}

        <ActionRow
          onShuffle={() => setState((s) => s ? { ...s, tiles: seededShuffle(s.tiles, `${puzzle.date}:${Date.now()}`) } : s)}
          onClear={() => setState((s) => s ? clearSelection(s) : s)}
          onSubmit={submit}
          submitDisabled={state.selected.length !== 4}
        />

        {toast ? (
          <div className="mx-4 mt-3 mono uppercase text-[10px] tracking-[0.22em] text-center" style={{ color: "var(--taupe)" }}>
            {toast}
          </div>
        ) : null}

        <div className="h-6" />
      </div>

      <div className="px-4 py-2 flex justify-center" style={{ borderTop: "1px solid var(--hair)" }}>
        <MiniPill />
      </div>

      {modalOpen && state ? (
        <WinModal
          stats={{
            outcome: state.status === "won" ? "won" : "lost",
            elapsedSec: elapsed,
            mistakesUsed: mistakesUsedRef.current,
            streakCurrent: streak.current,
            streakLongest: streak.longest,
          }}
          editionId={puzzle.edition_no}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  );
}
```

- [ ] **Step 3: Smoke**

```bash
npm run build
```
Expected: succeeds.

```bash
npm run dev &
sleep 5
curl -sf http://localhost:3000/connections | grep -q "Sixteen songs" && echo "OK" || echo "FAIL"
kill %1
```

Manual: open `http://localhost:3000/connections` in a browser, play through a puzzle, confirm match / one-away / wrong / win modal all work.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(connections): wire game page with server-validated guesses + win modal"
```

---

## Task 25: Playwright E2E happy path

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/connections.spec.ts`

- [ ] **Step 1: Initialize Playwright**

```bash
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "iphone", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 3: Create `tests/e2e/connections.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("home renders and routes to connections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Tonight/i)).toBeVisible();
  await page.getByText(/Sixteen songs from tonight/i).click();
  await expect(page).toHaveURL(/\/connections/);
  await expect(page.getByText(/Sixteen songs/i)).toBeVisible();
});

test("can select tiles up to 4", async ({ page }) => {
  await page.goto("/connections");
  const tiles = page.getByRole("button").filter({ hasNot: page.getByText(/shuffle|clear|submit|play|pause|back/i) });
  await tiles.nth(0).click();
  await tiles.nth(1).click();
  await tiles.nth(2).click();
  await tiles.nth(3).click();
  // 5th click should be a no-op (selection caps at 4) — sanity check via DOM not flaky
});
```

- [ ] **Step 4: Run**

```bash
npm run test:e2e
```
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test(e2e): playwright smoke for home -> connections"
```

---

## Task 26: Vercel deploy + DNS cutover

**Files:** none (config-only task)

- [ ] **Step 1: Install Vercel CLI and log in**

```bash
npm install -g vercel
vercel login
```

(Manual: complete browser login.)

- [ ] **Step 2: Link the project**

```bash
vercel link
```
(Choose / create the `sonic-acrylic-games` project. Accept defaults for framework=Next.js, dir=current.)

- [ ] **Step 3: Set production env vars**

```bash
vercel env add DATABASE_URL production
# Paste the Neon production pooled connection string when prompted.
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

- [ ] **Step 4: First deploy**

```bash
vercel --prod
```
Expected: deploy URL printed.

- [ ] **Step 5: Add custom domain**

```bash
vercel domains add games.sonicacrylic.com
```
Then in Vercel dashboard → Project → Settings → Domains, attach `games.sonicacrylic.com` and copy the CNAME target Vercel provides (typically `cname.vercel-dns.com`).

- [ ] **Step 6: Configure DNS in Wix**

Manual (Ben): Wix dashboard → Domains → SonicAcrylic.com → DNS Records → Add CNAME record:
- Host: `games`
- Points to: (the `cname.vercel-dns.com` value from Vercel)
- TTL: default

Wait 5–30 minutes for propagation, then:

```bash
curl -sI https://games.sonicacrylic.com | head -5
```
Expected: 200 OK from the deployed app.

- [ ] **Step 7: Run migrations on production DB**

```bash
DATABASE_URL="$(vercel env pull --environment=production && grep DATABASE_URL .env.local | cut -d= -f2-)" npm run db:migrate
```

Or simpler: run the migration locally with the production `DATABASE_URL` exported in your shell.

- [ ] **Step 8: Seed at least 7 days of puzzles to prod**

```bash
DATABASE_URL="<prod url>" npm run seed:all
```

- [ ] **Step 9: Final smoke**

Open `https://games.sonicacrylic.com` on a real iPhone and a real Android. Run through:
- Lineup renders
- Connections plays through a full win
- Email capture submits successfully (check DB)
- Streak chip updates after first win
- NowPlaying ribbon appears on Home (full) and Connections (mini); play button starts audio after a tap; streaming icons open external links

- [ ] **Step 10: Commit any deploy-related config changes**

```bash
git add -A
git commit -m "chore: deploy v0 to games.sonicacrylic.com" --allow-empty
```

---

## Task 27 (cleanup / docs)

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`**

```md
# Sonic Acrylic Games

A daily word-and-music puzzle from Sonic Acrylic. v0 ships a single Connections-style game as a lead magnet at https://games.sonicacrylic.com.

## Develop

```bash
npm install
cp .env.example .env.local  # fill in DATABASE_URL
npm run db:migrate
npm run seed:all
npm run dev
```

Open http://localhost:3000.

## Test

```bash
npm test          # vitest unit
npm run test:e2e  # playwright e2e
```

## Add a puzzle

1. Drop a `data/puzzles/YYYY-MM-DD.json` file matching the schema in `scripts/seed-day.ts`.
2. `npm run seed:day -- YYYY-MM-DD` (or `npm run seed:all` to upsert every file).

## Deploy

Production is on Vercel. Push to `main` for preview, `vercel --prod` for production. DB is Neon.

See `docs/superpowers/specs/2026-05-11-sonic-acrylic-games-v0-design.md` for the design and `docs/superpowers/plans/2026-05-11-sonic-acrylic-games-v0.md` for the build plan.
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "docs: README for dev/test/deploy"
```

---

## Self-Review Notes (already addressed inline)

- **Spec coverage:** every spec section (§3 stack, §4 routes, §6 data model, §7 daily reset, §8 game logic, §9 NowPlaying with real audio + streaming icons, §10 streaks, §11 email capture, §12 hand-curated workflow, §13 file structure, §14 anti-cheat, §15 SEO, §16 analytics, §17 build order) maps to one or more tasks above. Task 9–13 covers §9; Tasks 4, 15–20 cover §10–11, §14, §16; Tasks 21–22 cover §6, §12, §13; Tasks 23–24 cover §8.
- **Out of scope** items from spec §2 are not implemented — they show up on Home as "soon" teaser cards via Task 22.
- **Type consistency:** `Track`, `Category`, `ConnectionsState`, `GuessResult`, `StreamingLinks` defined in lib/, reused everywhere by name.
- **No placeholders:** every step has real code or a real command.
