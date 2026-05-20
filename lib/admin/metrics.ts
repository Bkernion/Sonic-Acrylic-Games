/**
 * Read-side queries that power the /admin/dashboard view. All queries hit
 * Neon over the serverless driver — kept here so the page component stays
 * focused on layout.
 */

import { sql } from "@/lib/db";

export type TopStats = {
  total_emails: number;
  emails_last_7d: number;
  total_devices: number;
  devices_active_last_7d: number;
  total_events: number;
  streaming_clicks: number;
  total_puzzles_shipped: number;
};

type Count = { n: number };

export async function getTopStats(): Promise<TopStats> {
  const [e, e7, d, d7, ev, sc, p] = await Promise.all([
    sql`SELECT COUNT(*)::int AS n FROM email_captures`,
    sql`SELECT COUNT(*)::int AS n FROM email_captures WHERE captured_at >= NOW() - INTERVAL '7 days'`,
    sql`SELECT COUNT(*)::int AS n FROM streaks`,
    sql`SELECT COUNT(*)::int AS n FROM streaks WHERE updated_at >= NOW() - INTERVAL '7 days'`,
    sql`SELECT COUNT(*)::int AS n FROM events`,
    sql`SELECT COUNT(*)::int AS n FROM events WHERE name LIKE 'streaming_click%'`,
    sql`SELECT COUNT(*)::int AS n FROM daily_puzzles`,
  ]);
  const [_e, _e7, _d, _d7, _ev, _sc, _p] = [e, e7, d, d7, ev, sc, p] as Count[][];
  return {
    total_emails: _e[0].n,
    emails_last_7d: _e7[0].n,
    total_devices: _d[0].n,
    devices_active_last_7d: _d7[0].n,
    total_events: _ev[0].n,
    streaming_clicks: _sc[0].n,
    total_puzzles_shipped: _p[0].n,
  };
}

export type PerEditionRow = {
  date: string;
  edition_no: number;
  lineup_artists: string[];
  email_captures: number;
  streaming_clicks: number;
  completions_known: number;     // count of streaks whose last_completed_date matches
};

export async function getPerEdition(): Promise<PerEditionRow[]> {
  const rows = (await sql`
    SELECT
      to_char(p.date, 'YYYY-MM-DD') AS date,
      p.edition_no,
      p.lineup_artists,
      (SELECT COUNT(*)::int FROM email_captures ec WHERE ec.edition_id = p.edition_no) AS email_captures,
      (SELECT COUNT(*)::int FROM events e WHERE e.edition_id = p.edition_no AND e.name LIKE 'streaming_click%') AS streaming_clicks,
      (SELECT COUNT(*)::int FROM streaks s WHERE s.last_completed_date = p.date) AS completions_known
    FROM daily_puzzles p
    ORDER BY p.edition_no DESC
  `) as PerEditionRow[];
  return rows;
}

export type RecentCapture = {
  email: string;
  source: string | null;
  edition_id: number | null;
  device_id: string | null;
  captured_at: string;
};

export async function getRecentCaptures(limit = 20): Promise<RecentCapture[]> {
  return (await sql`
    SELECT email, source, edition_id, device_id, captured_at::text
    FROM email_captures
    ORDER BY captured_at DESC
    LIMIT ${limit}
  `) as RecentCapture[];
}

export type RecentEvent = {
  ts: string;
  name: string;
  device_id: string | null;
  edition_id: number | null;
  meta: unknown;
};

export async function getRecentEvents(limit = 30): Promise<RecentEvent[]> {
  return (await sql`
    SELECT ts::text, name, device_id, edition_id, meta
    FROM events
    ORDER BY ts DESC
    LIMIT ${limit}
  `) as RecentEvent[];
}

export type StreakRow = {
  device_id: string;
  current: number;
  longest: number;
  last_completed_date: string | null;
  email: string | null;
  updated_at: string;
};

export async function getTopStreaks(limit = 10): Promise<StreakRow[]> {
  return (await sql`
    SELECT device_id, current, longest, last_completed_date::text, email, updated_at::text
    FROM streaks
    ORDER BY longest DESC, current DESC
    LIMIT ${limit}
  `) as StreakRow[];
}

export type StreamingByArtist = { artist: string; clicks: number };

export async function getStreamingByArtist(limit = 15): Promise<StreamingByArtist[]> {
  return (await sql`
    SELECT meta->>'artist' AS artist, COUNT(*)::int AS clicks
    FROM events
    WHERE name LIKE 'streaming_click%' AND meta->>'artist' IS NOT NULL
    GROUP BY meta->>'artist'
    ORDER BY clicks DESC
    LIMIT ${limit}
  `) as StreamingByArtist[];
}

export type DailyPoint = { day: string; emails: number; completions: number; clicks: number };

export async function getDailyTrend(days = 14): Promise<DailyPoint[]> {
  const rows = (await sql`
    WITH d AS (
      SELECT generate_series(
        (CURRENT_DATE - (${days}::int - 1))::date,
        CURRENT_DATE,
        '1 day'
      )::date AS day
    )
    SELECT
      to_char(d.day, 'YYYY-MM-DD') AS day,
      (SELECT COUNT(*)::int FROM email_captures ec WHERE ec.captured_at::date = d.day) AS emails,
      (SELECT COUNT(*)::int FROM streaks s WHERE s.last_completed_date = d.day) AS completions,
      (SELECT COUNT(*)::int FROM events e WHERE e.name LIKE 'streaming_click%' AND e.ts::date = d.day) AS clicks
    FROM d
    ORDER BY d.day DESC
  `) as DailyPoint[];
  return rows;
}
