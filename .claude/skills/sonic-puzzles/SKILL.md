---
name: sonic-puzzles
description: Generate daily Sonic Acrylic Games Connections puzzles in batches. Use when Ben says "make tomorrow's puzzle", "generate the next N days", "/sonic-puzzles", "let's batch puzzles", or anything similar. Pulls real song titles + years from Deezer, proposes 5 candidate puzzles per day, Ben picks, you write the JSONs and seed.
---

# Sonic Acrylic Games — daily puzzle batcher

You are coaching Ben through a batch generation of daily Connections puzzles. Ben picks the editorial calls (which candidate to ship, what to rename a category). You do all the mechanical work: sampling artists, fetching catalogs, proposing puzzles, writing JSONs, seeding the DB, deploying.

## The contract — what a "good" Connections puzzle looks like

- **Exactly 4 categories**, each with **exactly 4 song titles** drawn from the day's 5 artists.
- All 16 song titles must be **real and verifiable** in the cached Deezer catalogs you read. Never invent a title; never use a track that isn't in the data.
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

## Novelty rules — read before proposing anything

The single fastest way to lose a daily-puzzle audience is repetition. Three hard rules:

### Rule 1 — No category NAME reuse within 180 days

Run `npm run history -- 180` before proposing for any day. The output lists every category name shipped in the last 180 days (≈ 6 months). If your candidate's name appears in that list (or trivially close — "Title is a place" vs "Title is a state" are the same name), **discard it and pick something else**.

### Rule 2 — No category PATTERN reuse within 30 days

Patterns are bigger than names. "Released in 2020", "Released in 1973", and "Released the same year" are three different names but the SAME pattern (release-year grouping). If any pattern has been used in the last 30 days, push it to the bottom of the list. If 2+ days within the last 30 used a pattern, do not use that pattern for the next 30 days.

Patterns to track (this is not exhaustive — invent new ones):
- `release_year` — songs released the same year
- `track_number` — same position on their respective albums (e.g., all Track 1s, all closers)
- `album_role` — album opener / closer / lead single / bonus track / hidden track
- `title_word_count` — one-word, two-word, three-word, etc.
- `title_contains_word` — songs whose titles include a specific word
- `title_theme` — songs whose titles share a topic (places, weather, body parts, names, colors, etc.)
- `title_structure` — all-caps, all-lowercase, contains punctuation, has parentheses
- `title_length` — titles shorter than X chars, longer than X chars
- `duration` — songs over/under a duration threshold
- `appears_on_X` — soundtrack, live album, compilation, covers album
- `lyrics_reference` — songs whose lyrics name another artist, a city, a year
- `decade_anchor` — released the same calendar year as a famous cultural event
- `solo_vs_band` — solo project tracks from band members in the lineup
- `cover_song` — covers that the artist did of someone else's track
- `appears_in_film` — songs in a movie/TV show
- `b_side` — songs that were B-sides or non-album singles
- `same_producer` — songs sharing a producer (skip unless verifiable in the cached data)
- `same_collaborator` — features with the same guest artist
- `chart_position` — songs that hit a chart peak
- `seasonal` — songs about a season, holiday, or month
- `narrative_voice` — songs in first/second/third person, songs as dialogue

### Rule 3 — Four-axis variety WITHIN each day

Each day has 4 categories. They should span **four different pattern axes**, not crowd into one. Bad day: all 4 categories are release-year-grouped. Good day: one from structural (title word count), one from time (release year), one from thematic (titles share a theme), one from cross-artist (covers, features, shared producer).

The four axes:
- **STRUCTURAL** — title word count / length / capitalization / punctuation; track number; duration.
- **TEMPORAL** — release year, era, decade.
- **THEMATIC** — title content theme (places, weather, names, body parts, colors, emotions, objects).
- **CROSS-ARTIST** — features, covers, shared producer / collaborator / soundtrack appearance.

When proposing 5 candidate puzzles, score yourself: each candidate should hit at least 3 axes; 4 axes is gold. If a candidate's 4 categories are all on the same axis, redo it.

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

This prints an array of `{ date, decade, artists }` objects, date-seeded so the same date always picks the same lineup, with a 14-day artist cooldown and the "no same decade as yesterday" rule. Save it mentally / in a TodoWrite.

**In-batch decade collision pitfall.** The sampler reads `decade` from `data/puzzles/<D-1>.json` to enforce the neighbor rule. During a batch, day D-1 may not be written to disk yet — so the sampler can pick the same decade as the candidate you were about to ship for D-1. Workaround: pass `--exclude-decade` with a comma-separated list of decades to forbid:

```bash
npm run sample -- 2026-05-15 --range 3 --exclude-decade 2020s,2010s,1990s
```

Also useful when Ben wants a specific shift mid-batch ("do non-2020s for Friday").

Show Ben the full list (just dates + decades + artists) in a tight format. Let him veto any lineup ("re-roll 5/18", "swap Nickelback for Tool", etc.). When he asks for a re-roll, just hand-pick a substitute from the same decade in `data/artists.json` — don't try to rerun the script for one date (it's date-seeded, would produce the same result).

