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
  ` as Array<{ date: string; edition_no: number; lineup_artists: string[]; theme_pull_quote: string | null }>;
  const row = rows[0];

  return (
    <>
      <AppBar
        wordmark={
          <>
            <span className="serif text-[14px] font-semibold" style={{ color: "var(--ink)" }}>Sonic Acrylic</span>{" "}
            <span className="mono uppercase text-[10px] tracking-[0.18em]" style={{ color: "var(--taupe)" }}>Games</span>
          </>
        }
        rightSlot={<StreakChip />}
      />
      <div className="flex-1 overflow-y-auto pb-2">
        {row ? (
          <Hero
            editionLabel={fmtEdition(String(row.date).slice(0, 10), row.edition_no)}
            headline={"Tonight's table of five."}
            lineup={row.lineup_artists}
            themeQuote={row.theme_pull_quote}
          />
        ) : (
          <div className="mx-4 mt-4 p-4 serif italic" style={{ color: "var(--taupe)" }}>
            New edition drops at midnight ET. Come back then.
          </div>
        )}

        <div className="mx-4 mt-5 mono uppercase text-[10px] tracking-[0.18em] flex items-center gap-2" style={{ color: "var(--taupe)" }}>
          <span className="flex-1 h-px" style={{ background: "var(--hair)" }} />
          <span>TODAY&apos;S SIX</span>
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
