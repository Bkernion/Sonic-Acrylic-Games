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
        borderRadius: 0,
        borderColor: "var(--hair-2)",
      }}
    >
      <button
        onClick={np.toggle}
        aria-label={np.isPlaying ? "Pause" : "Play"}
        className="inline-flex items-center justify-center flex-shrink-0"
        style={{ width: 18, height: 18, background: "var(--ink)", color: "var(--paper)", fontSize: 8, borderRadius: 0 }}
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
              background: "var(--ink)",
              borderRadius: 0,
              transformOrigin: "bottom",
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div
        className="mono truncate max-w-[140px]"
        style={{ fontSize: 11, color: "var(--rust)", textTransform: "uppercase", letterSpacing: "0.04em", fontStyle: "normal" }}
      >
        {np.current.title}
      </div>
      <PlatformIcons links={np.current.streaming_links} source="mini" />
    </div>
  );
}
