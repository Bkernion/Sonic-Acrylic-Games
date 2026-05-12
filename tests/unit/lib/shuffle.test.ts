import { describe, it, expect } from "vitest";
import { seededShuffle } from "@/lib/shuffle";

describe("seededShuffle", () => {
  it("returns same permutation for same seed", () => {
    const a = seededShuffle([1,2,3,4,5,6,7,8], "2026-05-11");
    const b = seededShuffle([1,2,3,4,5,6,7,8], "2026-05-11");
    expect(a).toEqual(b);
  });

  it("returns different permutation for different seeds", () => {
    const a = seededShuffle([1,2,3,4,5,6,7,8], "2026-05-11");
    const c = seededShuffle([1,2,3,4,5,6,7,8], "2026-05-12");
    expect(a).not.toEqual(c);
  });

  it("contains the same elements", () => {
    const input = [1,2,3,4,5,6,7,8];
    const out = seededShuffle(input, "x");
    expect([...out].sort()).toEqual(input);
  });

  it("does not mutate input", () => {
    const input = [1,2,3];
    seededShuffle(input, "x");
    expect(input).toEqual([1,2,3]);
  });
});
