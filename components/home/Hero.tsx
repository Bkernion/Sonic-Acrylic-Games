type Props = {
  editionLabel: string;     // e.g. "TUE · NOV 11 · ED.412"
  headline: string;
  lineup: string[];         // 5 artists
  themeQuote?: string | null;
};

export function Hero({ editionLabel, headline, lineup, themeQuote }: Props) {
  return (
    <section
      className="mx-4 mt-4 p-[18px] rounded-[6px]"
      style={{ background: "var(--paper-2)" }}
    >
      <div className="mono uppercase text-[10.5px] tracking-[0.22em]" style={{ color: "var(--taupe)" }}>
        {editionLabel}
      </div>
      <h1 className="serif font-semibold text-[28px] mt-3 leading-[1.15]" style={{ color: "var(--ink)" }}>
        {headline}
      </h1>
      <ol className="mt-4 space-y-2">
        {lineup.map((name, i) => (
          <li key={name} className="flex items-baseline gap-3">
            <span className="mono text-[12px]" style={{ color: "var(--rust)" }}>{(i+1).toString().padStart(2, "0")}</span>
            <span className="serif text-[18px] font-medium" style={{ color: "var(--ink)" }}>{name}</span>
          </li>
        ))}
      </ol>
      {themeQuote ? (
        <>
          <hr className="hr mt-4" />
          <p className="serif italic text-[13px] mt-3" style={{ color: "var(--taupe)" }}>{themeQuote}</p>
        </>
      ) : null}
    </section>
  );
}
