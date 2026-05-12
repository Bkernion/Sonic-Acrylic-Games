import { describe, it, expect, vi, afterEach } from "vitest";
import { etToday, etDateString, isYesterdayET, isSameETDate } from "@/lib/date";

afterEach(() => { vi.useRealTimers(); });

describe("etToday / etDateString", () => {
  it("returns ET date as YYYY-MM-DD", () => {
    // 2026-05-11 03:00 UTC = 2026-05-10 23:00 ET (EDT, UTC-4)
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T03:00:00Z"));
    expect(etDateString()).toBe("2026-05-10");
  });

  it("rolls forward at ET midnight", () => {
    // 2026-05-11 04:30 UTC = 2026-05-11 00:30 ET
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-11T04:30:00Z"));
    expect(etDateString()).toBe("2026-05-11");
  });

  it("handles winter (EST, UTC-5)", () => {
    // 2026-01-15 04:30 UTC = 2026-01-14 23:30 EST
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T04:30:00Z"));
    expect(etDateString()).toBe("2026-01-14");
  });
});

describe("isYesterdayET / isSameETDate", () => {
  it("isYesterdayET true when prior is one ET-day before today", () => {
    expect(isYesterdayET("2026-05-10", "2026-05-11")).toBe(true);
    expect(isYesterdayET("2026-05-09", "2026-05-11")).toBe(false);
    expect(isYesterdayET(null, "2026-05-11")).toBe(false);
  });

  it("isSameETDate compares strings", () => {
    expect(isSameETDate("2026-05-11", "2026-05-11")).toBe(true);
    expect(isSameETDate("2026-05-11", "2026-05-12")).toBe(false);
  });
});
