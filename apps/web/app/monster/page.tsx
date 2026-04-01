"use client";
import { useEffect, useState } from "react";
import { HeroMunk } from "../components/hero/HeroMunk";

const APP_BG = "radial-gradient(ellipse at 50% 20%, #2F5D54 0%, #1C3A34 40%, #0F1F1C 100%)";

type Pattern = {
  code: string;
  confidence: "low" | "medium" | "high";
  evidence_days: number;
};

type PatternsResponse = {
  sufficient_data: boolean;
  window_days: number;
  patterns: Pattern[];
};

const PATTERN_LABEL: Record<string, string> = {
  repeated_elevated_stress:       "Vedvarende høyt stress",
  subjective_load_above_baseline: "Opplevd belastning over normalt",
  recovery_deficit:               "Underskudd på restitusjon",
  green_streak:                   "Stabil restitusjonsperiode",
  hrv_suppressed:                 "Lavt restitusjonsnivå over tid",
};

const PATTERN_BODY: Record<string, string> = {
  repeated_elevated_stress:       "Kroppen har vist forhøyet stress i flere dager på rad. Dette er ikke én dårlig natt — det er et mønster.",
  subjective_load_above_baseline: "Du har rapportert at kroppen kjennes tyngre enn vanlig over flere dager.",
  recovery_deficit:               "Kroppen har ikke fått nok tid til å hente seg inn mellom belastningene.",
  green_streak:                   "Du er inne i en god periode. Kroppen restituerer stabilt.",
  hrv_suppressed:                 "Kroppens evne til å håndtere stress har vært lavere enn normalt den siste tiden.",
};

const PATTERN_MEANING: Record<string, string> = {
  repeated_elevated_stress:       "Når dette gjentar seg over flere dager, blir det ofte vanskeligere å hente seg inn igjen — selv når dagene ikke føles spesielt krevende.",
  subjective_load_above_baseline: "Dette kan være en del av grunnen til at kroppen kjennes mer anspent enn vanlig. Signalene stemmer med det du selv merker.",
  recovery_deficit:               "Dette mønsteret gjør at selv vanlige dager kan føles tyngre enn de egentlig er. Kroppen jobber hardere enn den burde for å holde seg stabil.",
  green_streak:                   "Dette gir kroppen rom til å bygge seg opp. En god periode nå betyr bedre motstandskraft fremover.",
  hrv_suppressed:                 "Lavere restitusjon over tid gjør at kroppen tåler mindre variasjon. Det som normalt ikke merkes, kan begynne å sette spor.",
};

const CONFIDENCE_LABEL: Record<string, string> = {
  high:   "Tydelig mønster",
  medium: "Fremvoksende mønster",
  low:    "Svakt signal",
};

export default function MonsterPage() {
  const [data, setData] = useState<PatternsResponse | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    fetch("/api/patterns/today")
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div className="min-h-screen w-full" style={{ background: APP_BG }}>
      <style>{`
        .ease-in { opacity: 0; transform: translateY(6px); transition: opacity 800ms cubic-bezier(.22,1,.36,1), transform 800ms cubic-bezier(.22,1,.36,1); }
        .ease-in.v { opacity: 1; transform: translateY(0); }
        .d1 { transition-delay: 0ms; }
        .d2 { transition-delay: 120ms; }
        .d3 { transition-delay: 240ms; }
        .d4 { transition-delay: 320ms; }
        .d5 { transition-delay: 400ms; }
      `}</style>

      <div className="w-full flex flex-col items-center px-6 pb-16" style={{ paddingTop: "48px" }}>
        <div className="w-full max-w-xl flex flex-col items-center text-center">

          {/* Back */}
          <div className={`ease-in d1 w-full text-left mb-6${mounted ? " v" : ""}`}>
            <button
              onClick={() => window.location.href = "/check-in"}
              className="text-[13px]"
              style={{ color: "rgba(255,255,255,0.30)", letterSpacing: "0.06em" }}
            >
              ← Tilbake
            </button>
          </div>

          {/* Header */}
          <div className={`ease-in d1${mounted ? " v" : ""}`}>
            <div className="text-[11px] tracking-[0.28em] uppercase text-[rgba(255,255,255,0.35)] mb-3">
              Mønster
            </div>
            <h1 className="text-[28px] font-semibold text-white leading-tight mb-2">
              Slik har kroppen<br />hatt det den siste uken
            </h1>
          </div>

          {/* Munk small */}
          <div className={`ease-in d2 mt-4 mb-8${mounted ? " v" : ""}`}>
            <HeroMunk state={null} />
          </div>

          {/* Patterns */}
          {!data && (
            <div className={`ease-in d3 text-[15px] text-[rgba(255,255,255,0.40)]${mounted ? " v" : ""}`}>
              Henter mønster…
            </div>
          )}

          {data && !data.sufficient_data && (
            <div className={`ease-in d3 w-full rounded-2xl px-6 py-6${mounted ? " v" : ""}`}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <div className="text-[15px] text-[rgba(255,255,255,0.55)]">
                Munken trenger litt mer data før han kan se et tydelig mønster. Kom tilbake om noen dager.
              </div>
            </div>
          )}

          {data && data.sufficient_data && data.patterns.map((p, i) => {
            const label   = PATTERN_LABEL[p.code] ?? p.code;
            const body    = PATTERN_BODY[p.code] ?? "";
            const meaning = PATTERN_MEANING[p.code] ?? "";
            const conf    = CONFIDENCE_LABEL[p.confidence] ?? p.confidence;
            const delayClass = ["d3","d4","d5"][i] ?? "d5";
            return (
              <div
                key={p.code}
                className={`ease-in ${delayClass} w-full rounded-2xl px-6 py-6 mb-4 text-left${mounted ? " v" : ""}`}
                style={{
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div className="text-[11px] tracking-[0.24em] uppercase mb-2"
                  style={{ color: "rgba(255,200,80,0.60)" }}>
                  {conf} · {p.evidence_days} dager
                </div>
                <div className="text-[18px] font-semibold text-white mb-2">
                  {label}
                </div>
                {body && (
                  <div className="text-[15px] leading-relaxed mb-3"
                    style={{ color: "rgba(255,255,255,0.65)" }}>
                    {body}
                  </div>
                )}
                {meaning && (
                  <div className="text-[14px] leading-relaxed"
                    style={{ color: "rgba(255,200,80,0.55)", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "12px" }}>
                    {meaning}
                  </div>
                )}
              </div>
            );
          })}

          {/* Window note */}
          {data && data.sufficient_data && (
            <div className={`ease-in d5 mt-2 text-[13px]${mounted ? " v" : ""}`}
              style={{ color: "rgba(255,255,255,0.25)" }}>
              Basert på de siste {data.window_days} dagene
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
