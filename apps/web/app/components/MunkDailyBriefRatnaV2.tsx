"use client";
import { useEffect, useState } from "react";
import { UI } from "../lib/ui-strings";

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

type StateExpression = {
  breathDuration: string;
  breathAmplitude: string;
  postureOffset: string;
  torsoRotation: string;
};

const STATE_EXPRESSION: Record<SystemState, StateExpression> = {
  GREEN:  { breathDuration: "6s",   breathAmplitude: "1.012", postureOffset: "0px", torsoRotation: "0deg" },
  YELLOW: { breathDuration: "7.2s", breathAmplitude: "1.008", postureOffset: "2px", torsoRotation: "0.2deg" },
  RED:    { breathDuration: "8.4s", breathAmplitude: "1.005", postureOffset: "3px", torsoRotation: "0.6deg" },
};

const APP_BG = "radial-gradient(ellipse at 50% 20%, #2F5D54 0%, #1C3A34 40%, #0F1F1C 100%)";

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

export default function MunkDailyBriefRatnaV2({ contract, dateLabel = "I dag", onReflectionSubmit }: Props) {
  const { state, insight, guidance } = contract;
  const expr = STATE_EXPRESSION[state];
  const [reflection, setReflection] = useState<ReflectionValue>(null);
  const [mounted, setMounted] = useState(false);
  const { showArrival, showLine1, showLine2 } = useMorningArrival();

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (reflection && onReflectionSubmit) onReflectionSubmit(reflection);
  }, [reflection, onReflectionSubmit]);

  const resolvedInsight = insight ?? UI.defaultInsight;

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: APP_BG }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%   { opacity: 0.12; transform: translate(-50%, -50%) scale(1); }
          50%  { opacity: 0.28; transform: translate(-50%, -50%) scale(1.05); }
          100% { opacity: 0.12; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes monkBreath {
          0%   { transform: scale(1) translateY(var(--posture)) rotate(var(--rotation)); }
          50%  { transform: scale(var(--amplitude)) translateY(var(--posture)) rotate(var(--rotation)); }
          100% { transform: scale(1) translateY(var(--posture)) rotate(var(--rotation)); }
        }
        .ease-spring {
          transition: opacity 900ms cubic-bezier(0.25, 0.9, 0.3, 1), transform 900ms cubic-bezier(0.25, 0.9, 0.3, 1);
          will-change: opacity, transform;
        }
        .monk-wrap { opacity: 0; transform: translateY(4px) scale(0.99); }
        .monk-wrap.in { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0ms; }
        .brief-header { opacity: 0; transform: translateY(4px); }
        .brief-header.in { opacity: 1; transform: translateY(0); transition-delay: 60ms; }
        .brief-insight { opacity: 0; transform: translateY(4px); }
        .brief-insight.in { opacity: 1; transform: translateY(0); transition-delay: 500ms; }
        .brief-guidance { opacity: 0; transform: translateY(4px); }
        .brief-guidance.in { opacity: 1; transform: translateY(0); transition-delay: 700ms; }
        .brief-reflection { opacity: 0; transform: translateY(4px); }
        .brief-reflection.in { opacity: 1; transform: translateY(0); transition-delay: 1100ms; }
      `}</style>

      {/* ── MORNING ARRIVAL OVERLAY ── */}
      <div
        className="absolute inset-0 flex flex-col items-center z-20"
        style={{
          opacity: showArrival ? 1 : 0,
          pointerEvents: showArrival ? "auto" : "none",
          transition: "opacity 600ms ease-out",
        }}
      >
        <div style={{
          position: "fixed", inset: 0,
          background: "linear-gradient(to bottom, rgba(15,20,15,0.6) 0%, transparent 20%, transparent 72%, rgba(10,15,10,0.8) 100%)",
          pointerEvents: "none", zIndex: 5,
        }} />
        <div className="relative z-10 w-full flex flex-col items-center pt-[13vh] px-6 text-center min-h-[26vh]">
          <p style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 650,
            fontSize: "clamp(20px, 5vw, 30px)", lineHeight: 1.2,
            color: "#FFFFFF", letterSpacing: "-0.01em",
            opacity: showLine1 ? 1 : 0,
            transform: showLine1 ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 700ms ease, transform 700ms ease",
          }}>
            {UI.arrivalLine1}
          </p>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 420,
            fontSize: "clamp(18px, 4.5vw, 26px)", lineHeight: 1.2,
            color: "#C7C7CC", letterSpacing: "-0.01em", marginTop: "10px",
            opacity: showLine2 ? 1 : 0,
            transform: showLine2 ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 700ms ease, transform 700ms ease",
          }}>
            {UI.arrivalLine2}
          </p>
        </div>
        <div className="relative z-0 w-full flex items-center justify-center" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <img
            src="/assets/hero-monk.png"
            alt=""
            draggable={false}
            style={{
              width: "100%", height: "auto", display: "block",
              objectFit: "contain", filter: "contrast(1.04)", userSelect: "none",
              opacity: showArrival ? 1 : 0,
              transition: "opacity 500ms ease-out",
            }}
          />
          <div style={{
            position: "absolute", top: "38%", left: "50%",
            width: "75px", height: "75px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,160,50,0.85) 0%, rgba(255,100,20,0.4) 40%, transparent 70%)",
            animation: "glowPulse 5s ease-in-out infinite",
            pointerEvents: "none", zIndex: 2,
          }} />
        </div>
      </div>

      {/* ── DAILY BRIEF ── */}
      <div
        className="w-full flex items-start justify-center text-white"
        style={{ paddingTop: "48px", minHeight: "100vh", opacity: showArrival ? 0 : 1, transition: "opacity 600ms ease-out" }}
      >
        <div className="w-full max-w-xl flex flex-col items-center text-center px-6">

          {/* Header */}
          <div className={`brief-header ease-spring w-full mb-10${mounted ? " in" : ""}`}>
            <div className="text-lg tracking-[0.3em] uppercase text-white font-semibold mb-2">{UI.appName}</div>
            <div className="text-base text-[#C7C7CC]">{dateLabel}</div>
          </div>

          {/* Munk + glow */}
          <div className={`monk-wrap ease-spring relative${mounted ? " in" : ""}`}>
            <div style={{
              "--amplitude": expr.breathAmplitude,
              "--posture": expr.postureOffset,
              "--rotation": expr.torsoRotation,
              animation: mounted ? `monkBreath ${expr.breathDuration} ease-in-out infinite` : "none",
              animationDelay: "1200ms",
            } as React.CSSProperties}>
              <img
                src="/assets/munk-transparent.png"
                alt="Munk"
                style={{ width: "240px" }}
                className="select-none"
                draggable={false}
              />
            </div>
            <div style={{
              position: "absolute", top: "42%", left: "50%",
              width: "75px", height: "75px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,160,50,0.85) 0%, rgba(255,100,20,0.4) 40%, transparent 70%)",
              animation: "glowPulse 5s ease-in-out infinite",
              pointerEvents: "none",
            }} />
          </div>

          {/* Insight */}
          <div className={`brief-insight ease-spring mt-10 text-[34px] leading-[1.25] font-medium${mounted ? " in" : ""}`}>
            {resolvedInsight}
          </div>

          {/* Guidance */}
          <div className={`brief-guidance ease-spring mt-6 text-[18px] text-[#C7C7CC] max-w-md${mounted ? " in" : ""}`}>
            {guidance}
          </div>

          {/* Reflection */}
          <div className={`brief-reflection ease-spring mt-12 w-full${mounted ? " in" : ""}`}>
            <div className="text-xs tracking-[0.35em] uppercase text-[#6E6E73] mb-4">{UI.sectionReflection}</div>
            <div className="text-lg mb-6 text-white">{UI.reflectionQuestion}</div>
            <div className="flex gap-3 justify-center">
              {(["low", "mid", "high"] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setReflection(val)}
                  className={`px-6 py-3 rounded-xl border capitalize transition-all ${
                    reflection === val ? "bg-white/20 border-white/40" : "bg-white/10 border-white/20"
                  }`}
                >
                  {UI.reflectionOptions[val]}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
