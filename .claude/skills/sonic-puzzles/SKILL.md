---
name: sonic-puzzles
description: Generate daily Sonic Acrylic Games Connections puzzles in batches. Use when Ben says "make tomorrow's puzzle", "generate the next N days", "/sonic-puzzles", "let's batch puzzles", or anything similar. Pulls real song titles + years from Spotify, proposes 5 candidate puzzles per day, Ben picks, you write the JSONs and seed.
---

# Sonic Acrylic Games — daily puzzle batcher

You are coaching Ben through a batch generation of daily Connections puzzles. Ben picks the editorial calls (which candidate to ship, what to rename a category). You do all the mechanical work: sampling artists, fetching catalogs, proposing puzzles, writing JSONs, seeding the DB, deploying.

## The contract — what a "good" Connections puzzle looks like

- **Exactly 4 categories**, each with **exactly 4 song titles** drawn from the day's 5 artists.
- All 16 song titles must be **real and verifiable** in the cached Spotify catalogs you read. Never invent a title; never use a track that isn't in the data.
- Categories must be **clever, not lazy**. The bar is:
  - Bad: "Songs with the word 'love'" / "Songs by Phoebe Bridgers"
  - Good: "Track 1 from a debut LP" / "Released in 2007" / "Title is a place" / "Songs over 6 minutes" / "Title is one word"
  - Great: "Each title is a kind of weather" / "Songs about goodbyes" / "Covers on the original album" / "All from records the band only plays live"
- The 4 categories should span the 5 artists — not all from the same artist, ideally. A puzzle where every category is "songs by [one band]" is not a puzzle.
- Difficulty tiers (the player sees these as color bands on win/loss):
  - 1 (easiest): obvious shared theme — released the same year, all from one album, etc.
  - 2: shared structural feature — track number, word count in title, etc.
  - 3: shared thematic feature — songs about a person, songs in a movie, etc.
  - 4 (hardest): clever lateral connection — songs whose titles are also album names by other artists, songs that share a producer, etc. Reach.
- Difficulty 1 and 2 should be solvable by a casual fan. 3 and 4 reward deep listening.

## Run mode

When invoked, ask Ben:
1. **Start date** (default: the first ET date with no seeded puzzle yet — check `data/puzzles/` for the latest YYYY-MM-DD.json)
2. **How many days?** (default: 14)

Then proceed.

## Step 1 — Sample all the lineups

```bash
cd "/Volumes/Ben's SSD 1/KCL Products/Sonic Acrylic Games"
npm run sample -- <start-date> --range <N>
```

This prints an array of `{ date, decade, artists }` objects, date-seeded so the same date always picks the same lineup, with a 14-day artist cooldown. Save it mentally / in a TodoWrite.

Show Ben the full list (just dates + decades + artists) in a tight format. Let him veto any lineup ("re-roll 5/18", "swap Nickelback for Tool", etc.). When he asks for a re-roll, just hand-pick a substitute from the same decade in `data/artists.json` — don't try to rerun the script for one date (it's date-seeded, would produce the same result).

## Step 2 — Make sure every artist's catalog is cached

For every unique artist across all lineups, check `data/catalogs/<slug>.json`. If missing, fetch:

```bash
npm run catalog -- "<Artist Name>"
```

Be patient — Spotify rate-limits at ~180 calls/min. You can run multiple `npm run catalog` in serial; the script handles 429s automatically. Across ~70 unique artists in a 14-day batch, expect ~5–8 minutes of API time.

## Step 3 — For each day, propose 5 candidate puzzles

For day D with artists [A, B, C, D, E]:

1. Read each artist's distilled catalog:
   ```bash
   npm run distill -- "<artist>"
   ```
   This gives you the artist's studio albums with track names + years.

2. Look for **patterns and overlaps** across the 5 catalogs:
   - Shared release years (multiple artists with albums in 2020)
   - Shared track numbers (multiple "Track 1"s)
   - Shared title structures (one-word, two-word, all-caps in source)
   - Thematic overlaps (places, weather, names, body parts, colors)
   - Genre/structural patterns (live albums, covers, instrumentals)

3. **Compose 5 candidate puzzles**. Each candidate must have:
   - 4 categories with clever names
   - 4 verified-real song titles per category
   - Difficulty tier (1–4) on each category
   - Each song appears in exactly one category (no overlap across categories within a candidate)

