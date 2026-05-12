export function SideB() {
  return (
    <div style={{ padding: "14px 18px 8px" }}>
      <div className="rule one" style={{ color: "var(--taupe)" }}>Side B</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
        <div
          className="surface-warm"
          style={{ padding: 10, borderRadius: 0, border: "1px solid var(--hair-2)" }}
        >
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--taupe)", textTransform: "uppercase" }}>
            LEADERBOARD
          </div>
          <div className="mono" style={{ fontSize: 14, fontWeight: 500, marginTop: 2, color: "var(--ink)", textTransform: "uppercase" }}>
            —
          </div>
        </div>
        <div
          className="surface-warm"
          style={{ padding: 10, borderRadius: 0, border: "1px solid var(--hair-2)" }}
        >
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--taupe)", textTransform: "uppercase" }}>
            TIP JAR
          </div>
          <div className="mono" style={{ fontSize: 13, marginTop: 2, color: "var(--ink)", textTransform: "uppercase", fontStyle: "normal" }}>
            BUY THE CURATOR A COFFEE
          </div>
        </div>
      </div>
    </div>
  );
}
