"use client";
import { useEffect, useState } from "react";
import { UI } from "../lib/ui-strings";
import ContextSurfaceCard from "./ContextSurfaceCard";
import { useAtmosphere } from "../../hooks/useAtmosphere";

type SystemState = "GREEN" | "YELLOW" | "RED";
export type RatnaContract = {
  state: SystemState;
  insight: string | null;
  guidance: string;
  context_line?: string | null;
  context_pattern?: string | null;
  hrv?: number | null;
  rhr?: number | null;
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

const STATE_LABEL: Record<SystemState, string> = {
  GREEN:  "Well recovered",
  YELLOW: "Moderate stress",
  RED:    "High stress",
};
const BRIEF_CONTENT: Record<SystemState, { title: string; body: string; action: string }> = {
  GREEN:  { title: "System in balance",          body: "You have high capacity today.",                              action: "Use your energy — today you have margin." },
  YELLOW: { title: "Resilience reduced",         body: "Be mindful of your energy expenditure.",                    action: "Take a break before you need one." },
  RED:    { title: "Persistent stress detected", body: "The body is prioritising recovery. Adjust expectations.",   action: "Postpone what can wait. Start slow." },
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

function getBgClass(bucket: TimeBucket): string {
  if (bucket === "morning") return "bg-munk-morning";
  if (bucket === "day")     return "bg-munk-day";
  if (bucket === "evening") return "bg-munk-evening";
  return "bg-munk-night";
}

const NOW_TEXT: Record<SystemState, Record<TimeBucket, string>> = {
  GREEN: {
    morning: "You start the day in good balance.",
    day:     "Your body remains stable through the day.",
    evening: "You have used little of your reserves today.",
  },
  YELLOW: {
    morning: "Your heart beats a little stiffer today. The nervous system did not fully recover overnight — you start with a stress carryover.",
    day:     "Stress is still present in the body. You have been working since early — now the nervous system needs a break.",
    evening: "The day has cost more than the body managed to recover. Tonight's sleep will resolve the remaining stress.",
  },
  RED: {
    morning: "The body is already under load before the day begins.",
    day:     "Stress level is high — the body is under pressure right now.",
    evening: "Today's load is still present in the body.",
  },
};

const ACTION_NOW_TEXT: Record<SystemState, Record<TimeBucket, string>> = {
  GREEN: {
    morning: "Use your energy — today you can handle more.",
    day:     "Keep the pace. You have margin.",
    evening: "Good evening for early sleep — build on the surplus.",
  },
  YELLOW: {
    morning: "Light movement, plenty of rest. Let the body warm up before loading it.",
    day:     "Take a break before you need one. Stress does not resolve by working harder.",
    evening: "No screens, no demanding conversations. The body needs calm to recover from today.",
  },
  RED: {
    morning: "Postpone what can wait. Start slowly.",
    day:     "Senk intensiteten. Kroppen klarer ikke mer akkurat nå.",
    evening: "No screens, no demanding conversations. Only rest.",
  },
};

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────

type BodyFeeling   = "rolig" | "urolig" | "tung" | "presset";
type BriefAccuracy = "ja" | "delvis" | "nei";
type DayDirection  = "bedre" | "likt" | "verre";

interface ReflectionState {
  body_feeling?:   BodyFeeling;
  brief_accuracy?: BriefAccuracy;
  day_direction?:  DayDirection;
}

function ReflectionSheet({
  onClose,
  dayKey,
}: {
  onClose: () => void;
  dayKey: string;
}) {
  const [state, setState] = useState<ReflectionState>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/reflection/today")
      .then(r => r.json())
      .then(json => {
        if (json.reflection) {
          setState({
            body_feeling:   json.reflection.body_feeling   ?? undefined,
            brief_accuracy: json.reflection.brief_accuracy ?? undefined,
            day_direction:  json.reflection.day_direction  ?? undefined,
          });
          setSaved(true);
        }
      })
      .catch(() => {});
  }, []);

  async function save(patch: Partial<ReflectionState>) {
    const next = { ...state, ...patch };
    setState(next);
    try {
      const res = await fetch("/api/reflection/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day_key: dayKey, ...next }),
      });
      if (res.ok) setSaved(true);
    } catch {}
  }

  function WhisperRow<T extends string>({
    options,
    selected,
    onSelect,
  }: {
    options: { value: T; label: string }[];
    selected: T | undefined;
    onSelect: (v: T) => void;
  }) {
    return (
      <div className="flex gap-6 justify-center flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="text-[16px] transition-all duration-200"
            style={{
              color: selected === opt.value ? "#ffffff" : "rgba(255,255,255,0.35)",
              fontWeight: selected === opt.value ? 500 : 400,
              letterSpacing: "0.02em",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl px-8 pt-8 pb-12 flex flex-col gap-8"
        style={{
          background: "linear-gradient(180deg, #1B3833 0%, #081210 100%)",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.6)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full mx-auto" style={{ background: "rgba(255,255,255,0.15)" }} />

        <div className="text-center">
          <div className="text-[11px] tracking-[0.25em] uppercase mb-1" style={{ color: "#D4AF37" }}>
            Dagens refleksjon
          </div>
          <div className="text-[22px] text-white">
            Hvordan kjentes kroppen nå?
          </div>
        </div>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3 items-center">
            <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              Kroppen i dag
            </div>
            <WhisperRow
              options={[
                { value: "rolig" as BodyFeeling,   label: "Rolig"   },
                { value: "urolig" as BodyFeeling,  label: "Urolig"  },
                { value: "tung" as BodyFeeling,    label: "Tung"    },
                { value: "presset" as BodyFeeling, label: "Presset" },
              ]}
              selected={state.body_feeling}
              onSelect={v => save({ body_feeling: v })}
            />
          </div>

          <div className="flex flex-col gap-3 items-center">
            <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              Traff vurderingen?
            </div>
            <WhisperRow
              options={[
                { value: "ja" as BriefAccuracy,     label: "Ja"     },
                { value: "delvis" as BriefAccuracy, label: "Delvis" },
                { value: "nei" as BriefAccuracy,    label: "Nei"    },
              ]}
              selected={state.brief_accuracy}
              onSelect={v => save({ brief_accuracy: v })}
            />
          </div>

          <div className="flex flex-col gap-3 items-center">
            <div className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
              Dagen utviklet seg
            </div>
            <WhisperRow
              options={[
                { value: "bedre" as DayDirection, label: "Bedre" },
                { value: "likt" as DayDirection,  label: "Likt"  },
                { value: "verre" as DayDirection, label: "Verre" },
              ]}
              selected={state.day_direction}
              onSelect={v => save({ day_direction: v })}
            />
          </div>
        </div>

        {saved && (
          <div className="text-center text-[11px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
            Lagret
          </div>
        )}

        <button
          onClick={onClose}
          className="text-[13px] text-center"
          style={{ color: "rgba(255,255,255,0.30)" }}
        >
          Lukk
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MunkDailyBriefRatnaV2({ contract, dateLabel = "I dag", onRendered }: Props) {
  const { state, insight, guidance, context_line, context_pattern, hrv, rhr } = contract;
  const expr = STATE_EXPRESSION[state];
  const [mounted, setMounted] = useState(false);
  const [timeBucket, setTimeBucket] = useState<TimeBucket>("morning");
  const [activeTab, setActiveTab] = useState<"idag" | "monster" | "ro">("idag");
  const [showReflection, setShowReflection] = useState(false);
  const atm = useAtmosphere();

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
  const bgClass = getBgClass(timeBucket);
  const dayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className={`min-h-screen min-h-[100dvh] w-full relative overflow-hidden ${bgClass}`}
      style={{ background: `radial-gradient(circle at 50% 30%, rgba(45,90,70,0.18) 0%, transparent 55%), linear-gradient(180deg, ${atm.gradientFrom} 0%, ${atm.gradientTo} 100%)`, transition: "background 12s ease-in-out" }}>
      {/* Forest background */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"url('/images/munk-bg-leaf-bright.jpg')", backgroundSize:"cover", backgroundPosition:"center", backgroundAttachment:"fixed", opacity:0.28 }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg, rgba(10,28,22,0.55) 0%, rgba(8,18,16,0.65) 100%)" }} />
      </div>

      {/* Grain texture */}
      <svg aria-hidden="true" style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",opacity:0.015,pointerEvents:"none",zIndex:1,mixBlendMode:"overlay" }}>
        <filter id="brief-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#brief-grain)" />
      </svg>
      {/* Ambient Orb 1 — topp-venstre */}
      <div style={{ position:"fixed",top:"-20%",left:"-20%",width:"80vw",height:"80vw",borderRadius:"50%",background:"radial-gradient(circle, rgba(26,77,46,0.03) 0%, transparent 70%)",filter:"blur(160px)",pointerEvents:"none",zIndex:0 }} />
      {/* Ambient Orb 2 — bunn-høyre */}
      <div style={{ position:"fixed",bottom:"-30%",right:"-25%",width:"90vw",height:"90vw",borderRadius:"50%",background:"radial-gradient(circle, rgba(14,47,26,0.02) 0%, transparent 70%)",filter:"blur(180px)",pointerEvents:"none",zIndex:0 }} />

      {/* Reflection Sheet */}
      {showReflection && (
        <ReflectionSheet onClose={() => setShowReflection(false)} dayKey={dayKey} />
      )}

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
        .b-state      { opacity: 0; transform: translateY(6px); }
        .b-state.in   { opacity: 1; transform: translateY(0); transition-delay: 200ms; }
        .b-why        { opacity: 0; transform: translateY(6px); }
        .b-why.in     { opacity: 1; transform: translateY(0); transition-delay: 350ms; }
        .b-action     { opacity: 0; transform: translateY(6px); }
        .b-action.in  { opacity: 1; transform: translateY(0); transition-delay: 500ms; }
        .b-now        { opacity: 0; transform: translateY(6px); }
        .b-now.in     { opacity: 1; transform: translateY(0); transition-delay: 650ms; }
        .b-ask        { opacity: 0; transform: translateY(6px); }
        .b-ask.in     { opacity: 1; transform: translateY(0); transition-delay: 780ms; }
        .b-monster    { opacity: 0; transform: translateY(6px); }
        .b-monster.in { opacity: 1; transform: translateY(0); transition-delay: 880ms; }
        .b-reflect    { opacity: 0; transform: translateY(6px); }
        .b-reflect.in { opacity: 1; transform: translateY(0); transition-delay: 960ms; }
        .card-press:active { transform: scale(0.98); transition: transform 100ms ease; }
      `}</style>

      {/* Scrollable content — padded for bottom nav */}
      <div className="w-full flex items-start justify-center text-white pb-24" style={{ paddingTop: "4px", minHeight: "100dvh" }}>
        <div className="w-full max-w-xl flex flex-col items-center text-center px-5">

          {/* Date */}
          <div className="text-[11px] tracking-[0.28em] uppercase mb-2" style={{ color: "#ffffff", paddingTop: "4px" }}>
            {dateLabel}
          </div>

          {/* Munk */}
          <div className={`monk-wrap ease-spring relative${mounted ? " in" : ""}`} style={{ marginBottom: "4px", marginTop: "-6vh" }}>
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
                style={{ width: "160px" }}
                className="select-none"
                draggable={false}
              />
            </div>
            <div style={{
              position: "absolute", top: "42%", left: "50%",
              width: "70px", height: "70px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,160,50,0.85) 0%, rgba(255,100,20,0.4) 40%, transparent 70%)",
              animation: "glowPulse 5s ease-in-out infinite",
              pointerEvents: "none",
            }} />
          </div>

          {/* Stress level */}
          <div className={`b-state ease-spring${mounted ? " in" : ""}`}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2 font-semibold" style={{ color: "rgba(212,175,55,0.40)" }}>
              Stress level
            </div>
            <div className="text-[34px] leading-[1.15] font-medium tracking-tight" style={{ color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-crimson), ui-serif, Georgia, serif" }}>
              {STATE_LABEL[state]}
            </div>
          </div>

          {/* Oura Data Row — under overskriften */}
          {(hrv || rhr) && (
            <div className={`b-why ease-spring flex justify-center gap-12 mt-3 mb-1${mounted ? " in" : ""}`} style={{ opacity: 0.85 }}>
              {hrv && (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(212,175,55,0.55)" }}>HRV (Oura Ring)</span>
                  <span className="text-[20px] font-medium italic" style={{ color: "rgba(255,255,255,0.90)", fontFamily: "var(--font-crimson), ui-serif, Georgia, serif" }}>{hrv} ms</span>
                </div>
              )}
              {rhr && (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(212,175,55,0.55)" }}>Resting HR (Oura Ring)</span>
                  <span className="text-[20px] font-medium italic" style={{ color: "rgba(255,255,255,0.90)", fontFamily: "var(--font-crimson), ui-serif, Georgia, serif" }}>{rhr} bpm</span>
                </div>
              )}
            </div>
          )}

          {/* NOW + Do now */}
          <div className={`b-now ease-spring mt-5 w-full${mounted ? " in" : ""}`} style={{ background:"rgba(255,255,255,0.06)", backdropFilter:"blur(30px)", WebkitBackdropFilter:"blur(30px)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:"28px", padding:"22px 24px", boxShadow:"0 24px 60px -15px rgba(0,0,0,0.7)", position:"relative", overflow:"hidden" }}>
            {/* Edge-light */}
            <div style={{ position:"absolute", inset:"0 0 auto 0", height:"1px", background:"linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)" }} />
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3 font-semibold" style={{ color: "rgba(255,255,255,0.40)" }}>
              Body signals
            </div>
            <div className="text-[14px] font-semibold text-white leading-snug mb-1">{BRIEF_CONTENT[contract.state].title}</div>
            <div className="text-[16px] text-white leading-snug mb-4">{BRIEF_CONTENT[contract.state].body}</div>

            {/* Ask the Munk CTA — over Do now */}
            <button
              onClick={() => window.location.href = "/ask"}
              className="w-full mb-6 rounded-2xl text-[11px] uppercase tracking-[0.3em] font-semibold transition-opacity hover:opacity-90 active:opacity-80"
              style={{ padding:"14px", background:"rgba(212,175,55,0.90)", color:"#0d1a15", cursor:"pointer", border:"none" }}
            >
              Ask The Munk about your signals →
            </button>

            <div className="w-full h-px mb-3" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)" }} />
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2 font-semibold" style={{ color: "rgba(212,175,55,0.50)" }}>
              Do now
            </div>
            <div className="text-[16px] font-semibold text-white leading-snug">{BRIEF_CONTENT[contract.state].action}</div>
          </div>

          {/* Ask the Munk — flyttet til meny (Steg 4) */}

          {/* Se mønsteret — flyttet til meny (Steg 4) */}

          {/* Refleksjon — flyttet til meny (Steg 4) */}

          {/* Context Surface — flyttet til meny (Steg 4) */}

        </div>
      </div>


    </div>
  );
}
