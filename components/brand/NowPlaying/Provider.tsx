"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  initQueue, advance, prev as prevTrack, setIndex,
  type QueueState, type Track,
} from "@/lib/audioQueue";

type NowPlayingApi = {
  current: Track | undefined;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  next: () => void;
  prev: () => void;
  jumpTo: (i: number) => void;
};

const Ctx = createContext<NowPlayingApi | null>(null);

const STORAGE_KEY = "sag:np";

export function NowPlayingProvider({ tracks, children }: { tracks: Track[]; children: React.ReactNode }) {
  const [q, setQ] = useState<QueueState>(() => initQueue(tracks));
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Restore last index from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.index === "number") {
        setQ((s) => setIndex(s, data.index));
      }
    } catch {}
  }, []);

  // Persist index when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ index: q.index })); } catch {}
  }, [q.index]);

  // Audio src follows current track; reset duration; auto-advance on end
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => setQ((s) => advance(s));
    const onMeta = () => setDuration(el.duration || 0);
    const onTime = () => setQ((s) => ({ ...s, positionSec: el.currentTime }));
    el.addEventListener("ended", onEnded);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("timeupdate", onTime);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("timeupdate", onTime);
    };
  }, []);

  // When index changes, swap src; if we were playing, keep playing
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const wasPlaying = q.isPlaying;
    el.src = q.tracks[q.index]?.file ?? "";
    if (wasPlaying) {
      el.play().catch(() => setQ((s) => ({ ...s, isPlaying: false })));
    }
  }, [q.index, q.tracks]);

  const play = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      await el.play();
      setQ((s) => ({ ...s, isPlaying: true }));
    } catch {
      // autoplay blocked — keep paused state
      setQ((s) => ({ ...s, isPlaying: false }));
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setQ((s) => ({ ...s, isPlaying: false }));
  }, []);

  const toggle = useCallback(async () => {
    if (q.isPlaying) pause();
    else await play();
  }, [q.isPlaying, play, pause]);

  const next = useCallback(() => setQ(advance), []);
  const prev = useCallback(() => setQ(prevTrack), []);
  const jumpTo = useCallback((i: number) => setQ((s) => setIndex(s, i)), []);

  const api: NowPlayingApi = useMemo(() => ({
    current: q.tracks[q.index],
    isPlaying: q.isPlaying,
    positionSec: q.positionSec,
    durationSec: duration,
    play, pause, toggle, next, prev, jumpTo,
  }), [q, duration, play, pause, toggle, next, prev, jumpTo]);

  return (
    <Ctx.Provider value={api}>
      {/* Persistent audio element lives at root */}
      <audio ref={audioRef} preload="metadata" />
      {children}
    </Ctx.Provider>
  );
}

export function useNowPlaying(): NowPlayingApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useNowPlaying must be used inside <NowPlayingProvider>");
  return v;
}
