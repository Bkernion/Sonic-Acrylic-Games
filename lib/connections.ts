export type Category = {
  name: string;
  difficulty: 1 | 2 | 3 | 4;
  members: string[]; // length 4
};

export type GuessResult = "match" | "one_away" | "wrong" | "invalid";

export type ConnectionsState = {
  tiles: string[];               // remaining unsolved tiles
  selected: string[];            // currently-selected (max 4)
  mistakesLeft: number;
  solved: Category[];            // in solve order
  status: "playing" | "won" | "lost";
};

export function initState(tiles: string[]): ConnectionsState {
  return { tiles: tiles.slice(), selected: [], mistakesLeft: 4, solved: [], status: "playing" };
}

export function toggleTile(s: ConnectionsState, tile: string): ConnectionsState {
  if (s.status !== "playing") return s;
  if (!s.tiles.includes(tile)) return s;
  if (s.selected.includes(tile)) {
    return { ...s, selected: s.selected.filter((t) => t !== tile) };
  }
  if (s.selected.length >= 4) return s;
  return { ...s, selected: [...s.selected, tile] };
}

export function clearSelection(s: ConnectionsState): ConnectionsState {
  return { ...s, selected: [] };
}

function categoryOf(tile: string, cats: Category[]): Category | undefined {
  return cats.find((c) => c.members.includes(tile));
}

export function applyGuess(
  s: ConnectionsState,
  categories: Category[],
): { state: ConnectionsState; result: GuessResult; matchedCategory?: Category } {
  if (s.status !== "playing" || s.selected.length !== 4) {
    return { state: s, result: "invalid" };
  }

  // Count how many of the selected tiles belong to each category
  const counts = new Map<string, number>();
  for (const tile of s.selected) {
    const cat = categoryOf(tile, categories);
    if (cat) counts.set(cat.name, (counts.get(cat.name) ?? 0) + 1);
  }

  // Exact match: all 4 from same category
  for (const [name, n] of counts) {
    if (n === 4) {
      const cat = categories.find((c) => c.name === name)!;
      const newTiles = s.tiles.filter((t) => !cat.members.includes(t));
      const solved = [...s.solved, cat];
      const status = solved.length === 4 ? "won" : "playing";
      return {
        state: { ...s, tiles: newTiles, selected: [], solved, status },
        result: "match",
        matchedCategory: cat,
      };
    }
  }

  const oneAway = [...counts.values()].some((n) => n === 3);
  const mistakesLeft = s.mistakesLeft - 1;
  const status = mistakesLeft <= 0 ? "lost" : "playing";
  return {
    state: { ...s, mistakesLeft, selected: [], status },
    result: oneAway ? "one_away" : "wrong",
  };
}

/** Server-side stateless validator. Returns just the result and matched category if any. */
export function checkGuess(
  guess: string[],
  categories: Category[],
): { result: GuessResult; matchedCategory?: Category } {
  if (guess.length !== 4) return { result: "invalid" };
  const counts = new Map<string, number>();
  for (const t of guess) {
    const c = categoryOf(t, categories);
    if (c) counts.set(c.name, (counts.get(c.name) ?? 0) + 1);
  }
  for (const [name, n] of counts) {
    if (n === 4) {
      const cat = categories.find((c) => c.name === name)!;
      return { result: "match", matchedCategory: cat };
    }
  }
  const oneAway = [...counts.values()].some((n) => n === 3);
  return { result: oneAway ? "one_away" : "wrong" };
}
