"use client";

import { useState } from "react";
import { PlatformIcons } from "@/components/brand/NowPlaying/PlatformIcons";
import { useNowPlaying } from "@/components/brand/NowPlaying/Provider";

type Stats = {
  outcome: "won" | "lost";
  elapsedSec: number;
  mistakesUsed: number;
  streakCurrent: number;
  streakLongest: number;
};

export function WinModal({ stats, editionId, onClose }: { stats: Stats; editionId?: number; onClose: () => void }) {
  const np = useNowPlaying();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const r = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: stats.outcome === "won" ? "win" : "lose", edition_id: editionId }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setError(j.error === "bad_email" ? "That email doesn't look right." : "Couldn't save — try again?");
      } else {
        setDone(true);
      }
    } catch {
      setError("Couldn't save — try again?");
    } finally {
      setSubmitting(false);
    }
  }

  async function share() {
    const text = stats.outcome === "won"
      ? `Four groups solved, ${stats.mistakesUsed} mistakes. Streak: ${stats.streakCurrent}. Sonic Acrylic Games.`
      : `Tomorrow then. Sonic Acrylic Games.`;
    const url = "https://games.sonicacrylic.com";
    if (typeof navigator !== "undefined" && (navigator as { share?: (d: object) => Promise<void> }).share) {
      try { await (navigator as { share: (d: object) => Promise<void> }).share({ text, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert("Copied to clipboard.");
      } catch {}
    }
  }

  const mm = Math.floor(stats.elapsedSec / 60).toString().padStart(2, "0");
  const ss = Math.floor(stats.elapsedSec % 60).toString().padStart(2, "0");
  const streakN = stats.streakCurrent;
  const showStreak = stats.outcome === "won" && streakN > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 flex items-center justify-center p-4 modal-backdrop-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-[6px] p-5 surface-warm grain relative modal-box-in"
        style={{ color: "var(--ink)", maxWidth: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* X close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full"
          style={{
            width: 30, height: 30,
            color: "var(--ink)",
            background: "rgba(255,255,255,0.4)",
            border: "1px solid var(--hair-2)",
            fontSize: 14, lineHeight: 1,
          }}
        >
          <span aria-hidden>✕</span>
        </button>

        {/* Rust mono kicker */}
        <div className="mono uppercase pr-10" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--rust)" }}>
          {stats.outcome === "won" ? "SOLVED" : "TOMORROW"} · {mm}:{ss}
        </div>

        {/* Headline — 32px */}
        <h2 className="serif font-semibold" style={{ fontSize: 32, lineHeight: 1.05, marginTop: 8 }}>
          {stats.outcome === "won" ? "Four groups solved." : "No groups, no sweat."}
        </h2>

        {/* Italic subline — 13px */}
        <p className="serif italic" style={{ fontSize: 13, lineHeight: 1.4, color: "var(--taupe)", marginTop: 8 }}>
          {stats.outcome === "won"
            ? "Stay for the music. We open the door again tomorrow at midnight ET."
            : "Listen on for a minute. Tomorrow’s lineup is on its way."}
        </p>

        {/* Stats — 2×2 grid, 9px label / 17px value */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
          <Stat label="STREAK"   value={`${stats.streakCurrent}`} />
          <Stat label="LONGEST"  value={`${stats.streakLongest}`} />
          <Stat label="TIME"     value={`${mm}:${ss}`} />
          <Stat label="MISTAKES" value={`${stats.mistakesUsed}/4`} />
        </div>

        {/* Streak strip — only shown on won + streak > 0 */}
        {showStreak ? (
          <div style={{ padding: "14px 14px 16px", background: "var(--ink)", color: "var(--paper)", borderRadius: 6, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--rust-3)" }}>STREAK</span>
              <span className="serif" style={{ fontSize: 14, fontWeight: 500 }}>{streakN} days, unbroken</span>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${streakN}, 1fr)`,
              gap: 4,
              marginTop: 10,
            }}>
              {Array.from({ length: streakN }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    background: "var(--rust)",
                    opacity: i === streakN - 1 ? 1 : 0.55 + (i / streakN) * 0.4,
                    borderRadius: 2,
                    boxShadow: i === streakN - 1 ? "0 0 0 1.5px var(--paper)" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Email capture form */}
        {!done ? (
          <form onSubmit={submit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <label className="mono uppercase" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--taupe)" }}>
              Tomorrow&apos;s puzzle in your inbox at 6am ET
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere.com"
              className="px-3 py-2 rounded-[4px] outline-none"
              style={{ background: "var(--paper-2)", border: "1px solid var(--hair-2)", color: "var(--ink)" }}
            />
            {error ? <div className="mono" style={{ fontSize: 10, color: "var(--rust-2)" }}>{error}</div> : null}
            <button
              type="submit"
              disabled={submitting || !email}
              className="cta-plasma glow-rust rounded-full mono uppercase font-medium"
              style={{
                height: 44,
                border: "1.5px solid transparent",
                fontSize: 11,
                letterSpacing: "0.14em",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Sending…" : "Sign me up"}
            </button>
          </form>
        ) : (
          <div className="serif italic" style={{ marginTop: 16, color: "var(--taupe)" }}>✓ See you tomorrow.</div>
        )}

        {/* Share row */}
        <div className="flex items-center gap-2" style={{ marginTop: 16 }}>
          <button
            onClick={share}
            className="rounded-full mono uppercase"
            style={{
              height: 40, padding: "0 12px",
              border: "1.5px solid var(--hair-2)", color: "var(--taupe)", background: "transparent",
              fontSize: 10, letterSpacing: "0.14em",
            }}
          >
            Share
          </button>
          {np.current ? (
            <div className="flex items-center gap-2 ml-auto">
              <span className="mono uppercase" style={{ fontSize: 9, letterSpacing: "0.18em", color: "var(--taupe)" }}>Listening</span>
              <PlatformIcons links={np.current.streaming_links} source="win" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-warm" style={{ padding: "10px 12px", borderRadius: 4 }}>
      <div className="mono uppercase" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--taupe)" }}>{label}</div>
      <div className="serif" style={{ fontSize: 17, fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  );
}
