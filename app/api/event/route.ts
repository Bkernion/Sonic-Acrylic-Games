import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { DEVICE_COOKIE } from "@/lib/device";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { name?: string; meta?: unknown; edition_id?: number } | null;
  if (!body?.name) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const did = req.cookies.get(DEVICE_COOKIE)?.value ?? null;
  await sql`
    INSERT INTO events (name, device_id, edition_id, meta)
    VALUES (${body.name}, ${did}, ${body.edition_id ?? null}, ${JSON.stringify(body.meta ?? {})}::jsonb)
  `;
  return NextResponse.json({ ok: true });
}
