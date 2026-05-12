import Link from "next/link";

type Props = {
  index: number;
  kicker: string;
  title: string;
  subtitle: string;
  href?: string;
  comingSoon?: string;
};

export function GameCard({ index, kicker, title, subtitle, href, comingSoon }: Props) {
  const inner = (
    <div
      className="flex items-center gap-3 px-4 py-[14px] rounded-[6px] border"
      style={{
        background: comingSoon ? "transparent" : "var(--paper-2)",
        borderColor: "var(--hair-2)",
        opacity: comingSoon ? 0.5 : 1,
      }}
    >
      <div className="mono text-[22px]" style={{ color: "var(--ink)" }}>
        {index.toString().padStart(2, "0")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="mono uppercase text-[10px] tracking-[0.22em]" style={{ color: "var(--rust)" }}>
          {kicker}
        </div>
        <div className="serif text-[17px] font-medium mt-[2px]" style={{ color: "var(--ink)" }}>{title}</div>
        <div className="serif italic text-[12.5px] mt-[2px]" style={{ color: "var(--taupe)" }}>{subtitle}</div>
      </div>
      <div className="mono text-[10px]" style={{ color: comingSoon ? "var(--taupe)" : "var(--ink)" }}>
        {comingSoon ? comingSoon : "→"}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
