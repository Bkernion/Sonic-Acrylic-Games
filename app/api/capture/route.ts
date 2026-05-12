import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { DEVICE_COOKIE, isValidDeviceId } from "@/lib/device";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { email?: string; source?: string; edition_id?: number } | null;
  if (!body?.email || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: "bad_email" }, { status: 400 });
  }
  const email = body.email.trim().toLowerCase();
  const did = req.cookies.get(DEVICE_COOKIE)?.value;
  const device_id = did && isValidDeviceId(did) ? did : null;

  await sql`
    INSERT INTO email_captures (email, source, edition_id, device_id)
    VALUES (${email}, ${body.source ?? "unknown"}, ${body.edition_id ?? null}, ${device_id})
    ON CONFLICT ((LOWER(email))) DO NOTHING
  `;

  if (device_id) {
    await sql`UPDATE streaks SET email = ${email}, updated_at = NOW() WHERE device_id = ${device_id}`;
  }

  return NextResponse.json({ ok: true });
}
