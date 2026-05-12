type Props = {
  headline: string;
  lineup: string[];
};

export function Hero({ headline, lineup }: Props) {
  return (
    <section
      className="surface-warm"
      style={{
        padding: "18px 18px 16px",
        borderBottom: "1px solid var(--hair)",
        borderTop: "1px solid var(--hair-2)",
      }}
    >
      <h1
        className="mono"
        style={{ fontSize: 32, lineHeight: 1.02, color: "var(--ink)", fontWeight: 700, letterSpacing: "0.02em", textTransform: "uppercase" }}
      >
        {headline}
      </h1>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {lineup.map((name, i) => (
          <div key={name} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span
              className="mono"
              style={{ fontSize: 11, color: "var(--rust)", letterSpacing: "0.18em", textTransform: "uppercase", width: 22, flexShrink: 0 }}
            >
              {(i + 1).toString().padStart(2, "0")}
            </span>
            <span
              className="mono"
              style={{ fontSize: 16, fontWeight: 500, letterSpacing: "0.04em", color: "var(--ink)", textTransform: "uppercase" }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
      <p
        className="mono"
        style={{
          fontSize: 12,
          lineHeight: 1.4,
          color: "var(--rust)",
          fontWeight: 400,
          fontStyle: "normal",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px solid var(--hair-2)",
        }}
      >
        These are the artists today&apos;s games will be based on.
      </p>
    </section>
  );
}
