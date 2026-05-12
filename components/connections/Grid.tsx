"use client";

import { Tile } from "./Tile";

type Props = {
  tiles: string[];
  selected: string[];
  disabled?: boolean;
  onToggle: (t: string) => void;
};

export function Grid({ tiles, selected, disabled, onToggle }: Props) {
  return (
    <div className="grid grid-cols-4 gap-[6px] mx-4 mt-4">
      {tiles.map((t) => (
        <Tile
          key={t}
          label={t}
          selected={selected.includes(t)}
          disabled={disabled}
          onClick={() => onToggle(t)}
        />
      ))}
    </div>
  );
}
