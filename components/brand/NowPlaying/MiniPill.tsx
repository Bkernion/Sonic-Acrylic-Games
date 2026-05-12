"use client";

import { useNowPlaying } from "./Provider";
import { PlatformIcons } from "./PlatformIcons";

export function MiniPill() {
  const np = useNowPlaying();
  if (!np.current) return null;
  const heights = [6, 11, 5, 9, 7];
  return (
    <div
      className="surface-warm inline-flex items-center border"
      style={{
        gap: 6,
        padding: "4px 10px 4px 4px",
        borderRadius: 999,
        borderColor: "var(--hair-2)",
      }}
    >
      <button
        onClick={np.toggle}
        aria-label={np.isPlaying ? "Pause" : "Play"}
        className="inline-flex items-center justify-center rounded-full flex-shrink-0"
        style={{ width: 18, height: 18, background: "var(--ink)", color: "var(--paper)", fontSize: 8 }}
      >
        <span aria-hidden>{np.isPlaying ? "❚❚" : "▶"}</span>
      </button>
      <div
        className={`flex items-end flex-shrink-0 ${np.isPlaying ? "" : "eq-paused"}`}
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
      <div className="serif italic truncate max-w-[140px]" style={{ fontSize: 12, color: "var(--ink)" }}>
        {np.current.title}
      </div>
      <PlatformIcons links={np.current.streaming_links} source="mini" />
    </div>
  );
}
