"use client";
// ReflectionCard — Phase 15
// Logic unchanged. Visual: light-bg friendly, calm, minimal.

import { useEffect, useState } from "react";

type Dim = "energy" | "stress" | "focus";
type Score = 1 | 2 | 3;
interface ReflectionState { energy: Score|null; stress: Score|null; focus: Score|null; }
interface Props { dayKey: string; }

const LABELS: Record<Dim, string> = { energy: "Energy", stress: "Stress", focus: "Focus" };
const PILL: Record<Score, string>  = { 1: "Low", 2: "Mid", 3: "High" };

export default function ReflectionCard({ dayKey }: Props) {
  const [mode,    setMode]    = useState<"loading"|"input"|"summary">("loading");
  const [values,  setValues]  = useState<ReflectionState>({ energy:null, stress:null, focus:null });
  const [saved,   setSaved]   = useState<ReflectionState|null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch("/api/reflection/today")
      .then(r => r.json())
      .then(j => { if (j.reflection) { setSaved(j.reflection); setMode("summary"); } else setMode("input"); })
      .catch(() => setMode("input"));
  }, []);

  function select(dim: Dim, score: Score) {
    const next = { ...values, [dim]: score };
    setValues(next);
    if (next.energy && next.stress && next.focus) post(next as Required<ReflectionState>);
  }

  async function post(v: Required<ReflectionState>) {
    setPosting(true);
    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, day_key: dayKey }),
      });
      if (res.ok) { setSaved(v); setMode("summary"); }
    } catch { /* silent */ } finally { setPosting(false); }
  }

  if (mode === "loading") return null;

  if (mode === "summary" && saved) {
    return (
      <div className="space-y-2">
        <p className="text-xs tracking-[0.25em] uppercase text-zinc-500 font-mono">Reflection</p>
        <div className="flex gap-6">
          {(["energy","stress","focus"] as Dim[]).map(dim => (
            <div key={dim} className="flex flex-col gap-0.5">
              <span className="text-xs text-zinc-400 font-mono">{LABELS[dim]}</span>
              <span className="text-sm text-zinc-800 font-mono font-medium">{PILL[saved[dim] as Score]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs tracking-[0.25em] uppercase text-zinc-500 font-mono">Reflection</p>
      {(["energy","stress","focus"] as Dim[]).map(dim => (
        <div key={dim} className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 w-10 shrink-0">{LABELS[dim]}</span>
          <div className="flex gap-2 flex-1">
            {([1,2,3] as Score[]).map(score => {
              const active = values[dim] === score;
              return (
                <button
                  key={score}
                  disabled={posting}
                  onClick={() => select(dim, score)}
                  className={`flex-1 py-1.5 rounded text-xs tracking-widest uppercase transition-colors border font-mono
                    ${active
                      ? "bg-zinc-800 border-zinc-800 text-white"
                      : "bg-transparent border-zinc-300 text-zinc-500 hover:border-zinc-500 hover:text-zinc-700"
                    }`}
                >
                  {PILL[score]}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {posting && <p className="text-xs text-zinc-400 font-mono animate-pulse">Saving…</p>}
    </div>
  );
}
