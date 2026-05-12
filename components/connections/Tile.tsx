"use client";

type Props = {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function Tile({ label, selected, disabled, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center text-center tile-cell"
      style={{
        aspectRatio: "1 / 1",
        borderRadius: 0,
        background: selected ? "var(--ink)" : "var(--paper-2)",
        color: selected ? "var(--paper)" : "var(--ink)",
        border: `1px solid ${selected ? "var(--ink)" : "var(--hair)"}`,
        fontFamily: "var(--mono)",
        fontSize: 10,
        fontWeight: 500,
        lineHeight: 1.05,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        padding: 4,
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
      }}
    >
      {label}
    </button>
  );
}
