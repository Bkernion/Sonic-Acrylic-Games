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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-[6px] p-5 surface-warm grain"
        style={{ color: "var(--ink)", maxWidth: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mono uppercase text-[10px] tracking-[0.22em]" style={{ color: "var(--rust)" }}>
          {stats.outcome === "won" ? "SOLVED" : "TOMORROW"} · {mm}:{ss}
        </div>
        <h2 className="serif font-semibold text-[32px] leading-[1.1] mt-2">
          {stats.outcome === "won" ? "Four groups solved." : "No groups, no sweat."}
        </h2>
        <p className="serif italic text-[14px] mt-2" style={{ color: "var(--taupe)" }}>
          {stats.outcome === "won"
            ? "Stay for the music. We open the door again tomorrow at midnight ET."
            : "Listen on for a minute. Tomorrow's lineup is on its way."}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Stat label="STREAK" value={`${stats.streakCurrent}`} />
          <Stat label="LONGEST" value={`${stats.streakLongest}`} />
          <Stat label="TIME" value={`${mm}:${ss}`} />
          <Stat label="MISTAKES" value={`${stats.mistakesUsed}/4`} />
        </div>

        {!done ? (
          <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
            <label className="mono uppercase text-[10px] tracking-[0.22em]" style={{ color: "var(--taupe)" }}>
              Tomorrow's puzzle in your inbox at 6am ET
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
            {error ? <div className="mono text-[10px]" style={{ color: "var(--rust-2)" }}>{error}</div> : null}
            <button
              type="submit"
              disabled={submitting || !email}
              className="cta-plasma glow-rust h-11 rounded-full mono uppercase text-[11px] tracking-[0.14em] font-medium"
              style={{ border: "1.5px solid transparent", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Sending…" : "Sign me up"}
            </button>
          </form>
        ) : (
          <div className="serif italic mt-4" style={{ color: "var(--taupe)" }}>✓ See you tomorrow.</div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={share}
            className="h-10 px-3 rounded-full mono uppercase text-[10px] tracking-[0.14em]"
            style={{ border: "1.5px solid var(--hair-2)", color: "var(--taupe)", background: "transparent" }}
          >Share</button>
          {np.current ? (
            <div className="flex items-center gap-2 ml-auto">
              <span className="mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "var(--taupe)" }}>Listening</span>
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
    <div className="p-2 rounded-[6px] surface-warm">
      <div className="mono uppercase text-[10px] tracking-[0.18em]" style={{ color: "var(--taupe)" }}>{label}</div>
      <div className="serif text-[20px] mt-1">{value}</div>
    </div>
  );
}
