component = '''"use client";

import { useEffect, useMemo, useState } from "react";

type SystemState = "GREEN" | "YELLOW" | "RED";
type ReflectionValue = "low" | "mid" | "high" | null;

export type RatnaContract = {
  state: SystemState;
  insight: string | null;
  guidance: string;
};

type Props = {
  contract: RatnaContract;
  dateLabel?: string;
  onReflectionSubmit?: (value: ReflectionValue) => void;
};

const DEFAULT_EMPTY_INSIGHT = "Your system is stable today.";

const TIMINGS = {
  breathStartMs: 1200,
  insightMs:     2400,
  guidanceMs:    3300,
  reflectionMs:  4200,
};

const STATE_TONE: Record<SystemState, { duration: string }> = {
  GREEN:  { duration: "6s" },
  YELLOW: { duration: "6.6s" },
  RED:    { duration: "7.2s" },
};

export default function MunkDailyBriefRatnaV2({ contract, dateLabel = "Today", onReflectionSubmit }: Props) {
  const { state, insight, guidance } = contract;

  const [phase, setPhase] = useState<"stillness" | "breathing" | "insight" | "guidance" | "reflection">("stillness");
  const [reflection, setReflection] = useState<ReflectionValue>(null);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase("breathing"),  TIMINGS.breathStartMs),
      window.setTimeout(() => setPhase("insight"),    TIMINGS.insightMs),
      window.setTimeout(() => setPhase("guidance"),   TIMINGS.guidanceMs),
      window.setTimeout(() => setPhase("reflection"), TIMINGS.reflectionMs),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (reflection && onReflectionSubmit) {
      onReflectionSubmit(reflection);
    }
  }, [reflection, onReflectionSubmit]);

  const tone = STATE_TONE[state];
  const resolvedInsight = insight ?? DEFAULT_EMPTY_INSIGHT;

  const showInsight    = phase === "insight" || phase === "guidance" || phase === "reflection";
  const showGuidance   = phase === "guidance" || phase === "reflection";
  const showReflection = phase === "reflection";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ebe7df] text-[#2e2b28]">
      <style>{`
        @keyframes monkBreath {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.012); }
          100% { transform: scale(1); }
        }
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="w-full max-w-xl flex flex-col items-center text-center px-6">

        <div className="text-xs tracking-[0.45em] uppercase text-[#5f5a54] mb-1">The Munk</div>
        <div className="text-sm text-[#6b655e] mb-10">{dateLabel}</div>

        <div style={{
          animation: phase === "stillness"
            ? "none"
            : `monkBreath ${tone.duration} ease-in-out infinite`,
        }}>
          <img
            src="/assets/munk-transparent.png"
            alt="Munk"
            className="w-[260px] select-none"
            draggable={false}
          />
        </div>

        {showInsight && (
          <div
            className="mt-10 text-[34px] leading-[1.25] font-medium"
            style={{ animation: "fadeUp 900ms ease" }}
          >
            {resolvedInsight}
          </div>
        )}

        {showGuidance && (
          <div
            className="mt-6 text-[18px] text-[#5a544f] max-w-md"
            style={{ animation: "fadeUp 900ms ease" }}
          >
            {guidance}
          </div>
        )}

        {showReflection && (
          <div className="mt-12 w-full" style={{ animation: "fadeUp 900ms ease" }}>
            <div className="text-xs tracking-[0.35em] uppercase text-[#6b655e] mb-4">Reflection</div>
            <div className="text-lg mb-6">How does your body feel today?</div>
            <div className="flex gap-3 justify-center">
              {(["low", "mid", "high"] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setReflection(val)}
                  className={`px-6 py-3 rounded-xl border capitalize transition-all ${
                    reflection === val
                      ? "bg-[#f6f1e8] border-[#b9ae9c]"
                      : "bg-white/40 border-[#d8d0c5]"
                  }`}
                >
                  {val.charAt(0).toUpperCase() + val.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
'''

page = '''"use client";

import { useEffect, useMemo, useState } from "react";
import MunkDailyBriefRatnaV2 from "../components/MunkDailyBriefRatnaV2";
import type { RatnaContract } from "../components/MunkDailyBriefRatnaV2";

const USER_ID = "thomas";

interface MorningInsight {
  id: string;
  type: string;
  confidence: "low" | "medium" | "high";
  message: string;
}

interface DecisionContract {
  state: "GREEN" | "YELLOW" | "RED";
  guidance: { line: string; pattern_context?: string | null; };
  morningInsight: MorningInsight | null;
}

interface StateResponse {
  state: "GREEN" | "YELLOW" | "RED" | null;
  contract: DecisionContract | null;
  day_key: string;
}

// Map Ratna reflection value to numeric scale for reflection endpoint
const REFLECTION_MAP: Record<"low" | "mid" | "high", number> = {
  low: 1,
  mid: 5,
  high: 9,
};

export default function CheckInPage() {
  const [ratnaContract, setRatnaContract] = useState<RatnaContract | null>(null);
  const [dayKey,        setDayKey]        = useState<string>("");
  const [apiError,      setApiError]      = useState(false);
  const [dateLabel,     setDateLabel]     = useState("");

  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString("no-NO", {
        weekday: "long", day: "numeric", month: "long",
      })
    );
  }, []);

  useEffect(() => {
    async function fetchState() {
      try {
        const res = await fetch("/api/state/today", { headers: { "x-user-id": USER_ID } });
        if (!res.ok) { setApiError(true); return; }
        const json: StateResponse = await res.json();
        if (!json.contract || !json.state) { setApiError(true); return; }

        setDayKey(json.day_key);
        setRatnaContract({
          state:   json.contract.state,
          insight: json.contract.morningInsight?.message ?? null,
          guidance: json.contract.guidance.line,
        });
        setApiError(false);
      } catch {
        setApiError(true);
      }
    }
    fetchState();
  }, []);

  async function handleReflectionSubmit(value: "low" | "mid" | "high") {
    const score = REFLECTION_MAP[value];
    try {
      await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_key: dayKey,
          energy:  score,
          stress:  score,
          focus:   score,
        }),
      });
    } catch (err) {
      console.error("[check-in] reflection submit error", err);
    }
  }

  if (apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ebe7df]">
        <p className="text-sm text-[#6b655e]">Could not load today\'s brief. Try again shortly.</p>
      </div>
    );
  }

  if (!ratnaContract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ebe7df]">
        <p className="text-xs tracking-widest uppercase font-mono text-[#6b655e] animate-pulse">Reading signals...</p>
      </div>
    );
  }

  return (
    <MunkDailyBriefRatnaV2
      contract={ratnaContract}
      dateLabel={dateLabel}
      onReflectionSubmit={handleReflectionSubmit}
    />
  );
}
'''

import os

component_path = '/Users/thomas/Desktop/The_Munk_Health/themunk_app/apps/web/app/components/MunkDailyBriefRatnaV2.tsx'
page_path      = '/Users/thomas/Desktop/The_Munk_Health/themunk_app/apps/web/app/check-in/page.tsx'

with open(component_path, 'w') as f:
    f.write(component)
print(f"Written: {component_path}")

with open(page_path, 'w') as f:
    f.write(page)
print(f"Written: {page_path}")
