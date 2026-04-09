"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAtmosphere } from "../../hooks/useAtmosphere";
import { motion, useAnimationFrame } from "framer-motion";

// APP_BG erstattet av useAtmosphere

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

const PATTERN_MEANING: Record<string, string> = {
  repeated_elevated_stress:       "Når dette gjentar seg over flere dager, blir det ofte vanskeligere å hente seg inn igjen — selv når dagene ikke føles spesielt krevende.",
  subjective_load_above_baseline: "Dette kan være en del av grunnen til at kroppen kjennes mer anspent enn vanlig. Signalene stemmer med det du selv merker.",
  recovery_deficit:               "Dette mønsteret gjør at selv vanlige dager kan føles tyngre enn de egentlig er. Kroppen jobber hardere enn den burde for å holde seg stabil.",
  green_streak:                   "Dette gir kroppen rom til å bygge seg opp. En god periode nå betyr bedre motstandskraft fremover.",
  hrv_suppressed:                 "Lavere restitusjon over tid gjør at kroppen tåler mindre variasjon. Det som normalt ikke merkes, kan begynne å sette spor.",
};

// Beregn de siste 7 dagene bakover fra i dag
function getLast7DayLabels(): string[] {
  const labels = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
  const short = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
  const today = new Date(new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()));
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(short[d.getDay()]);
  }
  return result;
}

// Catmull-Rom spline for smooth SVG path
function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// Generate mock 7-day stress data from pattern
function generateStressData(patterns: Pattern[]): number[] {
  const hasElevated = patterns.some(p => p.code === "repeated_elevated_stress");
  const hasRecovery = patterns.some(p => p.code === "green_streak");
  if (hasElevated) return [0.45, 0.60, 0.75, 0.80, 0.70, 0.65, 0.72];
  if (hasRecovery)  return [0.70, 0.65, 0.55, 0.45, 0.40, 0.38, 0.35];
  return [0.55, 0.60, 0.50, 0.65, 0.58, 0.62, 0.55];
}

