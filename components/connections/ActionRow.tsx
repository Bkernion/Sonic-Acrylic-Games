"use client";

type Props = {
  onShuffle: () => void;
  onClear: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
};

export function ActionRow({ onShuffle, onClear, onSubmit, submitDisabled }: Props) {
  const btnBase: React.CSSProperties = {
    height: 44, borderRadius: 999, padding: "0 18px",
    fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500,
    letterSpacing: "0.14em", textTransform: "uppercase",
  };
  return (
    <div className="mx-4 mt-5 flex gap-2">
      <button
        onClick={onShuffle}
        style={{ ...btnBase, border: "1.5px solid var(--hair-2)", color: "var(--taupe)", background: "transparent" }}
      >Shuffle</button>
      <button
        onClick={onClear}
        style={{ ...btnBase, border: "1.5px solid var(--hair-2)", color: "var(--taupe)", background: "transparent" }}
      >Clear</button>
      <button
        onClick={onSubmit}
        disabled={submitDisabled}
        className={submitDisabled ? "" : "glow-rust"}
        style={{
          ...btnBase, flex: 1.4,
          border: submitDisabled ? "1.5px solid var(--rust)" : "1.5px solid transparent",
          background: submitDisabled ? "transparent" : "var(--rust-gradient)",
          color: submitDisabled ? "var(--rust)" : "#FFF1DE",
          opacity: submitDisabled ? 0.6 : 1,
        }}
      >Submit</button>
    </div>
  );
}
