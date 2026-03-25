"use client";
import { useEffect, useState } from "react";
import { UI } from "../lib/ui-strings";
import ReflectionMemoryCard from "./ReflectionMemoryCard";
import ContextSurfaceCard from "./ContextSurfaceCard";

type SystemState = "GREEN" | "YELLOW" | "RED";
export type RatnaContract = {
  state: SystemState;
  insight: string | null;
  guidance: string;
  context_line?: string | null;
  context_pattern?: string | null;
};

type Props = {
  contract: RatnaContract;
  dateLabel?: string;
  onRendered?: () => void;
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

const STATE_LABEL: Record<SystemState, string> = {
  GREEN:  "Godt restituert",
  YELLOW: "Moderat stress",
  RED:    "Høyt stress",
};

const STATE_BODY: Record<SystemState, string> = {
  GREEN:  "Kroppen er godt restituert",
  YELLOW: "Kroppen har ikke hentet seg helt inn",
  RED:    "Kroppen er under betydelig belastning",
};

export default function MunkDailyBriefRatnaV2({ contract, dateLabel = "I dag", onRendered }: Props) {
  const { state, insight, guidance, context_line, context_pattern } = contract;
  const expr = STATE_EXPRESSION[state];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (mounted && onRendered) onRendered();
  }, [mounted]);

  const resolvedInsight = insight ?? UI.defaultInsight;

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: APP_BG }}>
      <style>{`
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
        .monk-wrap   { opacity: 0; transform: translateY(4px) scale(0.99); }
        .monk-wrap.in { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0ms; }
        .b-state     { opacity: 0; transform: translateY(4px); }
        .b-state.in  { opacity: 1; transform: translateY(0); transition-delay: 200ms; }
        .b-why       { opacity: 0; transform: translateY(4px); }
        .b-why.in    { opacity: 1; transform: translateY(0); transition-delay: 400ms; }
        .b-action    { opacity: 0; transform: translateY(4px); }
        .b-action.in { opacity: 1; transform: translateY(0); transition-delay: 600ms; }
        .b-context    { opacity: 0; transform: translateY(4px); }
        .b-context.in { opacity: 1; transform: translateY(0); transition-delay: 520ms; }
        .b-reflect   { opacity: 0; transform: translateY(4px); }
        .b-reflect.in { opacity: 1; transform: translateY(0); transition-delay: 900ms; }
      `}</style>

      <div className="w-full flex items-start justify-center text-white" style={{ paddingTop: "8px", minHeight: "100vh" }}>
        <div className="w-full max-w-xl flex flex-col items-center text-center px-6">

          {/* Date */}
          <div className="text-xs tracking-[0.25em] uppercase text-[#6E6E73] mb-1">{dateLabel}</div>

          {/* Munk */}
          <div className={`monk-wrap ease-spring relative${mounted ? " in" : ""}`} style={{ marginBottom: "4px" }}>
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
                style={{ width: "140px" }}
                className="select-none"
                draggable={false}
              />
            </div>
            <div style={{
              position: "absolute", top: "42%", left: "50%",
              width: "65px", height: "65px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,160,50,0.85) 0%, rgba(255,100,20,0.4) 40%, transparent 70%)",
              animation: "glowPulse 5s ease-in-out infinite",
              pointerEvents: "none",
            }} />
          </div>

          {/* Stress level — primary */}
          <div className={`b-state ease-spring${mounted ? " in" : ""}`}>
            <div className="text-[13px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1">Stressnivå</div>
            <div className="text-[36px] leading-[1.15] font-semibold text-white">
              {STATE_LABEL[state]}
            </div>
          </div>

          {/* Why */}
          <div className={`b-why ease-spring mt-2 text-[16px] text-[#C7C7CC] max-w-sm${mounted ? " in" : ""}`}>
            {resolvedInsight !== UI.defaultInsight ? resolvedInsight : STATE_BODY[state]}
          </div>

          {/* Action */}
          {context_line && (
          <div className={`b-context ease-spring mt-1 text-[13px] text-[rgba(255,255,255,0.30)] max-w-sm${mounted ? " in" : ""}`}>
            {context_line}
          </div>
          )}

          <div className={`b-action ease-spring mt-2 text-[16px] text-[#C7C7CC] max-w-sm${mounted ? " in" : ""}`}>
            {guidance}
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-white/8 my-4" />

          {/* Reflection Memory V1 */}
          <div className={`b-reflect ease-spring w-full${mounted ? " in" : ""}`}>
            <ReflectionMemoryCard dayKey={new Date().toISOString().slice(0, 10)} />
          </div>

          {/* Context Surface */}
          <ContextSurfaceCard patternCode={context_pattern ?? null} />

          {/* Secondary entry points */}
          <div className="b-reflect ease-spring mt-4 w-full flex flex-col items-center gap-3">
            <button
              onClick={() => window.location.href = "/stress-now"}
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}
            >
              Stress nå →
            </button>
          </div>

          {/* Ask the Munk entry */}
          <div
            className={`b-reflect ease-spring mt-3 mb-10 w-full rounded-2xl px-5 py-4 cursor-pointer${mounted ? " in" : ""}`}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            onClick={() => window.location.href = "/ask"}
          >
            <div className="text-xs tracking-[0.25em] uppercase text-[rgba(255,255,255,0.25)] mb-1">
              Spør Munken
            </div>
            <div className="text-[13px] text-[rgba(255,255,255,0.38)]">
              Spør om stress, søvn, HRV eller dagens mønster
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
