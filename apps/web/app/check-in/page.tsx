"use client";

import { useEffect, useMemo, useState } from "react";
import ReflectionCard from "../components/ReflectionCard";
import WeeklyStatePath from "../components/WeeklyStatePath";
import { HeroMunk } from "../components/hero/HeroMunk";
import Forecast from "../components/Forecast";

const USER_ID = "thomas";

const STATE_DOT: Record<string, string> = {
  GREEN:  "bg-emerald-500",
  YELLOW: "bg-yellow-400",
  RED:    "bg-red-500",
};

interface DecisionContract {
  state:           "GREEN" | "YELLOW" | "RED";
  protocol_id:     "deep_work" | "balanced_day" | "recovery";
  forecast: { headline: string; line: string; };
  guidance: { line: string; };
  explanation: { primary_driver: string; secondary_driver: string; line: string; };
  windows: { deep_work: string | null; training: string | null; recovery: string | null; };
  confidence: number;
  contract_version: "decision_v1";
  language_layer?: { sentences: string[]; language_version: "language_v1"; };
}

interface StateResponse {
  state:    "GREEN" | "YELLOW" | "RED" | null;
  contract: DecisionContract | null;
  day_key:  string;
}

export default function CheckInPage() {
  const [contract,  setContract]  = useState<DecisionContract | null>(null);
  const [apiError,  setApiError]  = useState(false);
  const [showWhy,   setShowWhy]   = useState(false);
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
    try {
      const res = await fetch("/api/state/today", { headers: { "x-user-id": USER_ID } });
      if (!res.ok) { setApiError(true); return; }
      const json: StateResponse = await res.json();
      if (json.contract) {
        setContract(json.contract);
        setApiError(false);
      }
    } catch {
      setApiError(true);
    }
  }

  useEffect(() => { fetchState(); }, []);

  const dotClass = contract ? (STATE_DOT[contract.state] ?? "bg-zinc-500") : "bg-zinc-500";

  // Phase 14.6: render immediately when contract arrives — no intro gate
  const showForecast = !!contract;

  return (
    <main className="min-h-screen flex flex-col items-center" style={{ background: "#e9e6e0" }}>

      {/* Header */}
      <div className="w-full max-w-md text-center pt-10 pb-2 px-4 space-y-1">
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 font-mono">The Munk</p>
        <p className="text-xs text-zinc-500 font-mono capitalize">{dateLabel}</p>
      </div>

      {/* Hero — Zone A (atmospheric, sits on same warm bg) */}
      <div className="w-full max-w-md">
        <HeroMunk
          state={contract?.state ?? null}
          isReading={false}
          forecastReady={!!contract}
          dominantPattern={null}
          onIdleReached={() => {}}
        />
      </div>

      {/* Zone B — crisp content surface */}
      <div className="w-full max-w-md px-4 pb-16 space-y-0" style={{ background: "#e9e6e0" }}>

        {apiError && (
          <div className="text-sm text-zinc-500 text-center py-4">
            Could not load today&apos;s forecast. Try again shortly.
          </div>
        )}

        {!contract && !apiError && (
          <div className="text-sm text-zinc-400 text-center py-4 animate-pulse font-mono text-xs tracking-widest uppercase">
            Reading signals...
          </div>
        )}

        {showForecast && (
          <div className="space-y-0 divide-y divide-zinc-300/60">

            {/* Forecast */}
            <div className="py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                <p className="text-xs tracking-[0.25em] uppercase text-zinc-500 font-mono">Munk Forecast</p>
              </div>
              <Forecast
                headline={contract!.forecast.headline}
                interpretation={contract!.forecast.line}
                contextLine={contract!.language_layer?.sentences?.[0]}
              />
            </div>

            {/* Guidance */}
            <div className="py-5">
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-500 font-mono mb-2">Guidance</p>
              <p className="text-sm text-zinc-800 leading-relaxed">{contract!.guidance.line}</p>
            </div>

            {/* Why this today */}
            <div className="py-5">
              <button
                onClick={() => setShowWhy(v => !v)}
                className="text-xs tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-700 font-mono transition-colors"
              >
                {showWhy ? "Hide" : "Why this today?"}
              </button>
              {showWhy && (
                <div className="mt-3 space-y-2 text-sm text-zinc-700">
                  <div className="flex gap-2"><span className="text-zinc-400">↑</span><span>{contract!.explanation.primary_driver}</span></div>
                  <div className="flex gap-2"><span className="text-zinc-400">→</span><span>{contract!.explanation.secondary_driver}</span></div>
                  <p className="text-xs text-zinc-500 pt-1 leading-relaxed">{contract!.explanation.line}</p>
                </div>
              )}
            </div>

            {/* Reflection */}
            <div className="py-5">
              <ReflectionCard dayKey={todayKey} />
            </div>

            {/* Weekly State Path */}
            <div className="py-5">
              <WeeklyStatePath />
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
