export function SideB() {
  return (
    <section className="mx-4 mt-6">
      <div className="mono uppercase text-[10px] tracking-[0.18em] flex items-center gap-2" style={{ color: "var(--taupe)" }}>
        <span className="flex-1 h-px" style={{ background: "var(--hair)" }} />
        <span>SIDE B</span>
        <span className="flex-1 h-px" style={{ background: "var(--hair)" }} />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="p-3 rounded-[6px] border surface-warm" style={{ borderColor: "var(--hair-2)" }}>
          <div className="mono uppercase text-[9px] tracking-[0.18em]" style={{ color: "var(--taupe)" }}>RANK</div>
          <div className="serif text-[16px] mt-1" style={{ color: "var(--ink)" }}>—</div>
          <div className="serif italic text-[11px]" style={{ color: "var(--taupe)", fontWeight: 400 }}>coming with leaderboards</div>
        </div>
        <div className="p-3 rounded-[6px] border surface-warm" style={{ borderColor: "var(--hair-2)" }}>
          <div className="mono uppercase text-[9px] tracking-[0.18em]" style={{ color: "var(--taupe)" }}>TIP JAR</div>
          <div className="serif text-[16px] mt-1" style={{ color: "var(--ink)" }}>—</div>
          <div className="serif italic text-[11px]" style={{ color: "var(--taupe)", fontWeight: 400 }}>opens later this season</div>
        </div>
      </div>
    </section>
  );
}
