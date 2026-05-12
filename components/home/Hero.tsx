type Props = {
  editionLabel: string;
  headline: string;
  lineup: string[];
  themeQuote?: string | null;
};

export function Hero({ editionLabel, headline, lineup, themeQuote }: Props) {
  return (
    <section
      className="mx-4 mt-4 p-[18px] rounded-[6px] border surface-warm grain"
      style={{ borderColor: "var(--hair-2)" }}
    >
      <div className="mono uppercase text-[10.5px] tracking-[0.22em]" style={{ color: "var(--taupe)" }}>
        {editionLabel}
      </div>
      <h1 className="serif font-semibold text-[32px] mt-3 leading-[1.1]" style={{ color: "var(--ink)" }}>
        {headline}
      </h1>
      <ol className="mt-4 space-y-2">
        {lineup.map((name, i) => (
          <li key={name} className="flex items-baseline gap-3">
            <span className="mono text-[12px]" style={{ color: "var(--rust)" }}>{(i+1).toString().padStart(2, "0")}</span>
            <span className="serif text-[20px]" style={{ color: "var(--ink)" }}>{name}</span>
          </li>
        ))}
      </ol>
      {themeQuote ? (
        <>
          <hr className="hr mt-4" />
          <p className="serif italic text-[14px] mt-3" style={{ color: "var(--taupe)", fontWeight: 400 }}>{themeQuote}</p>
        </>
      ) : null}
    </section>
  );
}
