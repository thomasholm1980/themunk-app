"use client";
import { useEffect, useRef, useState } from "react";
import MunkDailyBriefRatnaV2 from "../components/MunkDailyBriefRatnaV2";
import type { RatnaContract } from "../components/MunkDailyBriefRatnaV2";
import { HeroMunk } from "../components/hero/HeroMunk";

const USER_ID = "thomas";
const POLL_INTERVAL_MS = 2 * 60 * 1000;
const POLL_MAX_MS = 60 * 60 * 1000;
const WAKE_POLL_INTERVAL_MS = 3000;
const WAKE_POLL_MAX_MS = 20000;

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

const APP_BG = "radial-gradient(ellipse at 50% 20%, #2F5D54 0%, #1C3A34 40%, #0F1F1C 100%)";

type WakeStatus = "idle" | "fetching" | "timeout";

function WaitingState({ onWake }: { onWake: () => Promise<void> }) {
  const [visible, setVisible] = useState(false);
  const [wakeStatus, setWakeStatus] = useState<WakeStatus>("idle");

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  async function handleWake() {
    if (wakeStatus === "fetching") return;
    setWakeStatus("fetching");
    await onWake();
  }

  const isFetching = wakeStatus === "fetching";

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: APP_BG }}
    >
      <style>{`
        .mf { opacity:0; transform:translateY(8px); transition:opacity 800ms cubic-bezier(.22,1,.36,1),transform 800ms cubic-bezier(.22,1,.36,1); will-change:opacity,transform; }
        .mf.v { opacity:1; transform:translateY(0); }
        .mf-monk { transition-delay:0ms; }
        .mf-title { transition-delay:120ms; }
        .mf-body  { transition-delay:180ms; }
        .mf-cta   { transition-delay:260ms; }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0;   }
        }
      `}</style>

      <div className={`mf mf-monk w-full${visible ? " v" : ""}`} style={{ maxWidth: 400 }}>
        <HeroMunk state={null} />
      </div>

      <h1 className={`mf mf-title text-3xl md:text-4xl leading-tight text-white mb-3${visible ? " v" : ""}`}>
        {isFetching ? "Henter data fra kroppen din..." : "Dagens stress er ikke klart ennå"}
      </h1>

      <p className={`mf mf-body text-base text-white/70 mb-8${visible ? " v" : ""}`}>
        {isFetching ? "Dette tar 10–15 sekunder" : "Trykk for å hente dagens status"}
      </p>

      <div className={`mf mf-cta relative${visible ? " v" : ""}`}>
        {isFetching && (
          <span className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(255,200,80,0.3)" }} />
        )}
        <button
          onClick={handleWake}
          disabled={isFetching}
          className="relative px-8 py-4 rounded-full text-base font-medium text-white transition-all"
          style={{
            background: isFetching
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,200,80,0.18)",
            border: "1px solid rgba(255,200,80,0.35)",
            cursor: isFetching ? "default" : "pointer",
            letterSpacing: "0.04em",
          }}
        >
          {isFetching ? "Venter..." : "Vekk munken"}
        </button>
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
        Dagens stress er klar
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

  async function handleWake() {
    // 1. Trigger sync
    try {
      await fetch("/api/wearables/oura/sync", { method: "POST" });
    } catch {
      // continue to poll regardless
    }

    // 2. Poll for daily_state every 3s for up to 20s
    const start = Date.now();
    await new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        const found = await fetchState(true);
        if (found || Date.now() - start >= WAKE_POLL_MAX_MS) {
          clearInterval(interval);
          resolve();
        }
      }, WAKE_POLL_INTERVAL_MS);
    });
  }

  if (waiting || !ratnaContract) return <WaitingState onWake={handleWake} />;

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
}
