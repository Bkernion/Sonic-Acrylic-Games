import {
  getTopStats,
  getPerEdition,
  getRecentCaptures,
  getRecentEvents,
  getTopStreaks,
  getStreamingByArtist,
  getDailyTrend,
} from "@/lib/admin/metrics";

export const dynamic = "force-dynamic";

const VERCEL_PROJECT_ID = "prj_Ghb0FPf406Z2UvYhapALVE2AOTpl";
const VERCEL_ANALYTICS_URL = "https://vercel.com/sonic-acrylic-games/~/analytics";

function fmtTs(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 16);
}

function maskDevice(id: string | null): string {
  if (!id) return "—";
  return id.slice(0, 6) + "…";
}

export default async function AdminDashboard() {
  const [stats, perEd, captures, events, streaks, byArtist, daily] = await Promise.all([
    getTopStats(),
    getPerEdition(),
    getRecentCaptures(20),
    getRecentEvents(30),
    getTopStreaks(10),
    getStreamingByArtist(15),
    getDailyTrend(14),
  ]);

  const completedTotal = perEd.reduce((n, r) => n + r.completions_known, 0);
  const captureRate = stats.total_devices > 0
    ? ((stats.total_emails / stats.total_devices) * 100).toFixed(1)
    : "0";

  return (
    <main className="dashboard">
      <header className="db-header">
        <div>
          <h1>SONIC ACRYLIC GAMES — METRICS</h1>
          <div className="db-sub">
            Refreshes on every load. <a href={VERCEL_ANALYTICS_URL} target="_blank" rel="noreferrer">→ Vercel Analytics (visitors / pageviews)</a>
          </div>
        </div>
      </header>

      {/* Top stats cards */}
      <section className="cards">
        <Card label="Email signups" big={stats.total_emails} sub={`+${stats.emails_last_7d} last 7 days`} />
        <Card label="Active players" big={stats.total_devices} sub={`${stats.devices_active_last_7d} active last 7d`} />
        <Card label="Puzzle completions" big={completedTotal} sub={`across ${stats.total_puzzles_shipped} editions`} />
        <Card label="Streaming clicks" big={stats.streaming_clicks} sub={`of ${stats.total_events} total events`} />
        <Card label="Capture rate" big={`${captureRate}%`} sub="emails / unique players" />
      </section>

      {/* Per-edition table */}
      <section className="block">
        <h2>By edition</h2>
        <table className="db-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Ed.</th>
              <th>Lineup</th>
              <th className="num">Completions</th>
              <th className="num">Emails</th>
              <th className="num">Streaming clicks</th>
            </tr>
          </thead>
          <tbody>
            {perEd.length === 0 && (
              <tr><td colSpan={6} className="empty">No puzzles shipped yet.</td></tr>
            )}
            {perEd.map((r) => (
              <tr key={r.edition_no}>
                <td>{r.date}</td>
                <td>{r.edition_no}</td>
                <td className="lineup">
                  {r.lineup_artists.slice(0, 3).join(" · ")}
                  {r.lineup_artists.length > 3 && ` + ${r.lineup_artists.length - 3} more`}
                </td>
                <td className="num">{r.completions_known}</td>
                <td className="num">{r.email_captures}</td>
                <td className="num">{r.streaming_clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Two-column row: daily trend + streaming by artist */}
      <div className="two-col">
        <section className="block">
          <h2>Last 14 days</h2>
          <table className="db-table small">
            <thead>
              <tr>
                <th>Day</th>
                <th className="num">Emails</th>
                <th className="num">Completions</th>
                <th className="num">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.day}>
                  <td>{d.day}</td>
                  <td className="num">{d.emails}</td>
                  <td className="num">{d.completions}</td>
                  <td className="num">{d.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="block">
          <h2>Streaming clicks by artist</h2>
          {byArtist.length === 0 && <div className="empty">No streaming clicks yet.</div>}
          {byArtist.length > 0 && (
            <table className="db-table small">
              <thead>
                <tr>
                  <th>Artist</th>
                  <th className="num">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {byArtist.map((b, i) => (
                  <tr key={i}>
                    <td>{b.artist ?? "(unknown)"}</td>
                    <td className="num">{b.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* Recent activity */}
      <section className="block">
        <h2>Recent email captures</h2>
        {captures.length === 0 && <div className="empty">No emails captured yet. The capture form fires after a player completes a puzzle.</div>}
        {captures.length > 0 && (
          <table className="db-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Email</th>
                <th>Ed.</th>
                <th>Source</th>
                <th>Device</th>
              </tr>
            </thead>
            <tbody>
              {captures.map((c, i) => (
                <tr key={i}>
                  <td>{fmtTs(c.captured_at)}</td>
                  <td>{c.email}</td>
                  <td>{c.edition_id ?? "—"}</td>
                  <td>{c.source ?? "—"}</td>
                  <td className="mono">{maskDevice(c.device_id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="block">
        <h2>Recent events</h2>
        {events.length === 0 && <div className="empty">No events yet.</div>}
        {events.length > 0 && (
          <table className="db-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Name</th>
                <th>Ed.</th>
                <th>Device</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i}>
                  <td>{fmtTs(e.ts)}</td>
                  <td>{e.name}</td>
                  <td>{e.edition_id ?? "—"}</td>
                  <td className="mono">{maskDevice(e.device_id)}</td>
                  <td className="meta">{e.meta ? JSON.stringify(e.meta) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="block">
        <h2>Top streaks</h2>
        {streaks.length === 0 && <div className="empty">No streaks yet.</div>}
        {streaks.length > 0 && (
          <table className="db-table">
            <thead>
              <tr>
                <th>Device</th>
                <th className="num">Current</th>
                <th className="num">Longest</th>
                <th>Last completed</th>
                <th>Email on record</th>
              </tr>
            </thead>
            <tbody>
              {streaks.map((s, i) => (
                <tr key={i}>
                  <td className="mono">{maskDevice(s.device_id)}</td>
                  <td className="num">{s.current}</td>
                  <td className="num">{s.longest}</td>
                  <td>{s.last_completed_date ?? "—"}</td>
                  <td>{s.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="db-footer">
        Server time: {new Date().toISOString()} · Data live from Neon.
      </footer>
    </main>
  );
}

function Card({ label, big, sub }: { label: string; big: number | string; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-big">{big}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
