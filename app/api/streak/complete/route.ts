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

  // Optional edition_no in body so we can attribute the completion to a
  // specific puzzle in the events log. Falls back to NULL if the client
  // didn't pass one (older builds).
  const body = await req.json().catch(() => null) as { edition_no?: number } | null;
  const editionNo = Number.isFinite(body?.edition_no) ? body!.edition_no! : null;

  const today = etToday();
  const existing = await sql`SELECT current, longest, last_completed_date FROM streaks WHERE device_id = ${did}`;
  const row = existing[0];

  let current = 1;
  let longest = 1;
  if (row) {
    const last = row.last_completed_date ? String(row.last_completed_date).slice(0, 10) : null;
    if (isSameETDate(last, today)) {
      // Already counted today — no event, no streak bump. Idempotent.
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

  // Log a puzzle_completed event for the dashboard. Server-side so the count
  // is authoritative and matches the streak rollup. Best-effort: a failure
  // here shouldn't break the win flow.
  try {
    await sql`
      INSERT INTO events (name, device_id, edition_id, meta)
      VALUES ('puzzle_completed', ${did}, ${editionNo}, ${JSON.stringify({ current, longest })}::jsonb)
    `;
  } catch (e) {
    console.error("[streak/complete] event log failed:", (e as Error).message);
  }

  return NextResponse.json({ current, longest, last_completed_date: today });
}