export default function MonsterPage() {
  const atm = useAtmosphere();
  const [data, setData] = useState<PatternsResponse | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeDay, setActiveDay] = useState(6); // default to today
  const [scrubX, setScrubX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const breathRef = useRef(0);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    fetch("/api/patterns/today")
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const stressData = data?.sufficient_data ? generateStressData(data.patterns) : [0.5, 0.55, 0.6, 0.5, 0.65, 0.6, 0.55];

  const W = 390;
  const H = 200;
  const PAD = 32;
  const usableW = W - PAD * 2;

  const points = stressData.map((v, i) => ({
    x: PAD + (i / (stressData.length - 1)) * usableW,
    y: H - 20 - v * (H - 60),
  }));

  const wavePath = catmullRomPath(points);
  const areaPath = wavePath + ` L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (x - PAD) / usableW));
    const dayIndex = Math.round(ratio * (stressData.length - 1));
    setScrubX(x);
    setActiveDay(dayIndex);
  }

  function handlePointerLeave() {
    setScrubX(null);
  }

  const activePattern = data?.patterns?.[0];
  const activeLabel = activePattern ? PATTERN_LABEL[activePattern.code] ?? activePattern.code : null;
  const activeMeaning = activePattern ? PATTERN_MEANING[activePattern.code] ?? "" : "";
  const activeStress = stressData[activeDay];
  const glowIntensity = activeStress;

  const dayLabels = getLast7DayLabels();
  const dayNarrative: Record<number, string> = {
    0: `${dayLabels[0]}: Slik startet uken for kroppen din.`,
    1: `${dayLabels[1]}: Stresset begynte å stige stille.`,
    2: `${dayLabels[2]}: Kroppen var under press.`,
    3: `${dayLabels[3]}: Belastningen nådde sitt høyeste punkt.`,
    4: `${dayLabels[4]}: En liten lettelse — kroppen puster litt ut.`,
    5: `${dayLabels[5]}: Restitusjonen er i gang, men ikke ferdig.`,
    6: `${dayLabels[6]}: I dag — kroppen jobber fortsatt med å hente seg inn.`,
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex flex-col" style={{ background: `linear-gradient(160deg, ${atm.gradientFrom} 0%, ${atm.gradientTo} 100%)`, transition: "background 3s ease-in-out" }}>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,28,22,0.55) 0%, rgba(8,18,16,0.65) 100%)" }} />
      </div>



      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/munk-bg-leaf.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", opacity: 0.28, filter: "brightness(1.40) contrast(1.20) saturate(1.15)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,28,22,0.52) 0%, rgba(8,18,16,0.60) 100%)" }} />
      </div>
      <style>{`
        .ease-in { opacity: 0; transform: translateY(6px); transition: opacity 800ms cubic-bezier(.22,1,.36,1), transform 800ms cubic-bezier(.22,1,.36,1); }
        .ease-in.v { opacity: 1; transform: translateY(0); }
        .d1 { transition-delay: 0ms; }
        .d2 { transition-delay: 150ms; }
        .d3 { transition-delay: 300ms; }
      `}</style>

      {/* Atmospheric fog layers */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 30% 60%, rgba(212,175,55,0.04) 0%, transparent 60%)",
      }} />
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 70% 30%, rgba(27,56,51,0.3) 0%, transparent 50%)",
      }} />

      <div className="relative z-10 flex flex-col items-center w-full pb-28">

        {/* Back */}
        <div className={`ease-in d1 w-full px-6 pt-12 mb-2${mounted ? " v" : ""}`}>
          <button
            onClick={() => window.location.href = "/check-in"}
            style={{ fontSize: "13px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}
          >
            ← Tilbake
          </button>
        </div>

        {/* Header */}
        <div className={`ease-in d1 text-center px-6 mb-4${mounted ? " v" : ""}`}>
          <div style={{ fontSize: "11px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", marginBottom: "8px" }}>
            Mønster
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 600, color: "white", lineHeight: 1.2 }}>
            Slik har kroppen<br />hatt det denne uken
          </h1>
        </div>

        {/* Munk med dynamisk glow */}
        <div className={`ease-in d2 relative flex items-center justify-center${mounted ? " v" : ""}`}
          style={{ width: "160px", height: "160px", marginBottom: "8px" }}>
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: `${80 + glowIntensity * 60}px`,
            height: `${80 + glowIntensity * 60}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(212,175,55,${0.3 + glowIntensity * 0.5}) 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
            transition: "all 600ms ease",
            pointerEvents: "none",
          }} />
          <img
            src="/assets/munk-transparent.png"
            alt="Munk"
            style={{ width: "120px", position: "relative", zIndex: 1 }}
            className="select-none"
            draggable={false}
          />
        </div>

        {/* Pusteøvelse CTA — under Munken */}
        <div className={`ease-in d2 w-full px-5 mb-4${mounted ? " v" : ""}`}>
          <div onClick={() => window.location.href = "/ro"} style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"20px", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:"0 0 auto 0", height:"1px", background:"linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)" }} />
            <div>
              <div style={{ fontSize:"10px", letterSpacing:"0.25em", textTransform:"uppercase" as const, color:"rgba(212,175,55,0.60)", marginBottom:"3px" }}>Verktøy</div>
              <div style={{ fontSize:"15px", fontWeight:600, color:"rgba(255,255,255,0.90)" }}>Pusteøvelse for å roe ned</div>
            </div>
            <div style={{ fontSize:"18px", color:"rgba(212,175,55,0.60)" }}>→</div>
          </div>
        </div>

        {/* Day narrative */}
        <div className={`ease-in d2 text-center px-8 mb-6${mounted ? " v" : ""}`}
          style={{ minHeight: "48px" }}>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.70)", lineHeight: 1.6, transition: "opacity 400ms ease" }}>
            {dayNarrative[activeDay]}
          </p>
        </div>



        {/* Dag-labels over bølgen */}
        <div className={`ease-in d3 w-full px-8 mb-2${mounted ? " v" : ""}`} style={{ display:"flex", justifyContent:"space-between" }}>
          {getLast7DayLabels().map((label, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                background: "none", border: "none", cursor: "pointer", padding: "4px 0",
              }}
            >
              <div style={{
                width: i === activeDay ? "8px" : "5px",
                height: i === activeDay ? "8px" : "5px",
                borderRadius: "50%",
                background: i === activeDay ? "#D4AF37" : "rgba(255,255,255,0.20)",
                transition: "all 300ms ease",
              }} />
              <span style={{
                fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase",
                color: i === activeDay ? "rgba(212,175,55,0.90)" : "rgba(255,255,255,0.30)",
                transition: "color 300ms ease",
              }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* SVG Stress Horizon */}
        <div className={`ease-in d3 w-full${mounted ? " v" : ""}`}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: "block", touchAction: "none", cursor: "crosshair" }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(212,175,55,0.20)" />
                <stop offset="100%" stopColor="rgba(212,175,55,0.00)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Area fill */}
            <path d={areaPath} fill="url(#waveGrad)" />

            {/* Wave line */}
            <path
              d={wavePath}
              fill="none"
              stroke="rgba(212,175,55,0.60)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              filter="url(#glow)"
            />

            {/* Data points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={i === activeDay ? 5 : 3}
                fill={i === activeDay ? "#D4AF37" : "rgba(212,175,55,0.40)"}
                style={{ transition: "all 300ms ease" }}
              />
            ))}

            {/* Scrub line */}
            {scrubX !== null && (
              <line
                x1={scrubX}
                y1={0}
                x2={scrubX}
                y2={H}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Day labels vises over SVG */}
          </svg>
        </div>

        {/* Drag-hint */}
        <div style={{ textAlign:"center", fontSize:"11px", color:"rgba(255,255,255,0.20)", letterSpacing:"0.15em", marginTop:"8px", marginBottom:"4px" }}>
          ← Dra for å utforske uken →
        </div>

        {/* Pattern cards */}
        {data?.sufficient_data && data.patterns.length > 0 && (
          <div className={`ease-in d3 w-full px-5 mt-6 flex flex-col gap-4${mounted ? " v" : ""}`}>
            {data.patterns.map((p, i) => (
              <div key={p.code} className="munk-card text-left">
                <div style={{ fontSize: "11px", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(212,175,55,0.60)", marginBottom: "8px" }}>
                  {p.confidence === "high" ? "Tydelig mønster" : p.confidence === "medium" ? "Fremvoksende mønster" : "Svakt signal"} · {p.evidence_days} dager
                </div>
                <div style={{ fontSize: "18px", fontWeight: 600, color: "white", marginBottom: "8px" }}>
                  {PATTERN_LABEL[p.code] ?? p.code}
                </div>
                {PATTERN_MEANING[p.code] && (
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "12px", marginTop: "4px" }}>
                    {PATTERN_MEANING[p.code]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!data?.sufficient_data && data !== null && (
          <div className="munk-card mx-5 mt-6 text-center">
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.55)" }}>
              Munken trenger litt mer data før han kan se et tydelig mønster. Kom tilbake om noen dager.
            </p>
          </div>
        )}

        {data && data.sufficient_data && (
          <div className="mt-4 text-center" style={{ fontSize: "12px", color: "rgba(255,255,255,0.20)" }}>
            Basert på de siste {data.window_days} dagene
          </div>
        )}

      </div>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around items-center px-8"
        style={{
          height: "72px",
          background: "rgba(8,18,16,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          zIndex: 50,
        }}
      >
        {[
          { id: "idag",    label: "I dag",   href: "/check-in" },
          { id: "monster", label: "Mønster", href: "/monster"  },
          { id: "ro",      label: "Bibliotek", href: "/library"  },
        ].map(tab => {
          const isActive = tab.id === "monster";
          return (
            <button
              key={tab.id}
              onClick={() => { window.location.href = tab.href; }}
              className="flex flex-col items-center gap-1"
            >
              <div style={{
                width: "4px", height: "4px", borderRadius: "50%",
                background: isActive ? "#D4AF37" : "transparent",
                marginBottom: "2px",
              }} />
              <span style={{
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: isActive ? "#D4AF37" : "rgba(255,255,255,0.30)",
                fontWeight: isActive ? 500 : 400,
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
