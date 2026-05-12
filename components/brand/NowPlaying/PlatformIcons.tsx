"use client";

import type { StreamingLinks } from "@/lib/audioQueue";

const ICON_SIZE = 20;

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
    <div className="flex items-center gap-[6px]">
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
          className="inline-flex items-center justify-center transition-transform hover:-translate-y-[1px]"
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
        >
          <PlatformGlyph kind={k} />
        </a>
      ))}
    </div>
  );
}

function PlatformGlyph({ kind }: { kind: keyof StreamingLinks }) {
  const props = { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": true as const };
  switch (kind) {
    case "spotify":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="12" fill="#1ED760" />
          <path
            fill="#000"
            d="M17.9 15.7c-.2.4-.7.5-1.1.3-3-1.8-6.8-2.2-11.2-1.2-.5.1-.9-.2-1-.6-.1-.5.2-.9.6-1 4.8-1.1 9-.6 12.4 1.4.4.2.5.7.3 1.1zm1.5-3.1c-.3.4-.8.6-1.3.3-3.5-2.1-8.7-2.7-12.8-1.5-.5.1-1.1-.1-1.3-.7-.1-.5.1-1.1.7-1.3 4.7-1.4 10.5-.7 14.5 1.7.5.3.6.9.3 1.5zm.2-3.2C15.4 7 8.4 6.7 4.5 7.9c-.7.2-1.4-.2-1.6-.9-.2-.7.2-1.4.9-1.6 4.5-1.4 12.2-1.1 16.8 1.6.6.4.9 1.2.5 1.8-.4.7-1.2.9-1.8.5z"
          />
        </svg>
      );
    case "apple_music":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="am-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FA243C" />
              <stop offset="1" stopColor="#FB5C74" />
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="22" height="22" rx="5" fill="url(#am-grad)" />
          <path
            fill="#FFF"
            d="M16.2 6.6c0-.4-.3-.6-.7-.5l-5.6 1.1c-.3.1-.5.3-.5.6v6.5c-.3-.2-.7-.3-1.2-.3-1.3 0-2.4 1-2.4 2.3s1 2.3 2.4 2.3c1.3 0 2.4-1 2.4-2.3V9.1l4.7-.9v4.5c-.3-.2-.7-.3-1.2-.3-1.3 0-2.4 1-2.4 2.3s1 2.3 2.4 2.3c1.3 0 2.4-1 2.4-2.3V6.6z"
          />
        </svg>
      );
    case "youtube_music":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="12" fill="#FF0000" />
          <circle cx="12" cy="12" r="6.8" fill="none" stroke="#FFF" strokeWidth="1.2" />
          <path fill="#FFF" d="M10.2 9v6l5-3z" />
        </svg>
      );
    case "bandcamp":
      return (
        <svg {...props}>
          <rect x="1" y="1" width="22" height="22" rx="3" fill="#1DA0C3" />
          <path fill="#FFF" d="M5 16l5-9h9l-5 9H5z" />
        </svg>
      );
  }
}
