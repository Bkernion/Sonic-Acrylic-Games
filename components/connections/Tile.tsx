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
      className="rounded-[3px] flex items-center justify-center text-center tile-cell"
      style={{
        aspectRatio: "1 / 1",
        background: selected ? "var(--ink)" : "rgba(255, 241, 222, 0.7)",
        color: selected ? "#FFF1DE" : "var(--ink)",
        border: `1px solid ${selected ? "var(--ink)" : "var(--hair-2)"}`,
        fontFamily: "var(--serif)",
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        padding: 4,
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
      }}
    >
      {label}
    </button>
  );
}
