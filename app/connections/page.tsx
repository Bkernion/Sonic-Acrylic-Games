"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppBar } from "@/components/brand/AppBar";
import { StreakChip } from "@/components/brand/StreakChip";
import { Grid } from "@/components/connections/Grid";
import { Mistakes } from "@/components/connections/Mistakes";
import { ActionRow } from "@/components/connections/ActionRow";
import { WinModal } from "@/components/connections/WinModal";
import { MiniPill } from "@/components/brand/NowPlaying/MiniPill";
import { initState, toggleTile, clearSelection, revealAll, type ConnectionsState, type Category } from "@/lib/connections";
import { seededShuffle } from "@/lib/shuffle";

type PuzzleResp = {
  date: string;
  edition_no: number;
  lineup_artists: string[];
  theme_pull_quote: string | null;
  marginalia_quote: string | null;
  tiles: string[];
};

function colorForDifficulty(d: 1 | 2 | 3 | 4): { bg: string; fg: string } {
  switch (d) {
    case 1: return { bg: "var(--paper-3)", fg: "var(--ink)" };
    case 2: return { bg: "var(--hair)",    fg: "var(--ink-2)" };
    case 3: return { bg: "var(--ink)",     fg: "var(--paper)" };
    case 4: return { bg: "var(--rust)",    fg: "var(--paper)" };
  }
}

const APPBAR_WORDMARK = (
  <span className="mono uppercase" style={{ fontSize: 10.5, letterSpacing: "0.22em" }}>
    CONNECTIONS · 1 OF 6
  </span>
);

