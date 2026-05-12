"use client";

import { useNowPlaying } from "./Provider";
import { PlatformIcons } from "./PlatformIcons";

function PlayPause() {
  const np = useNowPlaying();
  return (
    <button
      onClick={np.toggle}
      aria-label={np.isPlaying ? "Pause" : "Play"}
      className="inline-flex items-center justify-center rounded-full"
      style={{ width: 30, height: 30, background: "var(--ink)", color: "var(--paper)" }}
    >
      <span aria-hidden>{np.isPlaying ? "❚❚" : "▶"}</span>
    </button>
  );
}

function Equalizer({ playing }: { playing: boolean }) {
  // Propagating wave: same duration, staggered animation-delay so motion
  // ripples left-to-right across the bars.
  return (
    <div className={`flex items-end gap-[2px] h-[16px] ${playing ? "" : "eq-paused"}`}>
      {[0, 0.11, 0.22, 0.33, 0.44].map((delay, i) => (
        <span
          key={i}
          className="eq-bar"
          style={{
            ["--eq-duration" as never]: "1.1s",
            ["--eq-delay" as never]: `${delay}s`,
            width: 3, height: "100%", background: "var(--rust)", borderRadius: 1,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function fmt(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FullRibbon() {
  const np = useNowPlaying();
  if (!np.current) return null;
  return (
    <div
      className="flex items-center gap-3 px-4 border-t surface-warm"
      style={{ height: 60, borderColor: "var(--hair)" }}
    >
      <PlayPause />
      <Equalizer playing={np.isPlaying} />
      <div className="flex-1 min-w-0">
        <div className="serif italic text-[13px] truncate" style={{ color: "var(--ink)" }}>
          {np.current.title}
        </div>
        <div className="mono uppercase text-[9px] tracking-[0.18em] truncate" style={{ color: "var(--taupe)" }}>
          {np.current.artist}
        </div>
      </div>
      <PlatformIcons links={np.current.streaming_links} source="full" />
      <div className="mono text-[10px]" style={{ color: "var(--taupe)" }}>
        {fmt(np.positionSec)}
      </div>
    </div>
  );
}
