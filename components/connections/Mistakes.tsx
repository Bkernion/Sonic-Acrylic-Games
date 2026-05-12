export function Mistakes({ left }: { left: number }) {
  return (
    <div className="mx-4 mt-4 flex items-center gap-2">
      <span className="mono uppercase text-[10px] tracking-[0.22em]" style={{ color: "var(--taupe)" }}>
        MISTAKES LEFT
      </span>
      <div className="flex gap-[6px]">
        {[0,1,2,3].map((i) => (
          <span
            key={i}
            style={{
              width: 8, height: 8, borderRadius: 999,
              background: i < left ? "var(--ink)" : "transparent",
              border: `1px solid ${i < left ? "var(--ink)" : "var(--hair-2)"}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
