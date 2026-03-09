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
  guidance: { line: string; pattern_context?: string | null; };
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
  signal_explanation?: { line_1: string; line_2: string | null; };
}

export default function CheckInPage() {
  const [contract,    setContract]    = useState<DecisionContract | null>(null);
  const [explanation, setExplanation] = useState<{ line_1: string; line_2: string | null } | null>(null);
  const [apiError,    setApiError]    = useState(false);
  const [dateLabel,   setDateLabel]   = useState("");

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
        setExplanation(json.signal_explanation ?? null);
        setApiError(false);
      }
    } catch {
      setApiError(true);
    }
  }

  useEffect(() => { fetchState(); }, []);

  const dotClass    = contract ? (STATE_DOT[contract.state] ?? "bg-zinc-500") : "bg-zinc-500";
  const showContent = !!contract;

  return (
    <main className="min-h-screen flex flex-col items-center" style={{ background: "#e9e6e0" }}>

      {/* Header */}
      <div className="w-full max-w-md text-center pt-10 pb-2 px-4 space-y-1">
        <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 font-mono">The Munk</p>
        <p className="text-xs text-zinc-500 font-mono capitalize">{dateLabel}</p>
      </div>

      {/* Monk */}
      <div className="w-full max-w-md">
        <HeroMunk
          state={contract?.state ?? null}
          isReading={false}
          forecastReady={!!contract}
          dominantPattern={null}
          onIdleReached={() => {}}
        />
      </div>

      <div className="w-full max-w-md px-4 pb-16 space-y-0">

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

        {showContent && (
          <div className="space-y-0 divide-y divide-zinc-300/60">

            {/* 1. Forecast */}
            <div className="py-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                <p className="text-xs tracking-[0.25em] uppercase text-zinc-500 font-mono">Munk Forecast</p>
              </div>
              <Forecast
                headline={contract!.forecast.headline}
                interpretation={contract!.forecast.line}
                contextLine={contract!.language_layer?.sentences?.[0]}
                patternContext={contract!.guidance.pattern_context}
              />
            </div>

            {/* 2. Explanation — Why This Today */}
            {explanation && (
              <div className="py-5">
                <p className="text-xs tracking-[0.25em] uppercase text-zinc-500 font-mono mb-2">Why This Today?</p>
                <p className="text-sm text-zinc-700 leading-relaxed">{explanation.line_1}</p>
                {explanation.line_2 && (
                  <p className="text-sm text-zinc-600 leading-relaxed mt-1">{explanation.line_2}</p>
                )}
              </div>
            )}

            {/* 3. Guidance */}
            <div className="py-5">
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-500 font-mono mb-2">Guidance</p>
              <p className="text-sm text-zinc-800 leading-relaxed">{contract!.guidance.line}</p>
            </div>

            {/* 4. Reflection */}
            <div className="py-5">
              <ReflectionCard dayKey={todayKey} />
            </div>

            {/* 5. Weekly State Path / Signals */}
            <div className="py-5">
              <WeeklyStatePath />
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
