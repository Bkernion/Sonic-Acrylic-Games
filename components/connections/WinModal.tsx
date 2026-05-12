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
        className="w-full p-5 surface-warm relative modal-box-in"
        style={{ color: "var(--ink)", maxWidth: 380, borderRadius: 0, border: "1px solid var(--hair-2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* X close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 inline-flex items-center justify-center"
          style={{
            width: 30, height: 30,
            color: "var(--ink)",
            background: "transparent",
            border: "1px solid var(--hair-2)",
            borderRadius: 0,
            fontSize: 14, lineHeight: 1,
          }}
        >
          <span aria-hidden>✕</span>
        </button>

        {/* Mono kicker */}
        <div className="mono uppercase pr-10" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--ink)" }}>
          {stats.outcome === "won" ? "SOLVED" : "TOMORROW"} · {mm}:{ss}
        </div>

        {/* Headline — 28px gold mono uppercase */}
        <h2
          className="mono"
          style={{ fontSize: 28, lineHeight: 1.05, marginTop: 8, fontWeight: 700, textTransform: "uppercase", color: "var(--ink)", letterSpacing: "0.02em" }}
        >
          {stats.outcome === "won" ? "Four groups solved," : "No groups, no sweat."}
          {stats.outcome === "won" ? <br /> : null}
          {stats.outcome === "won" ? "no missteps." : null}
        </h2>

        {/* Subline — white mono uppercase */}
        <p
          className="mono"
          style={{ fontSize: 12, lineHeight: 1.4, color: "var(--rust)", marginTop: 8, textTransform: "uppercase", fontStyle: "normal", letterSpacing: "0.04em" }}
        >
          {stats.outcome === "won"
            ? "The record kept playing the whole time. It still is."
            : "Listen on for a minute. Tomorrow's lineup is on its way."}
        </p>

        {/* Stats — 2×2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
          <Stat label="STREAK"   value={`${stats.streakCurrent} DAYS`} />
          <Stat label="LONGEST"  value={`${stats.streakLongest}`} />
          <Stat label="TIME"     value={`${mm}:${ss}`} />
          <Stat label="MISTAKES" value={`${stats.mistakesUsed}/4`} />
        </div>

        {/* Streak strip */}
        {showStreak ? (
          <div style={{ padding: "14px 14px 16px", background: "var(--ink)", color: "var(--paper)", borderRadius: 0, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--paper)" }}>STREAK</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 500, color: "var(--paper)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {streakN} DAYS, UNBROKEN
              </span>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(streakN, 20)}, 1fr)`,
              gap: 4,
              marginTop: 10,
            }}>
              {Array.from({ length: Math.min(streakN, 20) }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    background: "var(--rust)",
                    opacity: i === Math.min(streakN, 20) - 1 ? 1 : 0.4 + (i / Math.min(streakN, 20)) * 0.55,
                    borderRadius: 0,
                    boxShadow: i === Math.min(streakN, 20) - 1 ? "0 0 0 1.5px var(--ink)" : "none",
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
              className="px-3 py-2 outline-none"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--hair)",
                color: "var(--ink)",
                borderRadius: 0,
                fontFamily: "var(--mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            />
            {error ? <div className="mono uppercase" style={{ fontSize: 10, color: "var(--rust-2)" }}>{error}</div> : null}
            <button
              type="submit"
              disabled={submitting || !email}
              className="mono uppercase font-medium"
              style={{
                height: 44,
                background: "var(--rust)",
                color: "var(--paper)",
                border: "1.5px solid var(--rust)",
                borderRadius: 0,
                fontSize: 11,
                letterSpacing: "0.14em",
                opacity: submitting ? 0.7 : 1,
                fontFamily: "var(--mono)",
                cursor: submitting || !email ? "default" : "pointer",
              }}
            >
              {submitting ? "SENDING…" : "SIGN ME UP"}
            </button>
          </form>
        ) : (
          <div className="mono uppercase" style={{ marginTop: 16, color: "var(--taupe)", fontSize: 11, letterSpacing: "0.04em", fontStyle: "normal" }}>
            ✓ SEE YOU TOMORROW.
          </div>
        )}

        {/* Share row */}
        <div className="flex items-center gap-2" style={{ marginTop: 16 }}>
          <button
            onClick={share}
            className="mono uppercase"
            style={{
              height: 40, padding: "0 12px",
              border: "1.5px solid var(--hair-2)", color: "var(--taupe)", background: "transparent",
              borderRadius: 0,
              fontSize: 10, letterSpacing: "0.14em",
              fontFamily: "var(--mono)",
              cursor: "pointer",
            }}
          >
            SHARE
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
    <div className="surface-warm" style={{ padding: "10px 12px", borderRadius: 0, border: "1px solid var(--hair-2)" }}>
      <div className="mono uppercase" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--taupe)" }}>{label}</div>
      <div className="mono" style={{ fontSize: 17, fontWeight: 500, marginTop: 2, color: "var(--ink)", textTransform: "uppercase" }}>{value}</div>
    </div>
  );
}
