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
