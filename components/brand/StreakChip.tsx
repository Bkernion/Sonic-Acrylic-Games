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
  return (
    <span
      className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full mono text-[11px] uppercase tracking-[0.1em]"
      style={{ border: "1px solid var(--ink)", color: "var(--ink)", background: "transparent" }}
      aria-label={`Current streak ${count ?? 0} days`}
    >
      <span style={{ color: "var(--rust)" }}>◆</span>
      <span>{count ?? "–"}</span>
    </span>
  );
}
