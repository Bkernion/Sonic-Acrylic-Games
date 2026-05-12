"use client";

import { useEffect, useState } from "react";

export function StreakChip() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/streak/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCount(d.current ?? 0))
      .catch(() => setCount(0));
  }, []);
  const lit = (count ?? 0) > 0;
  return (
    <span
      className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full mono text-[11px] uppercase tracking-[0.1em] ${lit ? "glow-rust" : ""}`}
      style={{
        border: `1px solid ${lit ? "transparent" : "var(--ink)"}`,
        background: lit ? "var(--rust-gradient)" : "transparent",
        color: lit ? "#FFF1DE" : "var(--ink)",
      }}
      aria-label={`Current streak ${count ?? 0} days`}
    >
      <span style={{ color: lit ? "#FFF1DE" : "var(--rust)" }}>◆</span>
      <span>{count ?? "–"}</span>
    </span>
  );
}
