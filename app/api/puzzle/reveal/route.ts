import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { etToday } from "@/lib/date";

export const dynamic = "force-dynamic";

// Returns today's full categories. Called from the client only after a player
// loses (4 mistakes used). v0 anti-cheat: this endpoint is open — a determined
// player can call it directly to spoil their own game. Acceptable for a free
// daily puzzle; harden later if cheating becomes a real problem.
export async function GET() {
  const today = etToday();
  const rows = await sql`SELECT connections_categories FROM daily_puzzles WHERE date = ${today}`;
  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "no_puzzle" }, { status: 404 });
  }
  return NextResponse.json({ categories: row.connections_categories });
}