## Step 2 — Make sure every artist's catalog is cached

For every unique artist across all lineups, check `data/catalogs/<slug>.json`. If missing, fetch:

```bash
npm run catalog -- "<Artist Name>"
```

Be patient — Deezer is generous (10 req/s steady-state) and the script paces at ~8 req/s with automatic 429/5xx backoff. Expect a handful of minutes for a 14-day batch.

**Wrong-artist search trap.** Deezer's `/search/artist` ranks by fan count and sometimes returns a collaboration profile rather than the canonical artist (e.g., "The Allman Brothers Band" returned "The Allman Brothers Band With Sheryl Crow", an almost-empty profile). If the catalog comes back tiny or contains only collab releases, bypass search with `--id`:

```bash
# look up the real Deezer artist id via https://www.deezer.com/us/artist/<id>
npm run catalog -- "The Allman Brothers Band" --id 86 --force
```

**Fallback when the data source is blocked.** If Deezer is rate-limiting hard or down (or the artist has no Deezer presence), hand-curate the day from memory: pick well-known songs you can verify by independent means, and tell Ben that day was hand-curated so he can scrutinize. Don't ship unverified titles.

## Step 3 — For each day, propose 5 candidate puzzles

For day D with artists [A, B, C, D, E]:

1. **Pull the recent-category log first** (this is the novelty guard rail):
   ```bash
   npm run history -- 180
   ```
   Save the output in working memory. As you compose candidates, you'll check every category name against this list and skip anything that's a repeat or trivial-paraphrase.

2. Read each artist's distilled catalog:
   ```bash
   npm run distill -- "<artist>"
   ```
   This gives you the artist's studio albums with track names + years.

3. **(Optional) Peek at lyrics** for an artist whose titles don't tell you what the songs are actually about. Lyrics dramatically widen the puzzle vocabulary — you can build categories around what songs *mean* rather than what their titles say:
   ```bash
   npm run lyrics:peek -- "Phoebe Bridgers"                          # first 12 lines + keyword summary for every cached song
   npm run lyrics:peek -- "Phoebe Bridgers" --songs "Motion Sickness,Punisher"
   ```
   Lyrics-based category ideas: "Songs that name a U.S. city", "Songs about a parent", "Songs in first-person plural ('we')", "Songs that mention dying without saying it in the title", "Songs that reference another musician by name". Use sparingly — title-based categories are still ~70% of good puzzles because the player only sees titles. But for difficulty 3-4, lyrical aha-moments are gold.

   If `npm run lyrics:peek` errors with "no lyrics cache", run `npm run lyrics -- "<Artist Name>"` first (one-time per artist, then cached).

4. Look for **patterns and overlaps** across the 5 catalogs (and lyric summaries if you peeked), working from the pattern library in the "Novelty rules" section. For each candidate pattern you find, mentally tag it with its axis (STRUCTURAL / TEMPORAL / THEMATIC / CROSS-ARTIST).

5. **Compose 5 candidate puzzles**, each one a 4-tuple of categories. Each candidate must:
   - Have 4 categories with clever, fresh names (no repeats from `history -- 180`)
   - Have 4 verified-real song titles per category
   - Cover **at least 3 of the 4 axes** (4 is gold; 2 or fewer = redo)
   - Have difficulty tier 1 → 4 assigned, easiest to hardest
   - Have no song appearing in more than one category within the candidate
   - Spread the source artists across the categories (no category drawn from only one artist if avoidable)

6. Show all 5 candidates to Ben in a compact format:

   ```
   Candidate A — axes: STRUCTURAL · TEMPORAL · THEMATIC · CROSS-ARTIST  ✓ all 4 hit
     [1] Track 1s from a debut LP — Smoke Signals, ...     (STRUCTURAL)
     [2] Released in 2020 — Punisher, ...                  (TEMPORAL)
     [3] Titles that are bodies of water — Moon Song, ...  (THEMATIC)
     [4] Solo tracks from boygenius members — Funeral, ... (CROSS-ARTIST)

   Candidate B — axes: STRUCTURAL · STRUCTURAL · THEMATIC · THEMATIC  ✗ only 2 axes — redo
   ```

7. Ben says "B" (or "A with the second category renamed to X" or "redo, none of these"). If he wants edits, apply them. If he wants a re-do, propose 5 NEW candidates with a different angle.

## Step 4 — Write the JSON and move to the next day

When Ben picks a candidate, write `data/puzzles/YYYY-MM-DD.json` matching the schema in `scripts/seed-day.ts`. Include `decade` (from the sampled lineup) — `seed-day.ts` ignores unknown fields, but the sampler reads `decade` from yesterday's puzzle to enforce the "no same decade two days in a row" rule.

