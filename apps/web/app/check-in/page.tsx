"use client";
// apps/web/app/check-in/page.tsx

import { useState } from "react";

const STATE_COLOR: Record<string, string> = {
  GREEN:  "text-green-400 border-green-400",
  YELLOW: "text-yellow-400 border-yellow-400",
  RED:    "text-red-400 border-red-400",
};

// Thin mapper: /api/state/today response → UI format
interface StateResponse {
  state: string;
  confidence: number;
  reasons: string[];
  meta: {
    avg_energy_7d: number;
    avg_stress_7d: number;
    avg_mood_7d: number;
    days_with_data: number;
    cached: boolean;
  };
}

interface UIState {
  state: string;
  confidence: number;
  reasons: string[];
  days_with_data: number;
}

function mapStateToUI(res: StateResponse): UIState {
  return {
    state: res.state,
    confidence: res.confidence,
    reasons: res.reasons,
    days_with_data: res.meta.days_with_data,
  };
}

export default function CheckInPage() {
  const [energy,  setEnergy]  = useState(3);
  const [mood,    setMood]    = useState(3);
  const [stress,  setStress]  = useState(3);
  const [notes,   setNotes]   = useState("");
  const [status,  setStatus]  = useState<"idle"|"loading"|"done"|"error">("idle");
  const [uiState, setUiState] = useState<UIState | null>(null);

  async function fetchState() {
    const res = await fetch("/api/state/today", {
      headers: { "x-user-id": "demo-user" },
    });
    if (!res.ok) throw new Error("State fetch failed");
    const json: StateResponse = await res.json();
    setUiState(mapStateToUI(json));
  }

  async function submitLog() {
    setStatus("loading");
    const today = new Date().toISOString().slice(0, 10);
    try {
      const logRes = await fetch("/api/logs", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "demo-user" },
        body: JSON.stringify({ day_key: today, energy, mood, stress, notes }),
      });
      if (!logRes.ok) throw new Error("Log save failed");
      await fetchState();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-10">

        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-500">The Munk</p>
          <h1 className="text-3xl font-light">Dagens innsjekk</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          {[
            { label: "Energi",   value: energy,  set: setEnergy },
            { label: "Humør",    value: mood,    set: setMood   },
            { label: "Stress",   value: stress,  set: setStress },
          ].map(({ label, value, set }) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="tabular-nums">{value} / 5</span>
              </div>
              <input type="range" min={1} max={5} step={1} value={value}
                onChange={e => set(Number(e.target.value))}
                className="w-full accent-yellow-400" />
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Notater (valgfritt)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={2} placeholder="Noe som påvirket dagen?"
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2
                         text-sm text-gray-200 placeholder-gray-600 resize-none
                         focus:outline-none focus:border-gray-500" />
          </div>
        </div>

        {/* Submit */}
        <button onClick={submitLog} disabled={status === "loading"}
          className="w-full py-3 border border-gray-600 text-sm tracking-widest uppercase
                     hover:border-gray-400 transition-colors disabled:opacity-40">
          {status === "loading" ? "Laster…" : "Send inn"}
        </button>

        {/* State result */}
        {uiState && (
          <div className={`border rounded p-6 space-y-4 ${STATE_COLOR[uiState.state]}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-widest uppercase">Tilstand</span>
              <span className="text-2xl font-light">{uiState.state}</span>
            </div>
            <ul className="space-y-1">
              {uiState.reasons.map((r, i) => (
                <li key={i} className="text-sm text-gray-300">{r}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-600">
              Konfidans: {Math.round(uiState.confidence * 100)}% ·{" "}
              Dager med data: {uiState.days_with_data}
            </p>
          </div>
        )}

        {status === "error" && (
          <p className="text-center text-sm text-red-400">
            Kunne ikke hente state. Prøv igjen.
          </p>
        )}
      </div>
    </main>
  );
}
