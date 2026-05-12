"use client";

import type { StreamingLinks } from "@/lib/audioQueue";

const ICON_SIZE = 18;

const labels: Record<keyof StreamingLinks, string> = {
  spotify: "Spotify",
  apple_music: "Apple Music",
  youtube_music: "YouTube Music",
  bandcamp: "Bandcamp",
};

export function PlatformIcons({ links, source }: { links: StreamingLinks; source: string }) {
  const platforms = (Object.keys(labels) as (keyof StreamingLinks)[]).filter((k) => links[k]);
  if (platforms.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      {platforms.map((k) => (
        <a
          key={k}
          href={links[k]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open in ${labels[k]}`}
          onClick={() => fetch("/api/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: `streaming_click_${k}`, meta: { source } }),
          }).catch(() => {})}
          className="inline-flex items-center justify-center"
          style={{ width: ICON_SIZE, height: ICON_SIZE, color: "var(--ink)" }}
        >
          <PlatformGlyph kind={k} />
        </a>
      ))}
    </div>
  );
}

function PlatformGlyph({ kind }: { kind: keyof StreamingLinks }) {
  // v0 placeholder: letter-in-circle. Replace with official brand SVGs in a polish pass.
  const letter = { spotify: "S", apple_music: "A", youtube_music: "Y", bandcamp: "B" }[kind];
  return (
    <span
      aria-hidden
      style={{
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 500,
        border: "1px solid var(--ink)", borderRadius: 999,
        width: 18, height: 18, lineHeight: "16px", textAlign: "center", display: "inline-block",
      }}
    >
      {letter}
    </span>
  );
}
