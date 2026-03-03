"use client";
// apps/web/app/check-in/page.tsx

import { useState } from "react";

const STATE_COLOR: Record<string, string> = {
  GREEN:  "text-green-400 border-green-400",
  YELLOW: "text-yellow-400 border-yellow-400",
  RED:    "text-red-400 border-red-400",
};

export default function CheckInPage() {
  const [energy,  setEnergy]  = useState(3);
  const [mood,    setMood]    = useState(3);
  const [stress,  setStress]  = useState(3);
  const [notes,   setNotes]   = useState("");
  const [status,  setStatus]  = useState<"idle"|"loading"|"done"|"error">("idle");
  const [brief,   setBrief]   = useState<null | {
    state: string; one_action: { instruction: string; category: string };
    state_confidence: number;
  }>(null);

  async function fetchBrief() {
    setStatus("loading");
    try {
      const res = await fetch("/api/brief/today", {
        headers: { "x-user-id": "demo-user" },
      });
      const json = await res.json();
      setBrief(json.data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  async function submitLog() {
    setStatus("loading");
    const today = new Date().toISOString().slice(0, 10);
    try {
      await fetch("/api/logs", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "demo-user" },
        body: JSON.stringify({ day_key: today, energy, mood, stress, notes }),
      });
      await fetchBrief();
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

        {/* Brief result */}
        {brief && (
          <div className={`border rounded p-6 space-y-4 ${STATE_COLOR[brief.state]}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-widest uppercase">Tilstand</span>
              <span className="text-2xl font-light">{brief.state}</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {brief.one_action.instruction}
            </p>
            <p className="text-xs text-gray-600">
              Konfidans: {Math.round(brief.state_confidence * 100)}% ·{" "}
              Kategori: {brief.one_action.category}
            </p>
          </div>
        )}

        {status === "error" && (
          <p className="text-center text-sm text-red-400">Noe gikk galt. Prøv igjen.</p>
        )}
      </div>
    </main>
  );
}
