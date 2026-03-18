"use client";
import { useEffect, useState } from "react";
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
  guidance: { line: string; pattern_context?: string | null };
  morningInsight: MorningInsight | null;
}

interface StateResponse {
  state: "GREEN" | "YELLOW" | "RED" | null;
  contract: DecisionContract | null;
  day_key: string;
}

const REFLECTION_MAP: Record<"low" | "mid" | "high", number> = {
  low: 1,
  mid: 5,
  high: 9,
};

function WaitingState() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .waiting-title {
          animation: fadeUp 700ms ease forwards;
          animation-delay: 600ms;
          opacity: 0;
        }
        .waiting-body {
          animation: fadeUp 700ms ease forwards;
          animation-delay: 800ms;
          opacity: 0;
        }
        .waiting-small {
          animation: fadeUp 700ms ease forwards;
          animation-delay: 1000ms;
          opacity: 0;
        }
      `}</style>
      <div className="max-w-md">
        <h1 className="waiting-title text-4xl md:text-5xl leading-tight text-white mb-4">
          Your system is still updating.
        </h1>
        <p className="waiting-body text-lg text-white/80 mb-3">
          We&apos;re waiting for your body to report in.
        </p>
        <p className="waiting-small text-sm text-white/55">
          This usually completes later in the morning.
        </p>
      </div>
    </main>
  );
}

export default function CheckInPage() {
  const [ratnaContract, setRatnaContract] = useState<RatnaContract | null>(null);
  const [dayKey, setDayKey] = useState<string>("");
  const [apiError, setApiError] = useState(false);
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString("no-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
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
          state: json.contract.state,
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
        body: JSON.stringify({ day_key: dayKey, energy: score, stress: score, focus: score }),
      });
    } catch (err) {
      console.error("[check-in] reflection submit error", err);
    }
  }

  if (apiError) return <WaitingState />;
  if (!ratnaContract) return <WaitingState />;

  return (
    <MunkDailyBriefRatnaV2
      contract={ratnaContract}
      dateLabel={dateLabel}
      onReflectionSubmit={handleReflectionSubmit}
    />
  );
}
