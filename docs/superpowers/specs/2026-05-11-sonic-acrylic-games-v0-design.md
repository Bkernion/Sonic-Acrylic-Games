# Sonic Acrylic Games — v0 Design Spec

**Date:** 2026-05-11
**Status:** Approved scope, pending written-spec review
**Author:** Ben Kernion + Claude

---

## 1. Goal & framing

Ship `games.sonicacrylic.com` as a daily Connections-style word puzzle that doubles as a lead magnet for Ben Kernion's musician brand (Sonic Acrylic). Fans land via Instagram bio link, play one puzzle, hand over an email at the win screen, and listen to Ben's music in the persistent NowPlaying ribbon with one-tap deeplinks to Spotify, Apple Music, YouTube Music, and Bandcamp.

The full design (8 games, leaderboards, tip jar, RN port) is documented in `design_handoff_sonic_acrylic_games/README.md` and remains the long-term target. **v0 is intentionally a tight slice** — Connections + brand chrome + email capture + audio + streaming deeplinks — shipped as fast as possible to start growing the list. Subsequent games drop as separate staged releases.

## 2. Out of scope for v0

- Other 5 games (Spell, Lyric, Attribute, Chronology, Influence) — visible on Home as "coming soon" cards
- Auth / accounts / sign-in
- Leaderboards (needs accounts to be meaningful)
- Tip jar (Stripe integration deferred)
- Automated 150-artist content pipeline — puzzles hand-curated for v0
- React Native port
- App Store / Play Store
- Tip jar, share-image generation
- The "Editorial" palette — the handoff README listed it as production, but Ben has confirmed **Cobalt Psychedelic is the production palette**

## 3. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16 App Router** | SSR for SEO on lineup; API routes for capture/streak; matches future React Native port (shared logic via packages) |
| Hosting | **Vercel** | Hobby tier; subdomain via CNAME from Wix DNS |
| Styling | **Tailwind CSS** | Tokens from handoff `midfi/tokens.css` loaded as CSS custom properties on `:root` |
| Fonts | **Newsreader / IBM Plex Sans / IBM Plex Mono** | via `next/font/google` |
| Database | **Postgres (Neon, via Vercel Storage)** | Stores daily puzzles, email captures, anonymous streak records |
| Email capture | **Postgres only (no ESP yet)** | List lives in our DB; ESP wired in v0.1 when first send is ready |
| Audio | **HTML5 `<audio>` element in root layout** | Tap-to-start (mobile autoplay blocked); persists across route changes |
| Auth | **None** | Cookie-based anonymous `device_id` for streak |

## 4. Routes

- **`/`** — Home (newsfeed). Today's lineup hero, Connections card (playable), other 5 game cards labeled "Coming soon" with target drop dates.
- **`/connections`** — Connections puzzle screen.
- **Win/lose modal** — overlay on `/connections`, not a separate route. Keeps shareable URL clean.

## 5. Visual language

- **Cobalt Psychedelic palette** is production (per handoff `tokens.css`):
  - `--paper: #FFF1DE`, `--paper-2: #FCD8B5`, `--ink: #1F5FA8`, `--rust: #E63ABD` (magenta accent), `--taupe: #4A8BD9`
  - Body bg = three layered radial-gradient blooms (orange, magenta, cyan) on cream
  - CTA buttons = linear-gradient magenta → tangerine
- Typography per handoff §Typography (Newsreader for serif display, Plex Sans for body, Plex Mono uppercased + letter-spaced for kickers).
- Spacing, radii, borders, shadows: reproduce handoff `tokens.css` exactly.
- 380×800 baseline; scale up gracefully for larger phones and tablets. Desktop = mobile-shaped viewport centered on the page (max-width ~440px with surrounding "stage" background).

## 6. Data model

```sql
-- Daily puzzles, hand-curated and seeded via script
CREATE TABLE daily_puzzles (
  date DATE PRIMARY KEY,                     -- ET-local date
  edition_no INTEGER NOT NULL UNIQUE,        -- monotonic ED.412 counter
  lineup_artists JSONB NOT NULL,             -- ["Artist A", ..., "Artist E"]
  theme_pull_quote TEXT,                     -- italic taupe blurb on home hero
  connections_categories JSONB NOT NULL,     -- [{name, difficulty: 1-4, members: [4 titles]}, ...] x4
  connections_tiles JSONB NOT NULL,          -- shuffled 16 titles, server-shuffled once and frozen so all users see same order
  marginalia_quote TEXT                      -- the rust-bordered hint quote on the puzzle screen
);

-- Email captures (no ESP integration yet — just our list)
CREATE TABLE email_captures (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT,                               -- 'win' | 'home' | 'lose' etc.
  edition_id INTEGER REFERENCES daily_puzzles(edition_no),
  device_id TEXT
);
CREATE UNIQUE INDEX email_captures_email_key ON email_captures(LOWER(email));

-- Anonymous streak records, keyed by device cookie
CREATE TABLE streaks (
  device_id TEXT PRIMARY KEY,
  current INTEGER DEFAULT 0,
  longest INTEGER DEFAULT 0,
  last_completed_date DATE,
  email TEXT                                 -- nullable; populated when user opts in
);
```

