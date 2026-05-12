"use client";

import { useNowPlaying } from "./Provider";
import { PlatformIcons } from "./PlatformIcons";

export function MiniPill() {
  const np = useNowPlaying();
  if (!np.current) return null;
  return (
    <div
      className="flex items-center gap-2 px-2 py-1 rounded-full border surface-warm"
      style={{ borderColor: "var(--hair-2)" }}
    >
      <button
        onClick={np.toggle}
        aria-label={np.isPlaying ? "Pause" : "Play"}
        className="inline-flex items-center justify-center rounded-full"
        style={{ width: 18, height: 18, background: "var(--ink)", color: "var(--paper)", fontSize: 9 }}
      >
        <span aria-hidden>{np.isPlaying ? "❚❚" : "▶"}</span>
      </button>
      <div className={`flex items-end gap-[2px] h-[10px] ${np.isPlaying ? "" : "eq-paused"}`}>
        {[0, 0.11, 0.22, 0.33, 0.44].map((delay, i) => (
          <span
            key={i}
            className="eq-bar"
            style={{
              ["--eq-duration" as never]: "1.1s",
              ["--eq-delay" as never]: `${delay}s`,
              width: 2, height: "100%", background: "var(--rust)", borderRadius: 1,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="serif italic text-[11px] truncate max-w-[120px]" style={{ color: "var(--ink)" }}>
        {np.current.title}
      </div>
      <PlatformIcons links={np.current.streaming_links} source="mini" />
    </div>
  );
}
