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
