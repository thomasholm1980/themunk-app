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

  // Error state — dark background matches hero
  if (apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0C10" }}>
        <p className="text-sm" style={{ color: "#6b655e" }}>Could not load today&apos;s brief. Try again shortly.</p>
      </div>
    );
  }

  // Loading state — dark background, no white flash
  if (!ratnaContract) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0C10" }}>
        <p className="text-xs tracking-widest uppercase font-mono animate-pulse" style={{ color: "#6b655e" }}>Reading signals...</p>
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
