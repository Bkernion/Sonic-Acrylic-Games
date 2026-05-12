import { describe, it, expect } from "vitest";
import {
  initState, toggleTile, clearSelection, applyGuess, checkGuess,
  type ConnectionsState, type Category,
} from "@/lib/connections";

const CATS: Category[] = [
  { name: "Cat A", difficulty: 1, members: ["a1","a2","a3","a4"] },
  { name: "Cat B", difficulty: 2, members: ["b1","b2","b3","b4"] },
  { name: "Cat C", difficulty: 3, members: ["c1","c2","c3","c4"] },
  { name: "Cat D", difficulty: 4, members: ["d1","d2","d3","d4"] },
];
const TILES = ["a1","b1","c1","d1","a2","b2","c2","d2","a3","b3","c3","d3","a4","b4","c4","d4"];

describe("connections state machine", () => {
  it("init has 16 tiles, 0 selected, 4 mistakes left", () => {
    const s = initState(TILES);
    expect(s.tiles).toEqual(TILES);
    expect(s.selected).toEqual([]);
    expect(s.mistakesLeft).toBe(4);
    expect(s.solved).toEqual([]);
    expect(s.status).toBe("playing");
  });

  it("toggleTile adds and removes", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    s = toggleTile(s, "b1");
    expect(s.selected).toEqual(["a1", "b1"]);
    s = toggleTile(s, "a1");
    expect(s.selected).toEqual(["b1"]);
  });

  it("toggleTile caps at 4", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    s = toggleTile(s, "a2");
    s = toggleTile(s, "a3");
    s = toggleTile(s, "a4");
    s = toggleTile(s, "b1");
    expect(s.selected.length).toBe(4);
    expect(s.selected).not.toContain("b1");
  });

  it("applyGuess returns 'match' for correct group, removes tiles and clears selection", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    s = toggleTile(s, "a2");
    s = toggleTile(s, "a3");
    s = toggleTile(s, "a4");
    const r = applyGuess(s, CATS);
    expect(r.result).toBe("match");
    expect(r.state.solved.length).toBe(1);
    expect(r.state.solved[0].name).toBe("Cat A");
    expect(r.state.tiles).not.toContain("a1");
    expect(r.state.selected).toEqual([]);
    expect(r.state.mistakesLeft).toBe(4);
  });

  it("applyGuess returns 'one_away' when 3 of 4 match a category", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    s = toggleTile(s, "a2");
    s = toggleTile(s, "a3");
    s = toggleTile(s, "b1");
    const r = applyGuess(s, CATS);
    expect(r.result).toBe("one_away");
    expect(r.state.mistakesLeft).toBe(3);
    expect(r.state.solved).toEqual([]);
  });

  it("applyGuess returns 'wrong' otherwise and decrements mistakes", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    s = toggleTile(s, "b1");
    s = toggleTile(s, "c1");
    s = toggleTile(s, "d1");
    const r = applyGuess(s, CATS);
    expect(r.result).toBe("wrong");
    expect(r.state.mistakesLeft).toBe(3);
  });

  it("4 wrongs -> status=lost", () => {
    let s = initState(TILES);
    for (let i = 0; i < 4; i++) {
      s = clearSelection(s);
      s = toggleTile(s, "a1");
      s = toggleTile(s, "b1");
      s = toggleTile(s, "c1");
      s = toggleTile(s, "d1");
      s = applyGuess(s, CATS).state;
    }
    expect(s.status).toBe("lost");
  });

  it("4 matches -> status=won", () => {
    let s = initState(TILES);
    for (const cat of CATS) {
      s = clearSelection(s);
      for (const m of cat.members) s = toggleTile(s, m);
      s = applyGuess(s, CATS).state;
    }
    expect(s.status).toBe("won");
    expect(s.solved.length).toBe(4);
  });

  it("rejects guess of !==4 selected", () => {
    let s = initState(TILES);
    s = toggleTile(s, "a1");
    const r = applyGuess(s, CATS);
    expect(r.result).toBe("invalid");
    expect(r.state.mistakesLeft).toBe(4);
  });
});

describe("checkGuess (server-side validator)", () => {
  it("match", () => {
    expect(checkGuess(["a1","a2","a3","a4"], CATS)).toMatchObject({ result: "match" });
    expect(checkGuess(["a1","a2","a3","a4"], CATS).matchedCategory?.name).toBe("Cat A");
  });
  it("one_away", () => {
    expect(checkGuess(["a1","a2","a3","b1"], CATS)).toMatchObject({ result: "one_away" });
  });
  it("wrong", () => {
    expect(checkGuess(["a1","b1","a2","b2"], CATS)).toMatchObject({ result: "wrong" });
  });
  it("invalid on wrong size", () => {
    expect(checkGuess(["a1","b1","c1"], CATS)).toMatchObject({ result: "invalid" });
  });
});
