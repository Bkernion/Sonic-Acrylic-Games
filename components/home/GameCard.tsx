import Link from "next/link";

type Props = {
  index: number;
  kicker: string;
  title: string;
  subtitle: string;
  href?: string;
  comingSoon?: string;
  isLast?: boolean;
  /** Render the eye-catching wiggle + "Start Here" chalk label. */
  featured?: boolean;
};

export function GameCard({ index, kicker, title, subtitle, href, comingSoon, isLast, featured }: Props) {
  const inner = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 18px",
        borderBottom: isLast ? undefined : "1px solid var(--hair)",
        opacity: comingSoon ? 0.6 : 1,
        position: "relative",
      }}
    >
      {featured ? (
        <span
          aria-hidden
          className="chalk-label"
          style={{
            position: "absolute",
            top: -8,
            right: 14,
            fontSize: 22,
            transform: "rotate(-7deg)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 2,
          }}
        >
          Start here!
        </span>
      ) : null}
      <div
        className="mono"
        style={{ fontSize: 11, color: "var(--rust)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 4, width: 22, flexShrink: 0 }}
      >
        {index.toString().padStart(2, "0")}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="mono"
          style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--ink)", textTransform: "uppercase" }}
        >
          {kicker}
        </div>
        <div
          className="mono"
          style={{ fontSize: 16, lineHeight: 1.25, marginTop: 2, fontWeight: 500, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.04em" }}
        >
          {title}
        </div>
        <div
          className="mono"
          style={{ fontSize: 11, lineHeight: 1.4, color: "var(--taupe)", marginTop: 3, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.04em", fontStyle: "normal" }}
        >
          {subtitle}
        </div>
      </div>
      <div
        style={{
          fontSize: 14,
          color: comingSoon ? "var(--taupe-2)" : "var(--ink)",
          opacity: comingSoon ? 0.4 : 1,
          marginTop: 6,
          flexShrink: 0,
        }}
      >
        →
      </div>
    </div>
  );
  if (!href) return inner;
  return (
    <Link href={href} className={`block ${featured ? "wiggle" : ""}`}>
      {inner}
    </Link>
  );
}
