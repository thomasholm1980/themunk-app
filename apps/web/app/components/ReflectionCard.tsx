"use client";
// apps/web/app/components/ReflectionCard.tsx
// Reflection Layer v1.1 — isolated, no coupling to state engine

import { useEffect, useState } from "react";

type Dim = "energy" | "stress" | "focus";
type Score = 1 | 2 | 3;

interface ReflectionState {
  energy: Score | null;
  stress: Score | null;
  focus:  Score | null;
}

interface Props {
  dayKey: string;
}

const LABELS: Record<Dim, string> = {
  energy: "Energy",
  stress: "Stress",
  focus:  "Focus",
};

const PILL_LABELS: Record<Score, string> = {
  1: "Low",
  2: "Mid",
  3: "High",
};

const SUMMARY_LABELS: Record<Score, string> = {
  1: "Low",
  2: "Mid",
  3: "High",
};

export default function ReflectionCard({ dayKey }: Props) {
  const [mode,    setMode]    = useState<"loading" | "input" | "summary">("loading");
  const [values,  setValues]  = useState<ReflectionState>({ energy: null, stress: null, focus: null });
  const [saved,   setSaved]   = useState<ReflectionState | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/reflection/today");
        const json = await res.json();
        if (json.reflection) {
          setSaved(json.reflection);
          setMode("summary");
        } else {
          setMode("input");
        }
      } catch {
        setMode("input");
      }
    }
    load();
  }, []);

  function select(dim: Dim, score: Score) {
    const next = { ...values, [dim]: score };
    setValues(next);
    if (next.energy && next.stress && next.focus) {
      post(next as Required<ReflectionState>);
    }
  }

  async function post(v: Required<ReflectionState>) {
    setPosting(true);
    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, day_key: dayKey }),
      });
      if (res.ok) {
        setSaved(v);
        setMode("summary");
      }
    } catch {
      // silent — user can retry
    } finally {
      setPosting(false);
    }
  }

  if (mode === "loading") return null;

  if (mode === "summary" && saved) {
    return (
      <div className="space-y-2">
        <p className="text-xs tracking-[0.25em] uppercase text-zinc-600">Reflection</p>
        <div className="flex gap-4">
          {(["energy", "stress", "focus"] as Dim[]).map(dim => (
            <div key={dim} className="flex flex-col items-center gap-1">
              <span className="text-xs text-zinc-500">{LABELS[dim]}</span>
              <span className="text-sm text-zinc-300 font-mono">
                {SUMMARY_LABELS[saved[dim] as Score]}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs tracking-[0.25em] uppercase text-zinc-600">Reflection</p>
      {(["energy", "stress", "focus"] as Dim[]).map(dim => (
        <div key={dim} className="space-y-2">
          <p className="text-xs text-zinc-500">{LABELS[dim]}</p>
          <div className="flex gap-2">
            {([1, 2, 3] as Score[]).map(score => {
              const active = values[dim] === score;
              return (
                <button
                  key={score}
                  disabled={posting}
                  onClick={() => select(dim, score)}
                  className={`flex-1 py-2 rounded-lg text-xs tracking-widest uppercase transition-colors border
                    ${active
                      ? "bg-yellow-400 border-yellow-400 text-zinc-900"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                >
                  {PILL_LABELS[score]}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {posting && (
        <p className="text-xs text-zinc-500 animate-pulse">Saving...</p>
      )}
    </div>
  );
}
