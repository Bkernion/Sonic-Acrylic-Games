import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { newDeviceId, isValidDeviceId, DEVICE_COOKIE, deviceCookie } from "@/lib/device";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let did = req.cookies.get(DEVICE_COOKIE)?.value;
  let setCookie: string | undefined;
  if (!did || !isValidDeviceId(did)) {
    did = newDeviceId();
    setCookie = deviceCookie(did);
  }

  const rows = await sql`SELECT current, longest, last_completed_date FROM streaks WHERE device_id = ${did}`;
  const row = rows[0] ?? { current: 0, longest: 0, last_completed_date: null };

  const res = NextResponse.json({
    current: row.current,
    longest: row.longest,
    last_completed_date: row.last_completed_date,
    device_id: did,
  });
  if (setCookie) res.headers.set("Set-Cookie", setCookie);
  return res;
}
