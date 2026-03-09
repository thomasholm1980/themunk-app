"use client";
// apps/web/app/check-in/page.tsx

import { useEffect, useMemo, useState } from "react";
import ReflectionCard from "../components/ReflectionCard";
import WeeklyStatePath from "../components/WeeklyStatePath";
import LongitudinalPanel from "../components/LongitudinalPanel";
import { HeroMunk } from "../components/hero/HeroMunk";
import Forecast from "../components/Forecast";

const USER_ID = "thomas";

const STATE_DOT: Record<string, string> = {
  GREEN:  "bg-emerald-500",
  YELLOW: "bg-yellow-400",
  RED:    "bg-red-500",
};

const STATE_BORDER: Record<string, string> = {
  GREEN:  "border-emerald-700",
  YELLOW: "border-yellow-700",
  RED:    "border-red-800",
};

interface DecisionContract {
  state:           "GREEN" | "YELLOW" | "RED";
  protocol_id:     "deep_work" | "balanced_day" | "recovery";
  forecast: {
    headline:      string;
    line:          string;
  };
  guidance: {
    line:          string;
  };
  explanation: {
    primary_driver:   string;
    secondary_driver: string;
    line:             string;
  };
  windows: {
    deep_work:  string | null;
    training:   string | null;
    recovery:   string | null;
  };
  confidence:       number;
  contract_version: "decision_v1";
  language_layer?: {
    sentences: string[];
    language_version: "language_v1";
  };
}

interface StateResponse {
  state:     "GREEN" | "YELLOW" | "RED" | null;
  contract:  DecisionContract | null;
  day_key:   string;
}

export default function CheckInPage() {
  const [energy, setEnergy] = useState(3);
  const [mood,   setMood]   = useState(3);
  const [stress, setStress] = useState(3);
  const [notes,  setNotes]  = useState("");

  const [status,        setStatus]        = useState<"idle" | "loading" | "done" | "error">("idle");
  const [contract,      setContract]      = useState<DecisionContract | null>(null);
  const [contractReady, setContractReady] = useState(false);
  const [introPhase,    setIntroPhase]    = useState<"running" | "idle">("running");
  const [introComplete, setIntroComplete] = useState(false);
  const [apiError,      setApiError]      = useState(false);
  const [showWhy,       setShowWhy]       = useState(false);
  const [dateLabel,     setDateLabel]     = useState("");

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Signals card only mounts when monk intro is done
  const showForecast = !!contract && introPhase === "idle";
  const showSignalsCard = !!contract && introPhase === "idle" && introComplete;

  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString("no-NO", {
        weekday: "long", day: "numeric", month: "long",
      })
    );
  }, []);

  async function fetchState() {
    const startTime = Date.now();
    try {
      const res = await fetch("/api/state/today", {
        headers: { "x-user-id": USER_ID },
      });
      if (!res.ok) { setApiError(true); return; }
      const json: StateResponse = await res.json();
      if (json.contract) {
        setContract(json.contract);
        setApiError(false);
        const elapsed = Date.now() - startTime;
        const wait = Math.max(0, 6200 - elapsed);
        setTimeout(() => setContractReady(true), wait);
      }
    } catch {
      setApiError(true);
    }
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

  const dotClass    = contract ? (STATE_DOT[contract.state]    ?? "bg-zinc-500")    : "bg-zinc-500";
  const borderClass = contract ? (STATE_BORDER[contract.state] ?? "border-zinc-700"): "border-zinc-700";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#e9e6e0] via-[#dcd6cc] to-zinc-950 text-zinc-100 flex flex-col items-center">

      {/* 1. Header */}
      <div className="w-full max-w-md text-center pt-10 pb-2 px-4 space-y-1">
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 font-mono">The Munk</p>
        <p className="text-xs text-zinc-600 font-mono capitalize">{dateLabel}</p>
      </div>

      {/* 2. Hero */}
      <div className="w-full max-w-md">
        <HeroMunk
          state={contract?.state ?? null}
          isReading={status === "loading"}
          forecastReady={!!contract}
          dominantPattern={null}
          onIdleReached={() => { setIntroPhase("idle"); requestAnimationFrame(() => setIntroComplete(true)); }}
        />
      </div>

      <div className="w-full max-w-md px-4 space-y-6 pb-16">

        {/* 3a. API error */}
        {apiError && (
          <div className="text-sm text-zinc-500 text-center py-4">
            Could not load today&apos;s forecast. Try again shortly.
          </div>
        )}

        {/* 3b. Loading */}
        {!contract && !apiError && (
          <div className="text-sm text-zinc-500 text-center py-4 animate-pulse">
            Reading signals...
          </div>
        )}

        {/* 3c. Forecast — fades in after monk sequence */}
        {showForecast && (
          <div className="space-y-4" style={{
            opacity: 1,
            transform: 'translateY(0)',
            animation: 'fadeSlideIn 1200ms ease-out both',
          }}>
            <style>{`
              @keyframes fadeSlideIn {
                from { opacity: 0; transform: translateY(8px); }
                to   { opacity: 1; transform: translateY(0);   }
              }
            `}</style>

            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dotClass}`} />
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-600">Munk Forecast</p>
            </div>

            <Forecast
              headline={contract!.forecast.headline}
              interpretation={contract!.forecast.line}
              contextLine={contract!.language_layer?.sentences?.[0]}
            />

            <div className="pt-2 border-t border-zinc-400/30">
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-600 mb-2">Guidance</p>
              <p className="text-sm text-zinc-800">{contract!.guidance.line}</p>
            </div>

            <div className="pt-2 border-t border-zinc-400/30">
              <button
                onClick={() => setShowWhy(v => !v)}
                className="text-xs tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                {showWhy ? "Hide" : "Why this today?"}
              </button>
              {showWhy && (
                <div className="mt-3 space-y-2 text-sm text-zinc-700">
                  <div className="flex gap-2">
                    <span className="text-zinc-400">↑</span>
                    <span>{contract!.explanation.primary_driver}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-zinc-400">→</span>
                    <span>{contract!.explanation.secondary_driver}</span>
                  </div>
                  <p className="text-xs text-zinc-500 pt-1 leading-relaxed">
                    {contract!.explanation.line}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-400/30">
              <ReflectionCard dayKey={todayKey} />
            </div>

            <div className="pt-2 border-t border-zinc-400/30">
              <WeeklyStatePath />
            </div>

          </div>
        )}

        {/* 4. Signals card — only mounts after monk intro is done */}
        {showSignalsCard && (
          <div className={`border rounded-xl p-6 space-y-5 bg-zinc-900 ${borderClass}`}>
            <p className="text-xs tracking-[0.25em] uppercase text-zinc-500">Today&apos;s signals</p>
            {[
              { label: "Sleep",  value: energy, set: setEnergy },
              { label: "Mood",   value: mood,   set: setMood   },
              { label: "Stress", value: stress, set: setStress },
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
        )}

        {/* 5. Longitudinal */}
        {showSignalsCard && <LongitudinalPanel />}

      </div>
    </main>
  );
}
