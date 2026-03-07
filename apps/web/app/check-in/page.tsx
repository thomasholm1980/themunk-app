"use client";
// apps/web/app/check-in/page.tsx
// Core Screen UI Binding v1
// Pure renderer of core_screen contract. No frontend interpretation logic.
// v3.0.0

import { useEffect, useMemo, useState } from "react";
import ReflectionSignal from "../components/ReflectionSignal";
import LongitudinalPanel from "../components/LongitudinalPanel";

const USER_ID = "thomas";

const STATE_BORDER: Record<string, string> = {
  GREEN:  "border-emerald-700",
  YELLOW: "border-yellow-700",
  RED:    "border-red-800",
};

const STATE_DOT: Record<string, string> = {
  GREEN:  "bg-emerald-500",
  YELLOW: "bg-yellow-400",
  RED:    "bg-red-500",
};

interface CoreScreen {
  version:            "screen_v1";
  state:              "GREEN" | "YELLOW" | "RED";
  headline:           string;
  observation_text:   string;
  context_text:       string | null;
  guidance_text:      string;
  reflection_options: ("ACCURATE" | "SOMEWHAT_ACCURATE" | "NOT_ACCURATE")[];
}

interface StateResponse {
  state:        "GREEN" | "YELLOW" | "RED" | null;
  core_screen?: CoreScreen;
}

export default function CheckInPage() {
  const [energy, setEnergy] = useState(3);
  const [mood,   setMood]   = useState(3);
  const [stress, setStress] = useState(3);
  const [notes,  setNotes]  = useState("");

  const [status,     setStatus]     = useState<"idle" | "loading" | "done" | "error">("idle");
  const [screen,     setScreen]     = useState<CoreScreen | null>(null);
  const [dateLabel,  setDateLabel]  = useState("");

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString("no-NO", {
        weekday: "long", day: "numeric", month: "long",
      })
    );
  }, []);

  async function fetchState() {
    const res = await fetch("/api/state/today", {
      headers: { "x-user-id": USER_ID },
    });
    if (!res.ok) return;
    const json: StateResponse = await res.json();
    if (json.core_screen) setScreen(json.core_screen);
  }

  useEffect(() => { fetchState(); }, []);

  async function submitLog() {
    setStatus("loading");
    try {
      const logRes = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": USER_ID },
        body: JSON.stringify({ energy, mood, stress, notes, day_key: todayKey }),
      });
      if (!logRes.ok) { setStatus("error"); return; }
      await fetchState();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const borderClass = screen ? (STATE_BORDER[screen.state] ?? "border-zinc-700") : "border-zinc-700";
  const dotClass    = screen ? (STATE_DOT[screen.state]    ?? "bg-zinc-500")      : "bg-zinc-500";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 font-mono">The Munk</p>
          <p className="text-xs text-zinc-600 font-mono capitalize">{dateLabel}</p>
        </div>

        {/* Input */}
        <div className={`border rounded-xl p-6 space-y-5 bg-zinc-900 ${borderClass}`}>
          <p className="text-xs tracking-[0.25em] uppercase text-zinc-500">Today&apos;s signals</p>
          {[
            { label: "Sleep", value: energy, set: setEnergy },
            { label: "Mood",  value: mood,   set: setMood   },
            { label: "Stress",value: stress, set: setStress },
          ].map(({ label, value, set }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{label}</span><span>{value} / 5</span>
              </div>
              <input type="range" min={1} max={5} value={value}
                onChange={e => set(Number(e.target.value))}
                className="w-full accent-yellow-400" />
            </div>
          ))}
          <div className="space-y-1">
            <p className="text-xs text-zinc-500">Notes (optional)</p>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Anything worth noting..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
          </div>
          <button onClick={submitLog} disabled={status === "loading"}
            className="w-full py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm tracking-widest uppercase text-zinc-300 transition-colors disabled:opacity-50">
            {status === "loading" ? "Reading..." : "Send Inn"}
          </button>
        </div>

        {/* Core Screen — pure render of server contract */}
        {screen && (
          <div className={`border rounded-xl p-6 space-y-4 bg-zinc-900 ${borderClass}`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dotClass}`} />
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-500">Munk Forecast</p>
            </div>

            {/* 1. Headline */}
            <p className="text-lg font-semibold text-zinc-100 tracking-wide">
              {screen.headline}
            </p>

            {/* 2. Observation */}
            <p className="text-sm text-zinc-300 leading-relaxed">
              {screen.observation_text}
            </p>

            {/* 3. Context — only if not null */}
            {screen.context_text && (
              <p className="text-sm text-zinc-400 leading-relaxed italic">
                {screen.context_text}
              </p>
            )}

            {/* 4. Guidance */}
            <div className="pt-1 border-t border-zinc-800">
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-500 mb-2">Guidance</p>
              <p className="text-sm text-zinc-300">{screen.guidance_text}</p>
            </div>

            {/* 5. Reflection */}
            <div className="pt-1 border-t border-zinc-800">
              <ReflectionSignal
                userId={USER_ID}
                dayKey={todayKey}
              />
            </div>
          </div>
        )}

        <LongitudinalPanel />
      </div>
    </main>
  );
}