4. Show all 5 candidates to Ben in a compact format:

   ```
   Candidate A — "Two-word titles"
     [1] Track 1s from debut albums — Smoke Signals, Funeral, ...
     [2] One-word titles — Punisher, Funeral, ...
     [3] Released in 2020 — Punisher, ...
     [4] Songs longer than 5 minutes — ICU, ...

   Candidate B — ...
   ```

5. Ben says "B" (or "A with the second category renamed to X" or "redo, none of these"). If he wants edits, apply them. If he wants a re-do, propose 5 NEW candidates with a different angle.

## Step 4 — Write the JSON and move to the next day

When Ben picks a candidate, write `data/puzzles/YYYY-MM-DD.json` matching the schema in `scripts/seed-day.ts`:

```json
{
  "date": "2026-05-14",
  "edition_no": 4,
  "lineup_artists": ["Artist A", "Artist B", "Artist C", "Artist D", "Artist E"],
  "theme_pull_quote": null,
  "marginalia_quote": null,
  "connections_categories": [
    { "name": "CATEGORY NAME", "difficulty": 1, "members": ["Song 1", "Song 2", "Song 3", "Song 4"] },
    ...
  ]
}
```

- **`edition_no`**: read the highest `edition_no` from the most recent existing puzzle JSON in `data/puzzles/`, then increment by 1 for each new day (so 5/14 = 4, 5/15 = 5, etc.). Don't restart from 1.
- **`theme_pull_quote`** and **`marginalia_quote`**: leave `null`. Ben removed the marginalia note from the live UI; theme quote is unused right now.
- **`connections_categories`**: 4 entries, difficulty 1 (easy) → 4 (hard). Members must be the EXACT song titles as they appear in the Spotify catalog (case + punctuation matter for the in-game tile rendering and the `/api/connections/check` validation).
- Track each title against the cached catalog to catch typos before saving.

Move to the next day, repeat.

## Step 5 — When all days are written, seed + deploy

```bash
cd "/Volumes/Ben's SSD 1/KCL Products/Sonic Acrylic Games"
npm run seed:all                                              # upserts every JSON in data/puzzles/
git add data/puzzles/ data/artists.json data/catalogs/*       # catalogs are gitignored — only commit the puzzles
git status --short                                            # sanity-check before commit
git commit -m "data: seed puzzles 2026-05-14 through 2026-05-DD"
npx vercel --prod --yes                                       # deploy so the puzzles are live the moment ET midnight rolls
```

## Cheat sheet — what to watch for

- **Title matching is exact**: "Moon Song" must be exactly that — not "Moon Song." or "Moonsong" or "Moon song (Live)". Copy directly from the distilled catalog output.
- **Don't reuse titles across categories within a puzzle** (one song = one category).
- **Don't repeat the same artist as the source for all 4 members of a category** — try to spread. (E.g., "Songs that sound like the album titles" should pull 1 from each of 4 different artists ideally.)
- **Watch for "feat." tracks and remixes** — they often live as separate Spotify entries from the canonical track. Use the canonical version (album track) over the remix when possible.
- **Skip days where the lineup is too weak to puzzle from** — if 4 of the 5 artists have only 1 album and very short catalogs, ask Ben to swap one artist for a deeper-catalog pick from the same decade.
- **Edition numbering**: don't reset. Look at `data/puzzles/` for the latest edition_no, increment.

## Anti-patterns — flag these to Ben out loud

If Ben pushes a candidate where:
- Any title is NOT in the cached catalog → say so, refuse to ship it, suggest the closest real title.
- All 4 categories pull from only 1 or 2 artists (rather than spreading across the 5) → suggest a different cut so the puzzle reads as ABOUT the lineup, not about one band.
- A category is mechanically lazy ("songs with the word 'I'", "songs by X") → suggest a sharper angle.

## Commit/deploy hygiene

After seeding + committing, verify the live URL returns 200:
```bash
curl -sSI https://games.sonicacrylic.com | head -2
```
And smoke-test today's puzzle endpoint:
```bash
curl -sS https://games.sonicacrylic.com/api/puzzle/today | python3 -c "import sys,json; d=json.load(sys.stdin); print('edition:', d.get('edition_no'), '| lineup:', d.get('lineup_artists'))"
```
