"use client";
// apps/web/app/check-in/page.tsx
// v2.1.0 — clean rewrite per Manju spec

import { useEffect, useMemo, useState } from "react";
import LongitudinalPanel from "../components/LongitudinalPanel";
import ReflectionSignal from "../components/ReflectionSignal";

const USER_ID = "thomas";

const STATE_BORDER: Record<string, string> = {
  GREEN:  "border-emerald-700",
  YELLOW: "border-yellow-700",
  RED:    "border-red-800",
};

interface DailyBrief {
  version: "v1";
  day_key: string;
  state: "GREEN" | "YELLOW" | "RED";
  observation_code: string;
  observation_text: string;
  context_text: string;
  guidance_items: string[];
  priority_items: string[];
  trajectory_text?: string;
  reflection_prompt?: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | null;
  telemetry: {
    protocol_version: string;
    brief_version: string;
    has_trajectory: boolean;
  };
}

interface StateResponse {
  state: "GREEN" | "YELLOW" | "RED" | null;
  daily_brief?: DailyBrief;
  message?: string;
}

export default function CheckInPage() {
  const [energy, setEnergy] = useState(3);
  const [mood,   setMood]   = useState(3);
  const [stress, setStress] = useState(3);
  const [notes,  setNotes]  = useState("");

  const [status,    setStatus]    = useState<"idle" | "loading" | "done" | "error">("idle");
  const [brief,     setBrief]     = useState<DailyBrief | null>(null);
  const [dateLabel, setDateLabel] = useState("");

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
    if (json.daily_brief) setBrief(json.daily_brief);
  }

  useEffect(() => {
    fetchState();
  }, []);

  async function submitLog() {
    setStatus("loading");
    try {
      const logRes = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": USER_ID,
        },
        body: JSON.stringify({ day_key: todayKey, energy, mood, stress, notes }),
      });
      if (!logRes.ok) throw new Error("Log failed");
      await fetchState();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-6 py-16 bg-[#0e0e0e]">
      <div className="w-full max-w-md space-y-10">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-600">The Munk</p>
          <p className="text-sm text-zinc-500">{dateLabel}</p>
        </div>

        {/* DailyBrief */}
        {brief && (
          <div className={`border rounded-sm p-6 space-y-6 ${STATE_BORDER[brief.state] ?? "border-zinc-700"}`}>

            <div className="space-y-2">
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-500">The Munk observes</p>
              <p className="text-zinc-100 text-base leading-relaxed">{brief.observation_text}</p>
              <p className="text-zinc-400 text-sm leading-relaxed">{brief.context_text}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-500">Today&apos;s guidance</p>
              <ul className="space-y-1">
                {brief.guidance_items.map((item, i) => (
                  <li key={i} className="text-sm text-zinc-300 flex gap-2">
                    <span className="text-zinc-600">–</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-500">Today&apos;s priorities</p>
              <ul className="space-y-1">
                {brief.priority_items.map((item, i) => (
                  <li key={i} className="text-sm text-zinc-300 flex gap-2">
                    <span className="text-zinc-600">–</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            {brief.trajectory_text && (
              <p className="text-xs text-zinc-500 italic border-t border-zinc-800 pt-4">
                {brief.trajectory_text}
              </p>
            )}

            <div className="border-t border-zinc-800 pt-3">
              <p className="text-xs text-zinc-700 tracking-widest uppercase">See signals ↓</p>
            </div>
          </div>
        )}

        {/* Reflection Signal */}
        {brief && (
          <div className="border-t border-zinc-800 pt-4">
            <ReflectionSignal dayKey={todayKey} userId={USER_ID} />
          </div>
        )}

        {/* Check-in form */}
        <div className="space-y-6">
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-600">Dagens innsjekk</p>

          {[
            { label: "Energi", value: energy, set: setEnergy },
            { label: "Humør",  value: mood,   set: setMood   },
            { label: "Stress", value: stress, set: setStress },
          ].map(({ label, value, set }) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">{label}</span>
                <span className="tabular-nums text-zinc-300">{value} / 5</span>
              </div>
              <input
                type="range" min={1} max={5} step={1} value={value}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Notater (valgfritt)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Noe som påvirket dagen?"
              className="w-full bg-[#1a1a1a] border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        <button
          onClick={submitLog}
          disabled={status === "loading"}
          className="w-full py-3 border border-zinc-600 text-sm tracking-widest uppercase text-zinc-300 hover:border-zinc-400 transition-colors disabled:opacity-40"
        >
          {status === "loading" ? "Laster…" : "Send inn"}
        </button>

        {status === "error" && (
          <p className="text-center text-sm text-red-400">Kunne ikke lagre. Prøv igjen.</p>
        )}

        {/* Longitudinal */}
        <div className="border-t border-zinc-800 pt-6">
          <p className="text-xs tracking-[0.3em] uppercase text-zinc-600 mb-6">Historisk utvikling</p>
          <LongitudinalPanel />
        </div>

      </div>
    </main>
  );
}
