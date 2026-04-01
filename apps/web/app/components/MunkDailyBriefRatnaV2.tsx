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

type TimeBucket = "morning" | "day" | "evening";

function getTimeBucket(): TimeBucket {
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

const NOW_TEXT: Record<SystemState, Record<TimeBucket, string>> = {
  GREEN: {
    morning: "Du starter dagen i god balanse.",
    day:     "Kroppen holder seg stabil utover dagen.",
    evening: "Du har brukt lite av reservene i dag.",
  },
  YELLOW: {
    morning: "Du starter med litt ubrukt stress fra natten.",
    day:     "Stressnivået holder seg oppe — kroppen jobber fortsatt.",
    evening: "Dagen har kostet mer enn kroppen rakk å hente inn.",
  },
  RED: {
    morning: "Kroppen er allerede belastet før dagen begynner.",
    day:     "Stressnivået er høyt — kroppen er under press nå.",
    evening: "Dagens belastning sitter fortsatt i kroppen.",
  },
};

const ACTION_NOW_TEXT: Record<SystemState, Record<TimeBucket, string>> = {
  GREEN: {
    morning: "Bruk energien — i dag tåler du mer.",
    day:     "Hold tempoet. Du har margin.",
    evening: "God kveld for tidlig søvn — bygg videre på overskuddet.",
  },
  YELLOW: {
    morning: "Unngå store belastninger tidlig — la kroppen varme opp.",
    day:     "Ta en pause før du trenger det.",
    evening: "Legg telefonen bort. Kroppen trenger ro nå.",
  },
  RED: {
    morning: "Utsett det som kan vente. Start rolig.",
    day:     "Senk intensiteten. Kroppen klarer ikke mer akkurat nå.",
    evening: "Ingen skjerm, ingen krevende samtaler. Bare ro.",
  },
};

export default function MunkDailyBriefRatnaV2({ contract, dateLabel = "I dag", onRendered }: Props) {
  const { state, insight, guidance, context_line, context_pattern } = contract;
  const expr = STATE_EXPRESSION[state];
  const [mounted, setMounted] = useState(false);
  const [timeBucket, setTimeBucket] = useState<TimeBucket>("morning");

  useEffect(() => {
    setTimeBucket(getTimeBucket());
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (mounted && onRendered) onRendered();
  }, [mounted]);

  const resolvedInsight = insight ?? UI.defaultInsight;
  const nowText = NOW_TEXT[state][timeBucket];
  const actionNowText = ACTION_NOW_TEXT[state][timeBucket];

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
        .monk-wrap    { opacity: 0; transform: translateY(4px) scale(0.99); }
        .monk-wrap.in { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0ms; }
        .b-state      { opacity: 0; transform: translateY(4px); }
        .b-state.in   { opacity: 1; transform: translateY(0); transition-delay: 200ms; }
        .b-why        { opacity: 0; transform: translateY(4px); }
        .b-why.in     { opacity: 1; transform: translateY(0); transition-delay: 400ms; }
        .b-action     { opacity: 0; transform: translateY(4px); }
        .b-action.in  { opacity: 1; transform: translateY(0); transition-delay: 600ms; }
        .b-context    { opacity: 0; transform: translateY(4px); }
        .b-context.in { opacity: 1; transform: translateY(0); transition-delay: 520ms; }
        .b-now        { opacity: 0; transform: translateY(4px); }
        .b-now.in     { opacity: 1; transform: translateY(0); transition-delay: 700ms; }
        .b-ask        { opacity: 0; transform: translateY(4px); }
        .b-ask.in     { opacity: 1; transform: translateY(0); transition-delay: 820ms; }
        .b-monster    { opacity: 0; transform: translateY(4px); }
        .b-monster.in { opacity: 1; transform: translateY(0); transition-delay: 920ms; }
        .b-reflect    { opacity: 0; transform: translateY(4px); }
        .b-reflect.in { opacity: 1; transform: translateY(0); transition-delay: 1020ms; }
        .ask-card:active    { transform: scale(0.98); }
        .monster-card:active { transform: scale(0.98); }
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

          {/* Stress level */}
          <div className={`b-state ease-spring${mounted ? " in" : ""}`}>
            <div className="text-[13px] tracking-[0.3em] uppercase text-[#6E6E73] mb-1">Stressnivå</div>
            <div className="text-[36px] leading-[1.15] font-semibold text-white">
              {STATE_LABEL[state]}
            </div>
          </div>

          {/* Why — lifted contrast */}
          {resolvedInsight !== UI.defaultInsight && (
            <div className={`b-why ease-spring mt-2 text-[17px] text-[rgba(255,255,255,0.90)] max-w-sm${mounted ? " in" : ""}`}>
              {resolvedInsight}
            </div>
          )}

          {/* Context line — lifted contrast + size */}
          {context_line && (
            <div className={`b-context ease-spring mt-2 text-[16px] text-[rgba(255,255,255,0.70)] max-w-sm${mounted ? " in" : ""}`}>
              {context_line}
            </div>
          )}

          {/* Guidance */}
          <div className={`b-action ease-spring mt-2 text-[17px] font-medium text-white max-w-sm${mounted ? " in" : ""}`}>
            {guidance}
          </div>

          {/* NOW + Gjør nå */}
          <div
            className={`b-now ease-spring mt-7 w-full rounded-2xl px-6 py-7${mounted ? " in" : ""}`}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.11)",
            }}
          >
            <div className="text-[11px] tracking-[0.28em] uppercase mb-3"
              style={{ color: "rgba(255,255,255,0.55)" }}>Nå</div>
            <div className="text-[17px] text-white leading-snug mb-5">{nowText}</div>
            <div className="w-full h-px mb-5" style={{ background: "rgba(255,255,255,0.10)" }} />
            <div className="text-[11px] tracking-[0.28em] uppercase mb-3"
              style={{ color: "rgba(255,255,255,0.55)" }}>Gjør nå</div>
            <div className="text-[17px] font-semibold text-white leading-snug">{actionNowText}</div>
          </div>

          {/* Ask the Munk */}
          <div
            className={`ask-card b-ask ease-spring mt-4 w-full rounded-2xl px-6 py-6 cursor-pointer${mounted ? " in" : ""}`}
            style={{
              background: "rgba(255,200,80,0.13)",
              border: "1px solid rgba(255,200,80,0.35)",
              transition: "transform 150ms ease, background 150ms ease",
            }}
            onClick={() => window.location.href = "/ask"}
          >
            <div className="text-[11px] tracking-[0.28em] uppercase mb-2"
              style={{ color: "rgba(255,200,80,0.85)" }}>
              Spør Munken
            </div>
            <div className="text-[16px] font-semibold text-white">
              Dagens signaler er klare. Hva vil du forstå?
            </div>
            <div className="mt-3 text-[13px]"
              style={{ color: "rgba(255,200,80,0.85)" }}>
              Trykk for å spørre →
            </div>
          </div>

          {/* Se mønsteret */}
          <div
            className={`monster-card b-monster ease-spring mt-4 w-full rounded-2xl px-6 py-6 cursor-pointer text-left${mounted ? " in" : ""}`}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              transition: "transform 150ms ease, background 150ms ease",
            }}
            onClick={() => window.location.href = "/monster"}
          >
            <div className="text-[11px] tracking-[0.28em] uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.50)" }}>
              Siste 7 dager
            </div>
            <div className="text-[17px] font-semibold text-white mb-1">
              Se mønsteret
            </div>
            <div className="text-[15px]"
              style={{ color: "rgba(255,255,255,0.65)" }}>
              Se om stresset bygger seg opp eller slipper taket
            </div>
            <div className="mt-3 text-[13px]"
              style={{ color: "rgba(255,255,255,0.45)" }}>
              Åpne →
            </div>
          </div>

          {/* Divider */}
          <div className="w-12 h-px my-6" style={{ background: "rgba(255,255,255,0.12)" }} />

          {/* Context Surface */}
          <ContextSurfaceCard patternCode={context_pattern ?? null} />

          {/* Reflection */}
          <div className={`b-reflect ease-spring w-full mt-2${mounted ? " in" : ""}`}>
            <ReflectionMemoryCard dayKey={new Date().toISOString().slice(0, 10)} />
          </div>

          {/* Secondary */}
          <div className="mt-6 mb-10 w-full flex flex-col items-center">
            <button
              onClick={() => window.location.href = "/stress-now"}
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.30)", letterSpacing: "0.06em" }}
            >
              Stress nå →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
