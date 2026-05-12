export function SideB() {
  return (
    <div style={{ padding: "14px 18px 8px" }}>
      <div className="rule one" style={{ color: "var(--taupe)" }}>Side B</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
        <div className="surface-warm" style={{ padding: 10, borderRadius: 6 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--taupe)", textTransform: "uppercase" }}>
            LEADERBOARD
          </div>
          <div className="serif" style={{ fontSize: 15, fontWeight: 500, marginTop: 2, color: "var(--ink)" }}>
            —
          </div>
        </div>
        <div className="surface-warm" style={{ padding: 10, borderRadius: 6 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--taupe)", textTransform: "uppercase" }}>
            TIP JAR
          </div>
          <div className="serif italic" style={{ fontSize: 13, marginTop: 2, color: "var(--ink)" }}>
            buy the curator a coffee
          </div>
        </div>
      </div>
    </div>
  );
}
