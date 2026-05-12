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
      className="pill compact"
      style={{ borderRadius: 0, border: "1px solid var(--hair-2)", background: "transparent", color: "var(--ink)" }}
      aria-label={`Current streak ${count ?? 0} days`}
    >
      <span style={{ color: "var(--ink)" }}>◆</span>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink)", textTransform: "uppercase" }}>{count ?? "–"}</span>
    </span>
  );
}
