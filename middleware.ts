/**
 * Basic Auth gate for /admin/* paths.
 *
 * Set ADMIN_PASSWORD (and optionally ADMIN_USERNAME, defaults to "admin")
 * in .env.local and in Vercel project settings. The dashboard prompts for
 * credentials via the browser's native HTTP Basic Auth dialog — no UI to
 * build, works on phones.
 *
 * If ADMIN_PASSWORD isn't set, the gate blocks all access (fail-safe).
 */

import { NextRequest, NextResponse } from "next/server";

// HTTP headers must be ASCII (ByteString), so no em dashes here.
const REALM = "Sonic Acrylic Games admin";

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"` },
  });
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const expectedUser = process.env.ADMIN_USERNAME ?? "admin";
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass) {
    // No password configured — block by default rather than serving open.
    return new NextResponse("Admin password not configured on the server.", { status: 503 });
  }

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
  const sep = decoded.indexOf(":");
  if (sep < 0) return unauthorized();
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);

  if (user !== expectedUser || pass !== expectedPass) return unauthorized();
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
