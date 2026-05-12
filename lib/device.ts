const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function newDeviceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (Node <19): RFC 4122 v4
  const b = new Uint8Array(16);
  for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function isValidDeviceId(s: string): boolean {
  return UUID_RE.test(s);
}

export const DEVICE_COOKIE = "sag_did";
export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Build a Set-Cookie header value for the device id. */
export function deviceCookie(id: string): string {
  return `${DEVICE_COOKIE}=${id}; Path=/; Max-Age=${DEVICE_COOKIE_MAX_AGE}; SameSite=Lax`;
}