```json
{
  "date": "2026-05-14",
  "edition_no": 4,
  "decade": "2020s",
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
- **`connections_categories`**: 4 entries, difficulty 1 (easy) → 4 (hard). Members must be the EXACT song titles as they appear in the Deezer catalog (case + punctuation matter for the in-game tile rendering and the `/api/connections/check` validation).
- Track each title against the cached catalog to catch typos before saving.

**Verify every title programmatically before writing the JSON.** Eyeballing the distilled catalog misses Unicode and capitalization gotchas. Use a one-shot Python check against the cached catalogs:

```bash
python3 - <<'PY'
import json, pathlib
ROOT = pathlib.Path("data/catalogs")
catalogs = {
  "soccer-mommy": "soccer-mommy.json",
  "turnstile": "turnstile.json",
  # ... one entry per artist in the day
}
all_tracks = set()
for slug, fn in catalogs.items():
    data = json.loads((ROOT / fn).read_text())
    for a in data["albums"]:
        for t in a["tracks"]:
            all_tracks.add(t["name"])

candidates = [
    "bad idea right?",
    "Fate Is…",          # Unicode ellipsis, NOT three dots
    "Mrs. Potters Lullaby",  # no apostrophe in "Potters"
    "F E R A L",         # spaces between letters
    "T.L.C. (TURNSTILE LOVE CONNECTION)",
]
for c in candidates:
    print(("OK   " if c in all_tracks else "MISS "), repr(c))
PY
```

If any line prints `MISS`, copy the exact title from the catalog JSON — do not paraphrase, do not "fix" the punctuation.

**Stylized titles to watch for** (these have all bitten us in real puzzles):
- Spaced-out letters: `F E R A L` (Turnstile) — spaces between every letter.
- ALL-CAPS bands: Turnstile titles render uppercase (`T.L.C.`, `ALIEN LOVE CALL`, `MAGIC MAN`).
- Lowercase-stylized artists: Olivia Rodrigo (`bad idea right?`, `ballad of a homeschooled girl`), Soccer Mommy (`night swimming`, `making the bed`), Wednesday (`vampire`).
- Unicode ellipsis: `Fate Is…` uses `…` (U+2026), not three periods.
- Missing/extra apostrophes: `Mrs. Potters Lullaby` (no `'`), but check both — Deezer is inconsistent.
- Trailing punctuation: `Somebody else.` (period), `bad idea right?` (question mark) — preserve them.
- Featured tracks and remixes often live as separate Deezer entries from the canonical album track. Prefer the canonical album version.

Move to the next day, repeat.

## Step 5 — When all days are written, seed + commit

```bash
cd "/Volumes/Ben's SSD 1/KCL Products/Sonic Acrylic Games"
npm run seed:all                                              # upserts every JSON in data/puzzles/ into Neon
git add data/puzzles/ data/artists.json                       # catalogs are gitignored — only commit puzzles + artist pool
git status --short                                            # sanity-check before commit
git commit -m "data: seed puzzles 2026-05-14 through 2026-05-DD"
```

**No deploy needed.** The puzzle API route is `force-dynamic` and reads from Neon live on every request, so the new puzzles are live the moment `seed:all` finishes — Vercel doesn't need to redeploy. Commit anyway so the JSONs are version-controlled.

## Cheat sheet — what to watch for

- **Title matching is exact**: "Moon Song" must be exactly that — not "Moon Song." or "Moonsong" or "Moon song (Live)". Copy directly from the distilled catalog output.
- **Don't reuse titles across categories within a puzzle** (one song = one category).
- **Don't repeat the same artist as the source for all 4 members of a category** — try to spread. (E.g., "Songs that sound like the album titles" should pull 1 from each of 4 different artists ideally.)
- **Watch for "feat." tracks and remixes** — they often live as separate Deezer entries from the canonical track. Use the canonical version (album track) over the remix when possible.
- **Skip days where the lineup is too weak to puzzle from** — if 4 of the 5 artists have only 1 album and very short catalogs, ask Ben to swap one artist for a deeper-catalog pick from the same decade.
- **Edition numbering**: don't reset. Look at `data/puzzles/` for the latest edition_no, increment.

## Anti-patterns — flag these to Ben out loud

If Ben pushes a candidate where:
- Any title is NOT in the cached catalog → say so, refuse to ship it, suggest the closest real title.
- All 4 categories pull from only 1 or 2 artists (rather than spreading across the 5) → suggest a different cut so the puzzle reads as ABOUT the lineup, not about one band.
- A category is mechanically lazy ("songs with the word 'I'", "songs by X") → suggest a sharper angle.

## Commit hygiene

After seeding + committing, smoke-test today's puzzle endpoint to confirm Neon now serves the new lineup:
```bash
curl -sS https://games.sonicacrylic.com/api/puzzle/today | python3 -c "import sys,json; d=json.load(sys.stdin); print('edition:', d.get('edition_no'), '| lineup:', d.get('lineup_artists'))"
```
If the endpoint still shows yesterday's puzzle, the ET midnight rollover hasn't hit yet — that's expected, not a bug.
