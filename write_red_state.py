content = '''"use client";

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
  breathStartMs: 1200,
  insightMs:     2400,
  guidanceMs:    3300,
  reflectionMs:  4200,
};

// State expression — all three states complete.
// GREEN: reference identity — neutral, regulated, steady.
// YELLOW: heavier, warmer. Slower breath, slight posture + rotation.
// RED: slower, more grounded. More contained than YELLOW. Not warmer — softer.
type StateExpression = {
  breathDuration:  string
  breathAmplitude: string
  postureOffset:   string
  torsoRotation:   string
  background:      string
}

const STATE_EXPRESSION: Record<SystemState, StateExpression> = {
  GREEN: {
    breathDuration:  "6s",
    breathAmplitude: "1.012",
    postureOffset:   "0px",
    torsoRotation:   "0deg",
    background:      "#EEE9E0",
  },
  YELLOW: {
    breathDuration:  "7.2s",
    breathAmplitude: "1.008",
    postureOffset:   "2px",
    torsoRotation:   "0.2deg",
    background:      "#EDE4D3",
  },
  RED: {
    breathDuration:  "8.4s",
    breathAmplitude: "1.005",
    postureOffset:   "3px",
    torsoRotation:   "0.6deg",
    background:      "#EAE5DB",
  },
}

export default function MunkDailyBriefRatnaV2({ contract, dateLabel = "Today", onReflectionSubmit }: Props) {
  const { state, insight, guidance } = contract;
  const expr = STATE_EXPRESSION[state];

  const [phase, setPhase] = useState<"stillness" | "breathing" | "insight" | "guidance" | "reflection">("stillness");
  const [reflection, setReflection] = useState<ReflectionValue>(null);

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
    if (reflection && onReflectionSubmit) {
      onReflectionSubmit(reflection);
    }
  }, [reflection, onReflectionSubmit]);

  const resolvedInsight = insight ?? DEFAULT_EMPTY_INSIGHT;

  const showInsight    = phase === "insight" || phase === "guidance" || phase === "reflection";
  const showGuidance   = phase === "guidance" || phase === "reflection";
  const showReflection = phase === "reflection";

  return (
    <div
      className="min-h-screen flex items-center justify-center text-[#2e2b28] transition-colors duration-1000"
      style={{ background: expr.background }}
    >
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

        <div
          style={{
            "--amplitude": expr.breathAmplitude,
            "--posture":   expr.postureOffset,
            "--rotation":  expr.torsoRotation,
            animation: phase === "stillness"
              ? "none"
              : `monkBreath ${expr.breathDuration} ease-in-out infinite`,
          } as React.CSSProperties}
        >
          <img
            src="/assets/munk-transparent.png"
            alt="Munk"
            className="w-[260px] select-none"
            draggable={false}
          />
        </div>

        {showInsight && (
          <div
            className="mt-10 text-[34px] leading-[1.25] font-medium"
            style={{ animation: "fadeUp 900ms ease" }}
          >
            {resolvedInsight}
          </div>
        )}

        {showGuidance && (
          <div
            className="mt-6 text-[18px] text-[#5a544f] max-w-md"
            style={{ animation: "fadeUp 900ms ease" }}
          >
            {guidance}
          </div>
        )}

        {showReflection && (
          <div className="mt-12 w-full" style={{ animation: "fadeUp 900ms ease" }}>
            <div className="text-xs tracking-[0.35em] uppercase text-[#6b655e] mb-4">Reflection</div>
            <div className="text-lg mb-6">How does your body feel today?</div>
            <div className="flex gap-3 justify-center">
              {(["low", "mid", "high"] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setReflection(val)}
                  className={`px-6 py-3 rounded-xl border capitalize transition-all ${
                    reflection === val
                      ? "bg-[#f6f1e8] border-[#b9ae9c]"
                      : "bg-white/40 border-[#d8d0c5]"
                  }`}
                >
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
'''

with open('/Users/thomas/Desktop/The_Munk_Health/themunk_app/apps/web/app/components/MunkDailyBriefRatnaV2.tsx', 'w') as f:
    f.write(content)

print("RED state implemented: #EAE5DB, breath 8.4s, amplitude 1.005, posture 3px, rotation 0.6deg")
