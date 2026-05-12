import Link from "next/link";

type Props = {
  kicker?: string;
  wordmark?: React.ReactNode;
  backHref?: string;
  rightSlot?: React.ReactNode;
};

export function AppBar({ kicker, wordmark, backHref, rightSlot }: Props) {
  return (
    <header
      className="flex items-center justify-between border-b"
      style={{ padding: "12px 16px 10px", background: "var(--paper)", borderColor: "var(--hair)" }}
    >
      <div className="flex items-center gap-[10px]">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Back"
            style={{
              width: 22, height: 22,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "var(--ink)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2L4 7l5 5" />
            </svg>
          </Link>
        ) : null}
        {wordmark ?? (
          <span className="mono uppercase" style={{ fontSize: 10.5, letterSpacing: "0.22em", color: "var(--ink)" }}>
            {kicker}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">{rightSlot}</div>
    </header>
  );
}
