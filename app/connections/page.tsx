"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppBar } from "@/components/brand/AppBar";
import { StreakChip } from "@/components/brand/StreakChip";
import { Grid } from "@/components/connections/Grid";
import { Mistakes } from "@/components/connections/Mistakes";
import { ActionRow } from "@/components/connections/ActionRow";
import { WinModal } from "@/components/connections/WinModal";
import { MiniPill } from "@/components/brand/NowPlaying/MiniPill";
import { initState, toggleTile, clearSelection, type ConnectionsState, type Category } from "@/lib/connections";
import { seededShuffle } from "@/lib/shuffle";

type PuzzleResp = {
  date: string;
  edition_no: number;
  lineup_artists: string[];
  theme_pull_quote: string | null;
  marginalia_quote: string | null;
  tiles: string[];
};

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
    if (state.status === "won" || state.status === "lost") {
      const open = async () => {
        if (state.status === "won") {
          const r = await fetch("/api/streak/complete", { method: "POST" });
          if (r.ok) {
            const d = await r.json();
            setStreak({ current: d.current, longest: d.longest });
          }
        }
        setModalOpen(true);
      };
      void open();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.status]);

  const elapsed = useMemo(() => Math.floor((Date.now() - startRef.current) / 1000), [state?.status]);

  if (error === "no_puzzle") {
    return (
      <>
        <AppBar
          wordmark={<span className="mono uppercase text-[10.5px] tracking-[0.22em]">CONNECTIONS · 1 OF 6</span>}
          backHref="/"
          rightSlot={<StreakChip />}
        />
        <div className="mx-4 mt-8 serif italic" style={{ color: "var(--taupe)" }}>
          No puzzle for today yet — check back at midnight ET.
        </div>
      </>
    );
  }

  if (!puzzle || !state) {
    return (
      <>
        <AppBar
          wordmark={<span className="mono uppercase text-[10.5px] tracking-[0.22em]">CONNECTIONS · 1 OF 6</span>}
          backHref="/"
          rightSlot={<StreakChip />}
        />
        <div className="mx-4 mt-8 mono text-[11px]" style={{ color: "var(--taupe)" }}>LOADING…</div>
      </>
    );
  }

  return (
    <>
      <AppBar
        wordmark={<span className="mono uppercase text-[10.5px] tracking-[0.22em]">CONNECTIONS · 1 OF 6</span>}
        backHref="/"
        rightSlot={<StreakChip />}
      />
      <div className="flex-1 overflow-y-auto pb-2">
        <div className="mx-4 mt-4">
          <p className="serif text-[19px] font-medium" style={{ color: "var(--ink)" }}>
            Sixteen songs. <span className="block">Four hidden categories.</span>
          </p>
          {puzzle.theme_pull_quote ? (
            <p className="serif italic text-[13px] mt-2" style={{ color: "var(--taupe)" }}>{puzzle.theme_pull_quote}</p>
          ) : null}
        </div>
        <Mistakes left={state.mistakesLeft} />
        <Grid tiles={state.tiles} selected={state.selected} disabled={state.status !== "playing"} onToggle={(t) => setState((s) => s ? toggleTile(s, t) : s)} />

        {puzzle.marginalia_quote ? (
          <div
            className="mx-4 mt-4 px-3 py-2 serif italic text-[12.5px]"
            style={{ borderLeft: "2px solid var(--rust)", background: "var(--paper-2)", color: "var(--taupe)" }}
          >{puzzle.marginalia_quote}</div>
        ) : null}

        {state.solved.length > 0 ? (
          <div className="mx-4 mt-3 space-y-1">
            {state.solved.map((c) => (
              <div key={c.name} className="serif text-[14px] px-3 py-2 rounded-[4px]" style={{ background: "var(--rust)", color: "var(--paper)" }}>
                {c.name.toUpperCase()} — {c.members.join(", ")}
              </div>
            ))}
          </div>
        ) : null}

        <ActionRow
          onShuffle={() => setState((s) => s ? { ...s, tiles: seededShuffle(s.tiles, `${puzzle.date}:${Date.now()}`) } : s)}
          onClear={() => setState((s) => s ? clearSelection(s) : s)}
          onSubmit={submit}
          submitDisabled={state.selected.length !== 4}
        />

        {toast ? (
          <div className="mx-4 mt-3 mono uppercase text-[10px] tracking-[0.22em] text-center" style={{ color: "var(--taupe)" }}>
            {toast}
          </div>
        ) : null}

        <div className="h-6" />
      </div>

      <div className="px-4 py-2 flex justify-center" style={{ borderTop: "1px solid var(--hair)" }}>
        <MiniPill />
      </div>

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
