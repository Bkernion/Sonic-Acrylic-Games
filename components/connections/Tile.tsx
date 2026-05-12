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
      className="rounded-[3px] flex items-center justify-center text-center"
      style={{
        aspectRatio: "1 / 1",
        background: selected ? "var(--ink)" : "var(--paper-2)",
        color: selected ? "var(--paper)" : "var(--ink)",
        border: `1px solid ${selected ? "var(--ink)" : "var(--hair-2)"}`,
        fontFamily: "var(--serif)",
        fontSize: 10,
        lineHeight: 1.1,
        padding: 6,
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
      }}
    >
      {label}
    </button>
  );
}
