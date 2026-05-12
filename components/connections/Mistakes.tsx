export function Mistakes({ left }: { left: number }) {
  return (
    <div className="flex items-center justify-between mx-4 mt-4">
      <span className="mono uppercase" style={{ fontSize: 10, color: "var(--taupe)", letterSpacing: "0.18em" }}>
        MISTAKES LEFT
      </span>
      <div className="flex" style={{ gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              width: 9,
              height: 9,
              borderRadius: 0,
              background: i < left ? "var(--ink)" : "var(--hair)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
