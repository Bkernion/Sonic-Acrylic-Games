const FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric", month: "2-digit", day: "2-digit",
});

export function etDateString(d: Date = new Date()): string {
  return FMT.format(d);
}

export function etToday(): string {
  return etDateString();
}

export function isSameETDate(a: string | null | undefined, b: string): boolean {
  return !!a && a === b;
}

export function isYesterdayET(prior: string | null | undefined, today: string): boolean {
  if (!prior) return false;
  const t = new Date(today + "T12:00:00Z");
  const expected = new Date(t.getTime() - 24 * 60 * 60 * 1000);
  const expectedStr = expected.toISOString().slice(0, 10);
  return prior === expectedStr;
}