export default function ConnectionsPage() {
  const [puzzle, setPuzzle] = useState<PuzzleResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ConnectionsState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [streak, setStreak] = useState<{ current: number; longest: number }>({ current: 0, longest: 0 });
  const startRef = useRef<number>(Date.now());
  const mistakesUsedRef = useRef(0);

  useEffect(() => {
    fetch("/api/puzzle/today", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "no_puzzle");
        return r.json();
      })
      .then((p: PuzzleResp) => {
        setPuzzle(p);
        setState(initState(p.tiles));
        startRef.current = Date.now();
      })
      .catch((e) => setError(String(e.message ?? e)));
    fetch("/api/streak/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStreak({ current: d.current ?? 0, longest: d.longest ?? 0 }))
      .catch(() => {});
  }, []);

  async function submit() {
    if (!state || !puzzle) return;
    if (state.selected.length !== 4) return;
    const guess = state.selected;
    const r = await fetch("/api/connections/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tiles: guess }),
    });
    const data = await r.json() as { result: "match" | "one_away" | "wrong" | "invalid"; matchedCategory?: Category };
    if (data.result === "match" && data.matchedCategory) {
      const cat = data.matchedCategory;
      setState((s) => {
        if (!s) return s;
        const newTiles = s.tiles.filter((t) => !cat.members.includes(t));
        const solved = [...s.solved, cat];
        const status = solved.length === 4 ? "won" : "playing";
        return { ...s, tiles: newTiles, solved, selected: [], status };
      });
      setToast(`Group: ${cat.name}`);
    } else if (data.result === "one_away") {
      mistakesUsedRef.current += 1;
      setState((s) => s ? { ...s, mistakesLeft: s.mistakesLeft - 1, selected: [], status: s.mistakesLeft - 1 <= 0 ? "lost" : "playing" } : s);
      setToast("One away.");
    } else if (data.result === "wrong") {
      mistakesUsedRef.current += 1;
      setState((s) => s ? { ...s, mistakesLeft: s.mistakesLeft - 1, selected: [], status: s.mistakesLeft - 1 <= 0 ? "lost" : "playing" } : s);
      setToast("Not this time.");
    }
    setTimeout(() => setToast(null), 1500);
  }

  // Open modal + advance streak when terminal
  useEffect(() => {
    if (!state) return;
    if (state.status === "won") {
      const finish = async () => {
        const r = await fetch("/api/streak/complete", { method: "POST" });
        if (r.ok) {
          const d = await r.json();
          setStreak({ current: d.current, longest: d.longest });
        }
        setModalOpen(true);
      };
      void finish();
    } else if (state.status === "lost") {
      const reveal = async () => {
        try {
          const r = await fetch("/api/puzzle/reveal", { cache: "no-store" });
          if (r.ok) {
            const d = await r.json() as { categories: Category[] };
            setState((s) => s ? revealAll(s, d.categories) : s);
          }
        } catch {}
        // Let the reveal land visually before the modal opens.
        await new Promise((res) => setTimeout(res, 1500));
        setModalOpen(true);
      };
      void reveal();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.status]);

  const elapsed = useMemo(() => Math.floor((Date.now() - startRef.current) / 1000), [state?.status]);

  if (error === "no_puzzle") {
    return (
      <>
        <AppBar wordmark={APPBAR_WORDMARK} backHref="/" rightSlot={<StreakChip />} />
        <div className="mx-4 mt-8 mono" style={{ color: "var(--taupe)", fontSize: 11, textTransform: "uppercase" }}>
          NO PUZZLE FOR TODAY YET — CHECK BACK AT MIDNIGHT ET.
        </div>
      </>
    );
  }

  if (!puzzle || !state) {
    return (
      <>
        <AppBar wordmark={APPBAR_WORDMARK} backHref="/" rightSlot={<StreakChip />} />
        <div className="mx-4 mt-8 mono" style={{ fontSize: 11, color: "var(--taupe)" }}>LOADING…</div>
      </>
    );
  }

  return (
    <>
      <AppBar wordmark={APPBAR_WORDMARK} backHref="/" rightSlot={<StreakChip />} />

      <div className="flex-1 overflow-y-auto pb-2">
        {/* Prompt + subtitle */}
        <div style={{ padding: 14 }}>
          <p className="mono" style={{ fontSize: 21, lineHeight: 1.15, fontWeight: 500, color: "var(--ink)", textTransform: "uppercase" }}>
            Sixteen songs.<br />Four hidden categories.
          </p>
          <p className="mono" style={{ fontSize: 11, lineHeight: 1.4, color: "var(--rust)", marginTop: 4, textTransform: "uppercase", fontStyle: "normal", letterSpacing: "0.04em" }}>
            TAP 4 TILES. SUBMIT TO CHECK. 4 WRONG GUESSES ENDS THE GAME.
          </p>
        </div>

        {/* Mistakes row */}
        <Mistakes left={state.mistakesLeft} />

        {/* Tile grid */}
        <Grid
          tiles={state.tiles}
          selected={state.selected}
          disabled={state.status !== "playing"}
          onToggle={(t) => setState((s) => s ? toggleTile(s, t) : s)}
        />

        {/* Solved rows */}
        {state.solved.length > 0 ? (
          <div className="mx-4 mt-3 flex flex-col gap-2">
            {state.solved.map((c) => {
              const { bg, fg } = colorForDifficulty(c.difficulty);
              return (
                <div key={c.name} className="px-3 py-2" style={{ background: bg, color: fg, borderRadius: 0 }}>
                  <div className="mono uppercase" style={{ fontSize: 10, letterSpacing: "0.18em", opacity: 0.9 }}>{c.name}</div>
                  <div className="mono uppercase" style={{ fontSize: 11, marginTop: 2, letterSpacing: "0.04em" }}>{c.members.join(" · ")}</div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Action row */}
        <ActionRow
          onShuffle={() => setState((s) => s ? { ...s, tiles: seededShuffle(s.tiles, `${puzzle.date}:${Date.now()}`) } : s)}
          onClear={() => setState((s) => s ? clearSelection(s) : s)}
          onSubmit={submit}
          submitDisabled={state.selected.length !== 4}
        />

        {toast ? (
          <div className="mx-4 mt-3 mono uppercase text-center" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--taupe)" }}>
            {toast}
          </div>
        ) : null}

        <div style={{ height: 24 }} />
      </div>

      {/* MiniPill ribbon */}
      <div className="flex justify-center px-4 py-2" style={{ borderTop: "1px solid var(--hair)" }}>
        <MiniPill />
      </div>

      {/* Win/Loss modal */}
      {modalOpen && state ? (
        <WinModal
          stats={{
            outcome: state.status === "won" ? "won" : "lost",
            elapsedSec: elapsed,
            mistakesUsed: mistakesUsedRef.current,
            streakCurrent: streak.current,
            streakLongest: streak.longest,
          }}
          editionId={puzzle.edition_no}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  );
}
