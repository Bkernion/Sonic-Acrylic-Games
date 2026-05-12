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
      className={`pill compact${lit ? " cta-plasma glow-rust" : ""}`}
      style={{
        border: lit ? "1px solid transparent" : undefined,
        ...(lit ? { color: "#FFF1DE" } : {}),
      }}
      aria-label={`Current streak ${count ?? 0} days`}
    >
      <span style={{ color: lit ? "#FFF1DE" : "var(--rust)" }}>◆</span>
      <span>{count ?? "–"}</span>
    </span>
  );
}
