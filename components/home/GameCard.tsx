import Link from "next/link";

type Props = {
  index: number;
  kicker: string;
  title: string;
  subtitle: string;
  href?: string;
  comingSoon?: string;
  isLast?: boolean;
};

export function GameCard({ index, kicker, title, subtitle, href, comingSoon, isLast }: Props) {
  const inner = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 18px",
        borderBottom: isLast ? undefined : "1px solid var(--hair)",
        opacity: comingSoon ? 0.6 : 1,
      }}
    >
      <div
        className="mono"
        style={{ fontSize: 11, color: "var(--taupe)", marginTop: 4, width: 22, flexShrink: 0 }}
      >
        {index.toString().padStart(2, "0")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="mono uppercase"
          style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--rust)" }}
        >
          {kicker}
        </div>
        <div
          className="serif"
          style={{ fontSize: 19, lineHeight: 1.15, marginTop: 2, fontWeight: 500, color: "var(--ink)" }}
        >
          {title}
        </div>
        <div
          className="serif italic"
          style={{ fontSize: 13.5, lineHeight: 1.35, color: "var(--taupe)", marginTop: 3, fontWeight: 400 }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          fontSize: 14,
          color: comingSoon ? "var(--taupe)" : "var(--ink)",
          opacity: comingSoon ? 0.5 : 1,
          marginTop: 6,
          flexShrink: 0,
        }}
      >
        →
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}
