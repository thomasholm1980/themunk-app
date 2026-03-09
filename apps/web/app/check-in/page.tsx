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
  const [introIdle, setIntroIdle] = useState(false);
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
  const showForecast = !!contract && introIdle;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#e9e6e0] via-[#dcd6cc] to-zinc-950 text-zinc-100 flex flex-col items-center">

      {/* Header */}
      <div className="w-full max-w-md text-center pt-10 pb-2 px-4 space-y-1">
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 font-mono">The Munk</p>
        <p className="text-xs text-zinc-600 font-mono capitalize">{dateLabel}</p>
      </div>

      {/* Hero */}
      <div className="w-full max-w-md">
        <HeroMunk
          state={contract?.state ?? null}
          isReading={false}
          forecastReady={!!contract}
          dominantPattern={null}
          onIdleReached={() => setIntroIdle(true)}
        />
      </div>

      <div className="w-full max-w-md px-4 space-y-6 pb-16">

        {/* Error */}
        {apiError && (
          <div className="text-sm text-zinc-500 text-center py-4">
            Could not load today&apos;s forecast. Try again shortly.
          </div>
        )}

        {/* Loading */}
        {!contract && !apiError && (
          <div className="text-sm text-zinc-500 text-center py-4 animate-pulse">
            Reading signals...
          </div>
        )}

        {/* Forecast — after monk intro */}
        {showForecast && (
          <div className="space-y-4" style={{ animation: 'fadeIn 1200ms ease-out both' }}>
            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>

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
                  <div className="flex gap-2"><span className="text-zinc-400">↑</span><span>{contract!.explanation.primary_driver}</span></div>
                  <div className="flex gap-2"><span className="text-zinc-400">→</span><span>{contract!.explanation.secondary_driver}</span></div>
                  <p className="text-xs text-zinc-500 pt-1 leading-relaxed">{contract!.explanation.line}</p>
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

      </div>
    </main>
  );
}
