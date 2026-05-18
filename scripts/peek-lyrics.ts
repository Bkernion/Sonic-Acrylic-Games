/**
 * Print a compact lyric snapshot for one or more artists. For each track,
 * show: title, the first ~12 lines of lyrics, and a short keyword summary.
 * Designed for when I (Claude) need a fast read on what a day's songs are
 * actually about during puzzle composition, without dumping full lyrics
 * into context.
 *
 * Usage:
 *   npm run lyrics:peek -- "Phoebe Bridgers"
 *   npm run lyrics:peek -- "Phoebe Bridgers" --songs "Motion Sickness,Punisher"
 *   npm run lyrics:peek -- "Phoebe Bridgers" --full   # print full lyrics
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const LYRICS_DIR = join(ROOT, "data/lyrics");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type LyricEntry = { title: string; lyrics?: string; status: string; url?: string };
type LyricsFile = { artist: string; tracks: Record<string, LyricEntry> };

function summarize(lyrics: string): string {
  // Quick keyword summary: top-frequency content words
  const stopwords = new Set([
    "the","a","an","and","or","but","is","am","are","was","were","be","been","being",
    "i","me","my","mine","you","your","yours","he","him","his","she","her","hers",
    "we","us","our","they","them","their","it","its","this","that","these","those",
    "of","to","in","on","at","by","for","with","from","as","into","than","then",
    "if","when","where","why","how","what","which","who","whom","all","any","some",
    "no","not","so","up","down","out","over","under","again","just","like","very",
    "do","does","did","done","have","has","had","will","would","can","could","should",
    "may","might","must","shall","let","get","got","go","goes","went","gone","know",
    "one","two","three","ll","ve","re","don","ain","yeah","oh","ooh","ah","na","la",
    "now","gonna","wanna","gotta","ya","em","s","t","m","d",
  ]);
  const words = lyrics.toLowerCase().match(/[a-z']+/g) ?? [];
  const counts = new Map<string, number>();
  for (const w of words) {
    if (w.length < 4) continue;
    if (stopwords.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  return top.map(([w, c]) => `${w}(${c})`).join(" ");
}

function preview(lyrics: string, fullMode: boolean): string {
  if (fullMode) return lyrics;
  const lines = lyrics.split("\n").filter((l) => l.trim()).slice(0, 12);
  return lines.join("\n");
}

function peekArtist(name: string, songFilter: Set<string> | null, full: boolean) {
  const slug = slugify(name);
  const path = join(LYRICS_DIR, `${slug}.json`);
  if (!existsSync(path)) {
    console.error(`! No lyrics cache for "${name}" — run: npm run lyrics -- "${name}"`);
    return;
  }
  const data = JSON.parse(readFileSync(path, "utf8")) as LyricsFile;
  console.log(`\n=== ${data.artist} ===`);
  const titles = Object.keys(data.tracks).sort();
  let shown = 0;
  for (const title of titles) {
    if (songFilter && !songFilter.has(title.toLowerCase())) continue;
    const e = data.tracks[title];
    if (e.status !== "ok" || !e.lyrics) {
      console.log(`\n  [${e.status}] ${title}`);
      continue;
    }
    console.log(`\n  --- ${title} ---`);
    console.log(`  keywords: ${summarize(e.lyrics)}`);
    if (full) {
      console.log("");
      console.log(e.lyrics);
    } else {
      console.log("");
      for (const line of preview(e.lyrics, false).split("\n")) {
        console.log(`  ${line}`);
      }
    }
    shown++;
  }
  if (shown === 0 && songFilter) {
    console.log(`  (no songs matched filter: ${[...songFilter].join(", ")})`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const full = args.includes("--full");
  const songsIdx = args.indexOf("--songs");
  const songFilter = songsIdx >= 0 && args[songsIdx + 1]
    ? new Set(args[songsIdx + 1].split(",").map((s) => s.trim().toLowerCase()))
    : null;
  const name = args
    .filter((a, i) => !a.startsWith("--") && (songsIdx < 0 || i !== songsIdx + 1))
    .join(" ")
    .trim();
  if (!name) {
    console.error('Usage: npm run lyrics:peek -- "<Artist Name>" [--songs "Song1,Song2"] [--full]');
    process.exit(1);
  }
  peekArtist(name, songFilter, full);
}

main();
