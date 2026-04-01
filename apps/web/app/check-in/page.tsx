"use client";
import { useEffect, useState } from "react";
import MunkDailyBriefRatnaV2 from "../components/MunkDailyBriefRatnaV2";
import type { RatnaContract } from "../components/MunkDailyBriefRatnaV2";
import { logMorningEvent } from "../../lib/telemetry";

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

type Mode = "idle" | "loading" | "no_data" | "ready";

function getTimeBucket(): "morning" | "day" | "evening" {
  const hour = parseInt(
    new Intl.DateTimeFormat("no-NO", {
      timeZone: "Europe/Oslo",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
    10
  );
  if (hour >= 4 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "day";
  return "evening";
}

function getBgGradient(bucket: "morning" | "day" | "evening"): string {
  if (bucket === "morning") return "radial-gradient(circle at 50% 35%, #3E5E56 0%, #162C27 60%, #0D1A17 100%)";
  if (bucket === "evening") return "radial-gradient(circle at 50% 25%, #1B3833 0%, #081210 70%, #040807 100%)";
  return "radial-gradient(ellipse at 50% 20%, #2F5D54 0%, #1C3A34 40%, #0F1F1C 100%)";
}

const LOADING_MESSAGES = [
  "Munken lytter til hjertet ditt...",
  "Samler dagens signaler...",
  "Finn roen et øyeblikk...",
];

function WaitingState({ onWake, mode }: { onWake: () => void; mode: Mode }) {
  const [visible, setVisible] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const timeBucket = getTimeBucket();
  const bg = getBgGradient(timeBucket);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Message cycle — only during loading
  useEffect(() => {
    if (mode !== "loading") return;
    const interval = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length);
        setMsgVisible(true);
      }, 600);
    }, 4000);
    return () => clearInterval(interval);
  }, [mode]);

  const isFetching = mode === "loading";
  const isNoData   = mode === "no_data";
  const isIdle     = mode === "idle";

  return (
    <main
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-8 text-center"
      style={{ background: bg }}
    >
      <style>{`
        @keyframes heartGlow {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.9); filter: blur(20px); }
          50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.1); filter: blur(40px); }
        }
        @keyframes munkFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        .msg-enter { opacity: 1; transform: translateY(0); transition: opacity 600ms ease, transform 600ms ease; }
        .msg-exit  { opacity: 0; transform: translateY(4px); transition: opacity 600ms ease, transform 600ms ease; }
        .mf { opacity: 0; transform: translateY(8px); transition: opacity 800ms cubic-bezier(.22,1,.36,1), transform 800ms cubic-bezier(.22,1,.36,1); }
        .mf.v { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Munk + glow */}
      <div className={`mf relative mb-10${visible ? " v" : ""}`}>
        {/* Heart glow */}
        <div style={{
          position: "absolute",
          top: "52%",
          left: "50%",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)",
          animation: isFetching ? "heartGlow 6s ease-in-out infinite" : "none",
          zIndex: 0,
          pointerEvents: "none",
        }} />
        <img
          src="/assets/munk-transparent.png"
          alt="Munk"
          style={{
            width: "220px",
            position: "relative",
            zIndex: 1,
            animation: "munkFloat 6s ease-in-out infinite",
          }}
          className="select-none"
          draggable={false}
        />
      </div>

      {/* Content area */}
      <div className={`mf flex flex-col items-center gap-4${visible ? " v" : ""}`} style={{ minHeight: "80px" }}>

        {/* Loading state */}
        {isFetching && (
          <>
            <p
              className={msgVisible ? "msg-enter" : "msg-exit"}
              style={{
                fontSize: "20px",
                color: "rgba(255,255,255,0.90)",
                lineHeight: 1.4,
                maxWidth: "280px",
              }}
            >
              {LOADING_MESSAGES[msgIndex]}
            </p>
            <p style={{
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(212,175,55,0.55)",
            }}>
              Synkroniserer med Oura
            </p>
          </>
        )}

        {/* Idle state */}
        {isIdle && (
          <>
            <p style={{ fontSize: "28px", color: "rgba(255,255,255,0.95)", lineHeight: 1.2 }}>
              {timeBucket === "morning" ? "God morgen" : timeBucket === "day" ? "Munken er våken" : "Munken roer ned"}
            </p>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.50)", marginBottom: "8px" }}>
              Trykk for å se dagens stressnivå.
            </p>
            <button
              onClick={onWake}
              style={{
                marginTop: "8px",
                padding: "16px 40px",
                borderRadius: "100px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
                fontSize: "15px",
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              {timeBucket === "morning" ? "Vekk munken" : "Møt munken"}
            </button>
          </>
        )}

        {/* No data state */}
        {isNoData && (
          <>
            <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.85)", lineHeight: 1.4, maxWidth: "280px" }}>
              Oura er ikke klar ennå
            </p>
            <p style={{ fontSize: "15px", color: "rgba(212,175,55,0.70)", maxWidth: "260px", lineHeight: 1.6 }}>
              Åpne Oura-appen, la den synkronisere, og prøv igjen.
            </p>
            <button
              onClick={onWake}
              style={{
                marginTop: "16px",
                padding: "16px 40px",
                borderRadius: "100px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.70)",
                fontSize: "15px",
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              Prøv igjen
            </button>
          </>
        )}

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

  useEffect(() => {
    setDateLabel(new Date().toLocaleDateString("no-NO", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  function handleWake() {
    if (mode === "loading") return;
    setMode("loading");

    async function run() {
      try {
        const res = await fetch("/api/state/today", { headers: { "x-user-id": USER_ID } });
        if (res.ok) {
          const json: StateResponse = await res.json();
          if (json.contract && json.state) {
            logMorningEvent('wake_monk_state_found', { state: json.state, day_key: json.day_key });

            let context_line: string | null = null;
            let context_pattern: string | null = null;
            try {
              const patternRes = await fetch("/api/patterns/today");
              if (patternRes.ok) {
                const patternJson = await patternRes.json();
                if (patternJson.sufficient_data && patternJson.patterns?.length > 0) {
                  context_pattern = patternJson.patterns[0]?.code ?? null;
                  const { resolvePatternExpression } = await import("@themunk/core/state/pattern-expression-v1");
                  const expr = resolvePatternExpression(patternJson.patterns, patternJson.sufficient_data);
                  if (expr.show_context_line) context_line = expr.context_line;
                }
              }
            } catch {}

            setRatnaContract({
              state: json.contract.state,
              insight: json.contract.forecast?.headline ?? json.contract.morningInsight?.message ?? null,
              guidance: json.contract.guidance.line,
              context_line,
              context_pattern,
            });
            setMode("ready");
            return;
          }
        }
      } catch {}

      logMorningEvent('wake_monk_sync_started');
      try {
        const syncRes = await fetch("/api/wearables/oura/sync", { method: "POST" });
        if (syncRes.ok) {
          const syncJson = await syncRes.json();
          if (syncJson.status === "no_data" || syncJson.status === "sleep_incomplete") {
            setMode("no_data");
            return;
          }
        }
      } catch {}

      const start = Date.now();
      const interval = setInterval(async () => {
        try {
          const res = await fetch("/api/state/today", { headers: { "x-user-id": USER_ID } });
          if (res.ok) {
            const json: StateResponse = await res.json();
            if (json.contract && json.state) {
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
        } catch {}

        if (Date.now() - start >= WAKE_POLL_MAX_MS) {
          clearInterval(interval);
          setMode("no_data");
        }
      }, WAKE_POLL_INTERVAL_MS);
    }

    run();
  }

  if (mode === "ready" && ratnaContract) {
    return (
      <>
        {showBanner && <ReadyBanner onDismiss={() => setShowBanner(false)} />}
        <MunkDailyBriefRatnaV2
          contract={ratnaContract}
          dateLabel={dateLabel}
          onRendered={() => logMorningEvent('brief_rendered')}
        />
      </>
    );
  }

  return <WaitingState onWake={handleWake} mode={mode} />;
}
