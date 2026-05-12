import { describe, it, expect } from "vitest";
import { initQueue, advance, prev, setIndex, currentTrack, type Track } from "@/lib/audioQueue";

const TRACKS: Track[] = [
  { id: "t1", title: "One", artist: "SA", file: "/audio/t1.mp3", duration_sec: 200, streaming_links: {} },
  { id: "t2", title: "Two", artist: "SA", file: "/audio/t2.mp3", duration_sec: 180, streaming_links: {} },
  { id: "t3", title: "Three", artist: "SA", file: "/audio/t3.mp3", duration_sec: 220, streaming_links: {} },
];

describe("audioQueue", () => {
  it("initQueue starts at index 0, paused", () => {
    const q = initQueue(TRACKS);
    expect(q.index).toBe(0);
    expect(q.isPlaying).toBe(false);
    expect(currentTrack(q)).toBe(TRACKS[0]);
  });

  it("advance moves forward and wraps", () => {
    let q = initQueue(TRACKS);
    q = advance(q);
    expect(q.index).toBe(1);
    q = advance(q);
    expect(q.index).toBe(2);
    q = advance(q);
    expect(q.index).toBe(0);
  });

  it("prev moves backward and wraps", () => {
    let q = initQueue(TRACKS);
    q = prev(q);
    expect(q.index).toBe(2);
    q = prev(q);
    expect(q.index).toBe(1);
  });

  it("setIndex clamps", () => {
    let q = initQueue(TRACKS);
    q = setIndex(q, 99);
    expect(q.index).toBe(2);
    q = setIndex(q, -5);
    expect(q.index).toBe(0);
  });
});
