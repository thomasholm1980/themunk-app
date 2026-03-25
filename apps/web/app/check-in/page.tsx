"use client";
import { useEffect, useState } from "react";
import MunkDailyBriefRatnaV2 from "../components/MunkDailyBriefRatnaV2";
import type { RatnaContract } from "../components/MunkDailyBriefRatnaV2";
import { HeroMunk } from "../components/hero/HeroMunk";

const USER_ID = "thomas";
const WAKE_POLL_INTERVAL_MS = 3000;
const WAKE_POLL_MAX_MS = 20000;

interface DecisionContract {
  forecast?: { headline: string; line: string } | null;
  state: "GREEN" | "YELLOW" | "RED";
  guidance: { line: string; pattern_context?: string | null };
  morningInsight: { id: string; type: string; confidence: "low" | "medium" | "high"; message: string } | null;
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

type Mode = "idle" | "loading" | "no_data" | "ready";

function WaitingState({ onWake, mode }: { onWake: () => void; mode: Mode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const isFetching = mode === "loading";
  const isNoData   = mode === "no_data";

  const title = isNoData
    ? "Oura er ikke klar ennå"
    : "God morgen";

  const body = isNoData
    ? "Åpne Oura-appen, la den synkronisere, og prøv igjen."
    : "Trykk for å se dagens stressnivå.";

  const ctaLabel = isFetching
    ? "Henter..."
    : isNoData
    ? "Prøv igjen"
    : "Vekk munken";

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: APP_BG }}
    >
      <style>{`
        .mf { opacity:0; transform:translateY(8px); transition:opacity 800ms cubic-bezier(.22,1,.36,1),transform 800ms cubic-bezier(.22,1,.36,1); will-change:opacity,transform; }
        .mf.v { opacity:1; transform:translateY(0); }
        .mf-monk  { transition-delay:0ms; }
        .mf-title { transition-delay:120ms; }
        .mf-body  { transition-delay:180ms; }
        .mf-cta   { transition-delay:260ms; }
      `}</style>

      <div className={`mf mf-monk w-full${visible ? " v" : ""}`} style={{ maxWidth: 400 }}>
        <HeroMunk state={null} />
      </div>

      <h1 className={`mf mf-title text-3xl leading-tight text-white mb-3${visible ? " v" : ""}`}>
        {title}
      </h1>

      <p
        className={`mf mf-body text-base mb-8${visible ? " v" : ""}`}
        style={{ color: isNoData ? "rgba(255,200,80,0.85)" : "rgba(255,255,255,0.6)" }}
      >
        {body}
      </p>

      <div className={`mf mf-cta relative${visible ? " v" : ""}`}>
        {isFetching && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(255,200,80,0.3)" }}
          />
        )}
        <button
          onClick={onWake}
          disabled={isFetching}
          className="relative px-8 py-4 rounded-full text-base font-medium text-white transition-all"
          style={{
            background: isFetching ? "rgba(255,255,255,0.08)" : "rgba(255,200,80,0.18)",
            border: "1px solid rgba(255,200,80,0.35)",
            cursor: isFetching ? "default" : "pointer",
            letterSpacing: "0.04em",
          }}
        >
          {ctaLabel}
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
  const [mode, setMode] = useState<Mode>("idle");
  const [ratnaContract, setRatnaContract] = useState<RatnaContract | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dateLabel, setDateLabel] = useState("");
  const [dayKey, setDayKey] = useState<string>("");

  useEffect(() => {
    setDateLabel(new Date().toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  function handleWake() {
    if (mode === "loading") return;
    setMode("loading");

    async function run() {
      // Check if state already exists
      try {
        const res = await fetch("/api/state/today", { headers: { "x-user-id": USER_ID } });
        if (res.ok) {
          const json: StateResponse = await res.json();
          if (json.contract && json.state) {
            setDayKey(json.day_key);
            setRatnaContract({
              state: json.contract.state,
              insight: json.contract.forecast?.headline ?? json.contract.morningInsight?.message ?? null,
              guidance: json.contract.guidance.line,
            });
            setMode("ready");
            return;
          }
        }
      } catch { /* continue to sync */ }

      // State missing — trigger sync
      try {
        const syncRes = await fetch("/api/wearables/oura/sync", { method: "POST" });
        if (syncRes.ok) {
          const syncJson = await syncRes.json();
          if (syncJson.status === "no_data") {
            setMode("no_data");
            return;
          }
        }
      } catch { /* continue to poll */ }

      // Poll for state
      const start = Date.now();
      const interval = setInterval(async () => {
        try {
          const res = await fetch("/api/state/today", { headers: { "x-user-id": USER_ID } });
          if (res.ok) {
            const json: StateResponse = await res.json();
            if (json.contract && json.state) {
              setDayKey(json.day_key);
              setRatnaContract({
                state: json.contract.state,
                insight: json.contract.forecast?.headline ?? json.contract.morningInsight?.message ?? null,
                guidance: json.contract.guidance.line,
              });
              setShowBanner(true);
              setMode("ready");
              clearInterval(interval);
              return;
            }
          }
        } catch { /* continue */ }

        // FIX: timeout → no_data, not idle
        if (Date.now() - start >= WAKE_POLL_MAX_MS) {
          clearInterval(interval);
          setMode("no_data");
        }
      }, WAKE_POLL_INTERVAL_MS);
    }

    run();
  }

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

  if (mode === "ready" && ratnaContract) {
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

  return <WaitingState onWake={handleWake} mode={mode} />;
}
