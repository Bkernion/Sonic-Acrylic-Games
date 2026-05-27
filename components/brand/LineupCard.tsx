/**
 * Compact "today's artists" panel for game pages. Reuses the Hero's
 * numbered-list aesthetic at smaller scale so it can sit alongside game
 * controls instead of dominating the viewport.
 */
type Props = {
  lineup: string[];
  label?: string;          // override the small header label
};

export function LineupCard({ lineup, label = "TODAY'S ARTISTS" }: Props) {
  return (
    <section
      className="mx-4 mt-4"
      style={{
        padding: "12px 14px",
        background: "var(--paper-2)",
        border: "1px solid var(--hair-2)",
        borderRadius: 0,
      }}
    >
      <div
        className="mono uppercase"
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--rust)",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
        {lineup.map((name, i) => (
          <div key={name} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--taupe)",
                letterSpacing: "0.18em",
                width: 20,
                flexShrink: 0,
              }}
            >
              {(i + 1).toString().padStart(2, "0")}
            </span>
            <span
              className="mono"
              style={{
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.04em",
                color: "var(--ink)",
                textTransform: "uppercase",
              }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
