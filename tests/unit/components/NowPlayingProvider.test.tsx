import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NowPlayingProvider, useNowPlaying } from "@/components/brand/NowPlaying/Provider";
import { TRACKS } from "@/lib/tracks";

function Probe() {
  const np = useNowPlaying();
  return (
    <>
      <span data-testid="title">{np.current?.title}</span>
      <span data-testid="playing">{String(np.isPlaying)}</span>
    </>
  );
}

describe("NowPlayingProvider", () => {
  it("exposes the current track and is paused by default", () => {
    render(
      <NowPlayingProvider tracks={TRACKS}>
        <Probe />
      </NowPlayingProvider>
    );
    expect(screen.getByTestId("title").textContent).toBe(TRACKS[0].title);
    expect(screen.getByTestId("playing").textContent).toBe("false");
  });
});
