type Props = {
  headline: string;
  lineup: string[];
};

export function Hero({ headline, lineup }: Props) {
  return (
    <section className="surface-warm" style={{ padding: "18px 18px 16px" }}>
      <h1 className="serif font-semibold" style={{ fontSize: 32, lineHeight: 1.02, color: "var(--ink)" }}>
        {headline}
      </h1>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 2 }}>
        {lineup.map((name, i) => (
          <div key={name} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span
              className="mono"
              style={{ fontSize: 9.5, color: "var(--rust)", letterSpacing: "0.18em", textTransform: "uppercase", width: 18, flexShrink: 0 }}
            >
              {(i + 1).toString().padStart(2, "0")}
            </span>
            <span className="serif" style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--ink)" }}>
              {name}
            </span>
          </div>
        ))}
      </div>
      <p
        className="serif italic"
        style={{
          fontSize: 14,
          lineHeight: 1.4,
          color: "var(--taupe)",
          fontWeight: 400,
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
