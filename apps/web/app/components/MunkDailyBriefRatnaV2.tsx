"use client";
import { useEffect, useState } from "react";

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
  breathStartMs: 1400,
  insightMs: 3200,
  guidanceMs: 4800,
  reflectionMs: 6400,
};

type StateExpression = {
  breathDuration: string;
  breathAmplitude: string;
  postureOffset: string;
  torsoRotation: string;
  background: string;
};

const STATE_EXPRESSION: Record<SystemState, StateExpression> = {
  GREEN:  { breathDuration: "6s",   breathAmplitude: "1.012", postureOffset: "0px", torsoRotation: "0deg",   background: "#EEE9E0" },
  YELLOW: { breathDuration: "7.2s", breathAmplitude: "1.008", postureOffset: "2px", torsoRotation: "0.2deg", background: "#EDE4D3" },
  RED:    { breathDuration: "8.4s", breathAmplitude: "1.005", postureOffset: "3px", torsoRotation: "0.6deg", background: "#EAE5DB" },
};

function useMorningArrival(): { showArrival: boolean; showLine1: boolean; showLine2: boolean } {
  const [showArrival, setShowArrival] = useState(false);
  const [showLine1, setShowLine1] = useState(false);
  const [showLine2, setShowLine2] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastArrival = localStorage.getItem("munk_last_arrival");
    if (lastArrival !== today) {
      localStorage.setItem("munk_last_arrival", today);
      setShowArrival(true);
      const t1 = window.setTimeout(() => setShowLine1(true), 800);
      const t2 = window.setTimeout(() => setShowLine2(true), 1400);
      const t3 = window.setTimeout(() => setShowArrival(false), 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, []);

  return { showArrival, showLine1, showLine2 };
}

export default function MunkDailyBriefRatnaV2({ contract, dateLabel = "Today", onReflectionSubmit }: Props) {
  const { state, insight, guidance } = contract;
  const expr = STATE_EXPRESSION[state];
  const [phase, setPhase] = useState<"stillness" | "breathing" | "insight" | "guidance" | "reflection">("stillness");
  const [reflection, setReflection] = useState<ReflectionValue>(null);
  const { showArrival, showLine1, showLine2 } = useMorningArrival();

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
    if (reflection && onReflectionSubmit) onReflectionSubmit(reflection);
  }, [reflection, onReflectionSubmit]);

  const resolvedInsight = insight ?? DEFAULT_EMPTY_INSIGHT;
  const showInsight    = phase === "insight"  || phase === "guidance" || phase === "reflection";
  const showGuidance   = phase === "guidance" || phase === "reflection";
  const showReflection = phase === "reflection";

  if (showArrival) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center overflow-hidden" style={{ background: "#0A0C10" }}>
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes glowPulse {
            0%   { opacity: 0.18; transform: translate(-50%, -50%) scale(1); }
            50%  { opacity: 0.38; transform: translate(-50%, -50%) scale(1.08); }
            100% { opacity: 0.18; transform: translate(-50%, -50%) scale(1); }
          }
        `}</style>

        <div className="relative z-10 w-full flex flex-col items-center pt-[13vh] px-6 text-center min-h-[26vh]">
          {showLine1 && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 650, fontSize: "clamp(20px, 5vw, 30px)", lineHeight: 1.2, color: "#FFFFFF", letterSpacing: "-0.01em", animation: "fadeUp 700ms ease forwards" }}>
              Are you tracking everything...
            </p>
          )}
          {showLine2 && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 420, fontSize: "clamp(18px, 4.5vw, 26px)", lineHeight: 1.2, color: "#C7C7CC", letterSpacing: "-0.01em", marginTop: "10px", animation: "fadeUp 700ms ease forwards" }}>
              ...except your stress?
            </p>
          )}
        </div>

        <div className="relative z-0 w-full flex items-center justify-center" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <img
            src="/assets/hero-monk.png"
            alt=""
            draggable={false}
            style={{ width: "100%", height: "auto", display: "block", objectFit: "contain", filter: "contrast(1.04)", userSelect: "none" }}
          />
          <div style={{
            position: "absolute",
            top: "38%",
            left: "50%",
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,160,50,0.85) 0%, rgba(255,100,20,0.4) 40%, transparent 70%)",
            animation: "glowPulse 4s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 2,
          }} />
        </div>

        <div style={{ position: "fixed", inset: 0, background: "linear-gradient(to bottom, #0A0C10 0%, transparent 20%, transparent 72%, #0A0C10 100%)", pointerEvents: "none", zIndex: 5 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-[#2e2b28] transition-colors duration-1000" style={{ background: expr.background }}>
      <style>{`
        @keyframes monkBreath {
          0%   { transform: scale(1) translateY(var(--posture)) rotate(var(--rotation)); }
          50%  { transform: scale(var(--amplitude)) translateY(var(--posture)) rotate(var(--rotation)); }
          100% { transform: scale(1) translateY(var(--posture)) rotate(var(--rotation)); }
        }
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="w-full max-w-xl flex flex-col items-center text-center px-6">
        <div className="text-xs tracking-[0.45em] uppercase text-[#5f5a54] mb-1">The Munk</div>
        <div className="text-sm text-[#6b655e] mb-10">{dateLabel}</div>
        <div style={{ "--amplitude": expr.breathAmplitude, "--posture": expr.postureOffset, "--rotation": expr.torsoRotation, animation: phase === "stillness" ? "none" : `monkBreath ${expr.breathDuration} ease-in-out infinite` } as React.CSSProperties}>
          <img src="/assets/munk-transparent.png" alt="Munk" className="w-[260px] select-none" draggable={false} />
        </div>
        {showInsight && (
          <div className="mt-10 text-[34px] leading-[1.25] font-medium" style={{ animation: "fadeUp 900ms ease" }}>{resolvedInsight}</div>
        )}
        {showGuidance && (
          <div className="mt-6 text-[18px] text-[#5a544f] max-w-md" style={{ animation: "fadeUp 900ms ease" }}>{guidance}</div>
        )}
        {showReflection && (
          <div className="mt-12 w-full" style={{ animation: "fadeUp 900ms ease" }}>
            <div className="text-xs tracking-[0.35em] uppercase text-[#6b655e] mb-4">Reflection</div>
            <div className="text-lg mb-6">How does your body feel today?</div>
            <div className="flex gap-3 justify-center">
              {(["low", "mid", "high"] as const).map((val) => (
                <button key={val} onClick={() => setReflection(val)} className={`px-6 py-3 rounded-xl border capitalize transition-all ${reflection === val ? "bg-[#f6f1e8] border-[#b9ae9c]" : "bg-white/40 border-[#d8d0c5]"}`}>
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
