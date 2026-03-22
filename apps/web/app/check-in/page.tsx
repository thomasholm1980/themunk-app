"use client";
import { useEffect, useRef, useState } from "react";
import MunkDailyBriefRatnaV2 from "../components/MunkDailyBriefRatnaV2";
import type { RatnaContract } from "../components/MunkDailyBriefRatnaV2";

const USER_ID = "thomas";
const POLL_INTERVAL_MS = 2 * 60 * 1000;
const POLL_MAX_MS = 60 * 60 * 1000;

interface MorningInsight {
  id: string;
  type: string;
  confidence: "low" | "medium" | "high";
  message: string;
}

interface DecisionContract {
  forecast?: { headline: string; line: string } | null;
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
  low: 1, mid: 5, high: 9,
};

function getOsloDateKey(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

function WaitingState() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <style>{`
        .mf { opacity:0; transform:translateY(8px); transition:opacity 800ms cubic-bezier(.22,1,.36,1),transform 800ms cubic-bezier(.22,1,.36,1); will-change:opacity,transform; }
        .mf.v { opacity:1; transform:translateY(0); }
        .mf-title { transition-delay:120ms; }
        .mf-body  { transition-delay:180ms; }
        .mf-small { transition-delay:240ms; }
      `}</style>
      <div className="max-w-md">
        <h1 className={`mf mf-title text-4xl md:text-5xl leading-tight text-white mb-4${visible ? " v" : ""}`}>
          Vi gjør klar dagens stressnivå
        </h1>
        <p className={`mf mf-body text-lg text-white/80 mb-3${visible ? " v" : ""}`}>
          Data fra natten behandles nå — du får beskjed når det er klart.
        </p>
      </div>
    </main>
  );
}

function ReadyBanner({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="fixed top-4 left-0 right-0 flex justify-center z-50 px-4">
      <div className="bg-white/10 backdrop-blur text-white text-sm px-5 py-3 rounded-full">
        Dagens stress er klar.
      </div>
    </div>
  );
}

export default function CheckInPage() {
  const [ratnaContract, setRatnaContract] = useState<RatnaContract | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [dateLabel, setDateLabel] = useState("");
  const [dayKey, setDayKey] = useState<string>("");
  const pollStartRef = useRef<number | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDateLabel(new Date().toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  async function fetchState(isPolling = false): Promise<boolean> {
    try {
      const res = await fetch("/api/state/today", { headers: { "x-user-id": USER_ID } });
      if (!res.ok) { if (!isPolling) setWaiting(true); return false; }
      const json: StateResponse = await res.json();
      if (!json.contract || !json.state) {
        if (!isPolling) setWaiting(true);
        return false;
      }
      setDayKey(json.day_key);
      setRatnaContract({
        state: json.contract.state,
        insight: json.contract.forecast?.headline ?? json.contract.morningInsight?.message ?? null,
        guidance: json.contract.guidance.line,
      });
      if (isPolling) setShowBanner(true);
      setWaiting(false);
      return true;
    } catch {
      if (!isPolling) setWaiting(true);
      return false;
    }
  }

  function startPolling() {
    if (pollTimerRef.current) return;
    pollStartRef.current = Date.now();
    pollTimerRef.current = setInterval(async () => {
      const elapsed = Date.now() - (pollStartRef.current ?? 0);
      if (elapsed >= POLL_MAX_MS) { stopPolling(); return; }
      const found = await fetchState(true);
      if (found) stopPolling();
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
  }

  useEffect(() => {
    fetchState(false).then((found) => { if (!found) startPolling(); });
    return () => stopPolling();
  }, []);

  async function handleReflectionSubmit(value: "low" | "mid" | "high") {
    const score = REFLECTION_MAP[value];
    try {
      await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day_key: dayKey, energy: score, stress: score, focus: score }),
      });
    } catch (err) { console.error("[check-in] reflection submit error", err); }
  }

  if (waiting || !ratnaContract) return <WaitingState />;

  return (
    <>
      {showBanner && <ReadyBanner onDismiss={() => setShowBanner(false)} />}
      <MunkDailyBriefRatnaV2
        contract={ratnaContract}
        dateLabel={dateLabel}
        onReflectionSubmit={handleReflectionSubmit}
      />
    </>
  );
}
