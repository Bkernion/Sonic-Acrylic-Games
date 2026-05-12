"use client";

type Props = {
  onShuffle: () => void;
  onClear: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
};

export function ActionRow({ onShuffle, onClear, onSubmit, submitDisabled }: Props) {
  return (
    <div className="mx-4 mt-5 flex gap-2">
      <button
        onClick={onShuffle}
        className="btn ghost sm"
        style={{ flex: 1 }}
      >
        SHUFFLE
      </button>
      <button
        onClick={onClear}
        className="btn ghost sm"
        style={{ flex: 1 }}
      >
        CLEAR
      </button>
      <button
        onClick={onSubmit}
        disabled={submitDisabled}
        className={`btn sm${submitDisabled ? " ghost" : " cta-plasma glow-rust"}`}
        style={{
          flex: 1.4,
          border: submitDisabled ? "1.5px solid var(--hair-2)" : "1.5px solid transparent",
          opacity: submitDisabled ? 0.6 : 1,
          ...(submitDisabled ? { color: "var(--taupe)", background: "transparent" } : {}),
        }}
      >
        SUBMIT
      </button>
    </div>
  );
}
