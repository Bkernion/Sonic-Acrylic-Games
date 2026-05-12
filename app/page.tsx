import { StreakChip } from "@/components/brand/StreakChip";
import { Hero } from "@/components/home/Hero";
import { GameCard } from "@/components/home/GameCard";
import { SideB } from "@/components/home/SideB";
import { FullRibbon } from "@/components/brand/NowPlaying/FullRibbon";
import { etToday } from "@/lib/date";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const GAMES = [
  { i: 1, kicker: "CONNECT", title: "Sixteen songs from tonight's five", subtitle: "Sort songs into four hidden categories.", href: "/connections" },
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
  ` as Array<{ date: string; edition_no: number; lineup_artists: string[]; theme_pull_quote: string | null }>;
  const row = rows[0];

  return (
    <>
      {/* Top bar — no fixed height, asymmetric padding, Wordmark + StreakChip */}
      <div
        className="flex items-center justify-between border-b"
        style={{ padding: "14px 16px 10px", background: "var(--paper)", borderColor: "var(--hair-2)" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span className="mono" style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.02em", color: "var(--ink)", textTransform: "uppercase" }}>
            SONIC ACRYLIC
          </span>
          <span className="mono" style={{ fontSize: 8, color: "var(--taupe-2)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            GAMES
          </span>
        </div>
        <StreakChip />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Hero section — surface-warm, no border/radius */}
        {row ? (
          <Hero headline="Today's Artists" lineup={row.lineup_artists} />
        ) : (
          <div className="mono" style={{ padding: "18px 18px 16px", color: "var(--taupe)", textTransform: "uppercase", fontSize: 11 }}>
            NEW EDITION DROPS AT MIDNIGHT ET. COME BACK THEN.
          </div>
        )}

        {/* "Today's six" rule — left-aligned, no flanking hairlines */}
        <div className="rule one" style={{ padding: "14px 18px 6px" }}>Today&apos;s six</div>

        {/* Games — hairline-separated rows, no card backgrounds */}
        <div>
          {GAMES.map((g, idx) => (
            <GameCard
              key={g.i}
              index={g.i}
              kicker={g.kicker}
              title={g.title}
              subtitle={g.subtitle}
              href={g.href}
              comingSoon={g.comingSoon}
              isLast={idx === GAMES.length - 1}
            />
          ))}
        </div>

        {/* Side B */}
        <SideB />
        <div style={{ height: 16 }} />
      </div>

      <FullRibbon />
    </>
  );
}
