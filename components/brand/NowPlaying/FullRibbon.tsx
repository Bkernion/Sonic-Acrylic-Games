"use client";

import { useNowPlaying } from "./Provider";
import { PlatformIcons } from "./PlatformIcons";

function PlayPause() {
  const np = useNowPlaying();
  return (
    <button
      onClick={np.toggle}
      aria-label={np.isPlaying ? "Pause" : "Play"}
      className="inline-flex items-center justify-center rounded-full flex-shrink-0"
      style={{ width: 30, height: 30, background: "var(--ink)", color: "var(--paper)", fontSize: 11 }}
    >
      <span aria-hidden>{np.isPlaying ? "❚❚" : "▶"}</span>
    </button>
  );
}

/* Variable-height bars matching prototype: [6, 11, 5, 9, 7] px */
function Equalizer({ playing }: { playing: boolean }) {
  const heights = [6, 11, 5, 9, 7];
  return (
    <div
      className={`flex items-end flex-shrink-0 ${playing ? "" : "eq-paused"}`}
      style={{ gap: 2, height: 12 }}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className="eq-bar"
          style={{
            ["--eq-duration" as never]: `${1.2 + i * 0.1}s`,
            width: 2,
            height: h,
            background: "var(--rust)",
            borderRadius: 1,
            transformOrigin: "bottom",
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
      className="flex items-center surface-warm border-t"
      style={{ gap: 10, padding: "10px 14px", borderColor: "var(--hair)" }}
    >
      <PlayPause />
      <Equalizer playing={np.isPlaying} />
      <div className="flex-1 min-w-0">
        <div className="serif italic truncate" style={{ fontSize: 14, lineHeight: 1.1, color: "var(--ink)" }}>
          &ldquo;{np.current.title}&rdquo;
        </div>
        <div className="mono uppercase truncate" style={{ fontSize: 9.5, color: "var(--taupe)", letterSpacing: "0.18em", marginTop: 2 }}>
          {np.current.artist.toUpperCase()}
        </div>
      </div>
      <PlatformIcons links={np.current.streaming_links} source="full" />
      <div className="mono" style={{ fontSize: 9.5, color: "var(--taupe)", letterSpacing: "0.18em", flexShrink: 0 }}>
        {fmt(np.positionSec)}
      </div>
    </div>
  );
}