## 7. Daily reset

- Single fixed timezone: **America/New_York**.
- "Today's puzzle" = the row with `date = current-ET-date`.
- A user who starts a puzzle near midnight and crosses the boundary keeps playing the puzzle they started (state lives client-side); the next visit fetches the new day's puzzle.

## 8. Game logic — Connections

Per handoff §02:

- 16 tiles in a 4×4 grid, square aspect, 6px gap. Server-frozen shuffle order (same for all users that day).
- Tap to select up to 4 tiles. Selected = ink-solid bg with paper text.
- SUBMIT button (primary, rust-filled, flex 1.4). SHUFFLE and CLEAR are secondary ghost buttons.
- 4 mistakes total. "MISTAKES LEFT" row with 4 dots (filled = remaining).
- Submit logic:
  - All 4 selected belong to same hidden group → reveal that group (animated row collapse into a banner, color-coded by difficulty), auto-shuffle remaining tiles.
  - "One away" (3 of 4 match a group) → toast "One away" + count as mistake.
  - Wrong → count as mistake, shake animation.
- 4 mistakes used → lose state. Show the answer reveal sequence with all 4 groups in order, then the win/lose modal in lose mode.
- 4 groups solved → win state, modal opens.

## 9. NowPlaying ribbon (full + mini)

**Persistent across route changes.** Implemented as a client component in `app/layout.tsx`, with state held in a React Context (or Zustand).

- **Audio source:** HTML5 `<audio>` element with playlist of MP3s served from `/public/audio/`. Ben supplies 5–10 tracks.
- **Tracks config:** `lib/tracks.json` — each entry has `id`, `title`, `file`, `duration_sec`, `streaming_links: { spotify, apple_music, youtube_music, bandcamp }` (any subset).
- **First visit:** equalizer paused, play button shows "▶". On tap, audio starts (user-gesture unlock for mobile autoplay). Subsequent visits resume paused-by-default until tapped.
- **Equalizer:** 5 CSS-animated bars, scaleY 0.5↔1, staggered durations 1.2s → 1.6s ease-in-out infinite. Animation paused when `<audio>` is paused.
- **Streaming icons row:** Spotify · Apple Music · YouTube Music · Bandcamp. Tap → opens that platform's link for the *current* track in a new tab. Hidden if that platform doesn't have a link for that track.
- **Full variant:** on `/` (Home) and Win modal — 60px tall, track title in serif italic, artist/genre in mono caps, time on right, all four streaming icons inline.
- **Mini-pill variant:** on `/connections` — paper-2 pill with 18px play button, equalizer, track title only. Tap the pill to expand to full (overlay).
- **Auto-advance:** at track end, advance to next in playlist. Loop after last.
- **Position persistence:** save current track index + position-in-seconds to `localStorage` so it resumes where it left off across reloads.

## 10. Streak logic

