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

  const today = etToday();
  const existing = await sql`SELECT current, longest, last_completed_date FROM streaks WHERE device_id = ${did}`;
  const row = existing[0];

  let current = 1;
  let longest = 1;
  if (row) {
    const last = row.last_completed_date ? String(row.last_completed_date).slice(0, 10) : null;
    if (isSameETDate(last, today)) {
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

  return NextResponse.json({ current, longest, last_completed_date: today });
}
