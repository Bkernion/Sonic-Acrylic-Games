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
      className="flex items-center justify-between px-4 border-b"
      style={{ height: 44, background: "var(--paper)", borderColor: "var(--hair)" }}
    >
      <div className="flex items-center gap-2">
        {backHref ? (
          <Link href={backHref} aria-label="Back" style={{ color: "var(--ink)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 1L3 7l6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : null}
        {wordmark ?? (
          <span className="mono uppercase text-[10.5px] tracking-[0.22em]" style={{ color: "var(--ink)" }}>
            {kicker}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">{rightSlot}</div>
    </header>
  );
}