- On first visit, generate `device_id` (uuid v4) and store in a long-lived cookie (1 year, httpOnly false so client can read it; that's fine — no auth secrets here).
- Connections completion (win) → POST `/api/streak/complete` with `device_id` and today's ET date.
  - If `last_completed_date = yesterday` → `current += 1`.
  - If `last_completed_date = today` → no-op (already counted).
  - Else → `current = 1`.
  - Update `longest = max(longest, current)`.
- Connections loss → no streak change.
- Streak chip on AppBar reads `current` from a `/api/streak/me` call on mount.
- When email captured at win → patch the `streaks.email` column for this device_id. From here on, the email becomes the durable identity; if Ben later builds accounts, we migrate device_id → email cleanly.

## 11. Email capture flow

- Win modal: primary CTA field "Tomorrow's puzzle in your inbox at 6am ET" + email input + submit button. Below it, secondary CTAs: Spotify follow / Apple Music follow / share.
- Submit → `POST /api/capture { email, source: 'win', edition_id, device_id }`.
- Server: validate email format, lowercase, upsert by `LOWER(email)`, set `streaks.email` for the device.
- Response: success → swap form for "✓ See you tomorrow." Idempotent on resubmit.
- Optional small text under win-modal CTAs: "Already signed up — your streak is saved" with subtle confirm icon if email already on file for this device.
- **Share button** (secondary CTA): uses the browser Web Share API if available (mobile), else falls back to copying a plain-text share string to clipboard with a toast confirmation. No generated PNG card in v0 — text + URL only.

## 12. Hand-curated puzzle workflow

- `data/puzzles/YYYY-MM-DD.json` — one file per day. Schema matches the `daily_puzzles` table columns.
- `npm run seed-day -- YYYY-MM-DD` reads the JSON and upserts into Postgres.
- `npm run seed-week` (helper) uploads all files in `data/puzzles/` whose date is within ±7 days.
- Ben can write puzzles in advance and Claude can help draft each day's puzzle as part of normal workflow.

## 13. File / folder structure

```
sonic-acrylic-games/
├── app/
│   ├── layout.tsx              # Root: NowPlayingProvider, AppShell, fonts, gradient bg
│   ├── page.tsx                # Home (newsfeed)
│   ├── connections/
│   │   └── page.tsx            # Connections puzzle
│   ├── api/
│   │   ├── capture/route.ts    # Email capture POST
│   │   ├── streak/
│   │   │   ├── me/route.ts     # GET current device's streak
│   │   │   └── complete/route.ts # POST mark complete (called on win)
│   │   ├── puzzle/today/route.ts # GET today's puzzle (lineup, tiles, theme — no categories/answers)
│   │   └── connections/check/route.ts # POST a 4-tile guess, server returns match/one-away/wrong + revealed category if match
│   └── globals.css             # Imports tokens, sets up gradient body bg
├── components/
│   ├── brand/
│   │   ├── AppBar.tsx
│   │   ├── StreakChip.tsx
│   │   └── NowPlaying/
│   │       ├── Provider.tsx    # Context + audio element + queue logic
│   │       ├── FullRibbon.tsx
│   │       └── MiniPill.tsx
│   ├── connections/
│   │   ├── Grid.tsx
│   │   ├── Tile.tsx
│   │   ├── Mistakes.tsx
│   │   ├── ActionRow.tsx
│   │   └── WinModal.tsx
│   └── home/
│       ├── Hero.tsx
│       ├── GameCard.tsx
│       └── SideB.tsx
├── lib/
│   ├── db.ts                   # Postgres client
│   ├── tracks.json             # NowPlaying queue config
│   ├── device.ts               # device_id cookie read/write
│   └── date.ts                 # ET-now / ET-today helpers
├── data/
│   └── puzzles/                # YYYY-MM-DD.json hand-curated puzzles
├── scripts/
│   └── seed-day.ts
├── public/
│   └── audio/                  # MP3s
└── docs/
    └── superpowers/specs/      # This spec lives here
```

## 14. Anti-cheating considerations (lightweight, v0)

- Connections category answers stay server-side until a guess is submitted. `GET /api/puzzle/today` returns `{ lineup_artists, theme_pull_quote, marginalia_quote, tiles: [16 shuffled titles] }` — no category data. `POST /api/connections/check { tiles: [4 titles], device_id }` returns `{ result: 'match' | 'one_away' | 'wrong', category?: {name, difficulty, members} }` — category is only revealed when the guess is correct.
- Not airtight (a determined user can replay the check API). Worth doing for the 95% honest case; not worth doing PoW or rate-limited puzzle delivery for v0.

## 15. SEO + share metadata

- `<title>` = "Sonic Acrylic Games — TUE NOV 11 · ED.412"
- OG image: a static branded card at first ("Sonic Acrylic Games / Daily" on Cobalt gradient). v0.1: per-day generated OG with the day's serif headline.
- Open Graph + Twitter cards configured in `app/layout.tsx`.

## 16. Analytics

- **Vercel Web Analytics** (built-in, free) — page views, top referrers, geo.
- Custom events via lightweight `/api/event` endpoint logging to a `events` table: `puzzle_started`, `puzzle_solved`, `puzzle_lost`, `email_captured`, `streaming_click_<platform>`. Cheap, owned, queryable.

## 17. Build order

1. **Scaffold** — Next.js 16 + Tailwind + tokens + fonts + Vercel deploy + DNS for `games.sonicacrylic.com`.
2. **Brand chrome** — AppBar + Streak chip + NowPlaying provider/full/mini (audio queue logic, streaming-icon row).
3. **Home screen** — Hero + 6 game cards (1 live, 5 teaser).
4. **Connections** — Grid + Tile + Mistakes + ActionRow, full game state machine, server validation.
5. **Win/Lose modal** — stats grid, streak strip, email capture form, streaming CTAs, share.
6. **Puzzle seeding** — `data/puzzles/` + `seed-day` script + 5–10 hand-curated days ready to go.
7. **QA** — real mobile devices (iOS Safari + Android Chrome), audio behavior, autoplay edge cases, streak persistence, email capture idempotency.
8. **Ship** — point Wix DNS, soft-launch.

## 18. Open items deferred to later versions

- ESP wiring (ConvertKit or Beehiiv) when first send is ready
- Other 5 games as v0.x staged drops
- Leaderboards + accounts (likely v1)
- Tip jar (v1)
- Automated puzzle pipeline (v2)
- React Native + native apps (v2)
- Push notifications, friend system, social graph

## 19. Assets Ben needs to supply during build

- **Music tracks**: 5–10 MP3/M4A files for the NowPlaying queue.
- **Streaming links per track**: Spotify / Apple Music / YouTube Music / Bandcamp URLs.
- **First batch of puzzle content**: 5 artists per day + 16 song titles in 4 groups, for at least 7–14 days before launch. We can co-author these.
- **Streak chip seed**: just visual — no asset needed.
- **OG image**: I can draft this; Ben confirms direction.
