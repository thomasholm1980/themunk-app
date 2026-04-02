"use client";
import { useEffect, useState } from "react";
import MunkDailyBriefRatnaV2 from "../components/MunkDailyBriefRatnaV2";
import type { RatnaContract } from "../components/MunkDailyBriefRatnaV2";
import { logMorningEvent } from "../../lib/telemetry";
import { useAtmosphere } from "../../hooks/useAtmosphere";

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
  const parts = new Intl.DateTimeFormat("no-NO", { timeZone: "Europe/Oslo", hour: "numeric", hour12: false }).formatToParts(new Date());
  const h = parseInt(parts.find(p => p.type === "hour")?.value ?? "0", 10);
  if (h >= 4 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "day";
  return "evening";
}

function getOsloDateLabel(): string {
  return new Intl.DateTimeFormat("no-NO", {
    timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "long",
  }).format(new Date());
}

const LOADING_MESSAGES = [
  "Munken lytter til hjertet ditt...",
  "Samler dagens signaler...",
  "Finn roen et øyeblikk...",
];

function AtmosphereOrbs() {
  return (
    <>
      <svg aria-hidden="true" style={{ position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.025,pointerEvents:"none",zIndex:0 }}>
        <filter id="munk-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#munk-noise)" />
      </svg>
      <div className="munk-orb-drift-1" style={{ position:"absolute",top:"5%",left:"10%",width:"200px",height:"200px",borderRadius:"50%",background:"radial-gradient(circle, rgba(212,175,55,0.025) 0%, transparent 70%)",filter:"blur(80px)",pointerEvents:"none",zIndex:0 }} />
      <div className="munk-orb-drift-2" style={{ position:"absolute",top:"50%",left:"60%",width:"220px",height:"220px",borderRadius:"50%",background:"radial-gradient(circle, rgba(30,80,40,0.04) 0%, transparent 70%)",filter:"blur(80px)",pointerEvents:"none",zIndex:0 }} />
      <div className="munk-orb-drift-3" style={{ position:"absolute",top:"70%",left:"20%",width:"180px",height:"180px",borderRadius:"50%",background:"radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)",filter:"blur(100px)",pointerEvents:"none",zIndex:0 }} />
    </>
  );
}

function WaitingState({ onWake, mode }: { onWake: () => void; mode: Mode }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const [showStoreFallback, setShowStoreFallback] = useState(false);
  const [hasOpenedOura, setHasOpenedOura] = useState(false);
  const timeBucket = getTimeBucket();
  const atm = useAtmosphere();

  useEffect(() => {
    if (mode !== "loading") return;
    const interval = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => { setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length); setMsgVisible(true); }, 600);
    }, 4000);
    return () => clearInterval(interval);
  }, [mode]);

  function openOura() {
    setShowStoreFallback(false); setHasOpenedOura(true);
    window.location.href = "oura://";
    const start = Date.now();
    const timer = setTimeout(() => { if (Date.now() - start < 3000) setShowStoreFallback(true); }, 2500);
    const onBlur = () => { clearTimeout(timer); window.removeEventListener("blur", onBlur); };
    window.addEventListener("blur", onBlur);
  }

  const ghostButton: React.CSSProperties = {
    padding:"16px 40px", borderRadius:"100px",
    background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)",
    color:"rgba(255,255,255,0.90)", fontSize:"15px", letterSpacing:"0.06em",
    cursor:"pointer", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
  };

  return (
    <main className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-8 text-center relative overflow-hidden"
      style={{ background:`linear-gradient(160deg, ${atm.gradientFrom} 0%, ${atm.gradientTo} 100%)`, transition:"background 3s ease-in-out" }}>
      <AtmosphereOrbs />
      <style>{`
        @keyframes heartGlow {
          0%,100%{opacity:0.30;transform:translate(-50%,-50%) scale(0.90);filter:blur(30px);}
          50%{opacity:0.75;transform:translate(-50%,-50%) scale(1.06);filter:blur(42px);}
        }
        @keyframes munkFloat { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-7px);} }
        .msg-visible{opacity:1;transform:translateY(0);transition:opacity 600ms ease,transform 600ms ease;}
        .msg-hidden{opacity:0;transform:translateY(5px);transition:opacity 600ms ease,transform 600ms ease;}
        .fade-in{opacity:0;transform:translateY(10px);animation:fadeUp 900ms cubic-bezier(.22,1,.36,1) forwards;}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0);}}
      `}</style>

      <div className="fade-in relative flex items-center justify-center mb-10" style={{ animationDelay:"0ms",width:"240px",height:"260px",zIndex:1 }}>
        <div style={{ position:"absolute",top:"40%",left:"50%",width:"110px",height:"110px",marginLeft:"-55px",marginTop:"-55px",transform:"none",borderRadius:"50%",
          background:"radial-gradient(circle, #D4AF37 0%, transparent 70%)",
          animation:mode==="loading"?"heartGlow 6s ease-in-out infinite":"none",
          pointerEvents:"none",zIndex:0 }} />
        <img src="/assets/munk-transparent.png" alt="Munk"
          style={{ width:"220px",position:"relative",zIndex:1,animation:"munkFloat 6s ease-in-out infinite" }}
          className="select-none" draggable={false} />
      </div>

      <div className="flex flex-col items-center gap-5" style={{ minHeight:"140px",position:"relative",zIndex:1 }}>
        {mode === "loading" && (
          <div className="flex flex-col items-center gap-3">
            <p className={msgVisible?"msg-visible":"msg-hidden"} style={{ fontSize:"20px",color:"rgba(255,255,255,0.90)",lineHeight:1.4,maxWidth:"280px" }}>
              {LOADING_MESSAGES[msgIndex]}
            </p>
            <p style={{ fontSize:"11px",letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(212,175,55,0.55)" }}>
              Synkroniserer med Oura
            </p>
          </div>
        )}
        {mode === "idle" && (
          <div className="fade-in flex flex-col items-center gap-4" style={{ animationDelay:"200ms" }}>
            <p className="munk-heading" style={{ fontSize:"30px",lineHeight:1.2 }}>
              {timeBucket==="morning"?"God morgen":timeBucket==="day"?"Munken er våken":"Munken roer ned"}
            </p>
            <p style={{ fontSize:"16px",color:"rgba(255,255,255,0.45)" }}>Trykk for å se dagens stressnivå.</p>
            <button onClick={onWake} style={ghostButton}>
              {timeBucket==="morning"?"Vekk munken":"Møt munken"}
            </button>
          </div>
        )}
        {mode === "no_data" && (
          <div className="fade-in flex flex-col items-center gap-4" style={{ animationDelay:"0ms" }}>
            <p style={{ fontSize:"22px",color:"rgba(255,255,255,0.90)",lineHeight:1.35,maxWidth:"280px" }}>
              Munken venter på kroppens signaler
            </p>
            <p style={{ fontSize:"15px",color:"rgba(255,255,255,0.50)",maxWidth:"260px",lineHeight:1.65 }}>
              Åpne Oura-appen for å bekrefte at ringen din har synkronisert dagens data.
            </p>
            <button onClick={openOura} style={{ ...ghostButton,marginTop:"8px",color:"#D4AF37",borderColor:"rgba(212,175,55,0.30)" }}>
              Åpne Oura
            </button>
            {showStoreFallback && (
              <div className="fade-in flex flex-col items-center gap-2" style={{ marginTop:"24px" }}>
                <p style={{ fontSize:"12px",color:"rgba(255,255,255,0.25)",letterSpacing:"0.05em" }}>Ikke installert?</p>
                <div className="flex gap-5">
                  <a href="https://apps.apple.com/app/oura/id1043837948" target="_blank" rel="noopener" style={{ fontSize:"13px",color:"rgba(212,175,55,0.65)",textDecoration:"none" }}>App Store →</a>
                  <a href="https://play.google.com/store/apps/details?id=com.ouraring.oura" target="_blank" rel="noopener" style={{ fontSize:"13px",color:"rgba(212,175,55,0.65)",textDecoration:"none" }}>Google Play →</a>
                </div>
              </div>
            )}
            {hasOpenedOura && (
              <button onClick={onWake} style={{ marginTop:"28px",background:"none",border:"none",color:"rgba(255,255,255,0.30)",fontSize:"13px",letterSpacing:"0.08em",cursor:"pointer",padding:"8px" }}>
                Prøv igjen →
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function ReadyBanner({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 5000); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div className="fixed top-4 left-0 right-0 flex justify-center z-50 px-4">
      <div className="bg-white/10 backdrop-blur text-white text-sm px-5 py-3 rounded-full">Dagens stress er klar</div>
    </div>
  );
}

export default function CheckInPage() {
  const [mode, setMode] = useState<Mode>("idle");
  const [ratnaContract, setRatnaContract] = useState<RatnaContract | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    setDateLabel(getOsloDateLabel());
    if (sessionStorage.getItem("munk_awake") === "true") { setMode("loading"); runFetch(); }
  }, []);

  async function runFetch() {
    try {
      const res = await fetch("/api/state/today", { headers: { "x-user-id": USER_ID } });
      if (res.ok) {
        const json: StateResponse = await res.json();
        if (json.contract && json.state) {
          let context_line: string | null = null;
          let context_pattern: string | null = null;
          try {
            const pr = await fetch("/api/patterns/today");
            if (pr.ok) {
              const pj = await pr.json();
              if (pj.sufficient_data && pj.patterns?.length > 0) {
                context_pattern = pj.patterns[0]?.code ?? null;
                const { resolvePatternExpression } = await import("@themunk/core/state/pattern-expression-v1");
                const expr = resolvePatternExpression(pj.patterns, pj.sufficient_data);
                if (expr.show_context_line) context_line = expr.context_line;
              }
            }
          } catch {}
          setRatnaContract({ state:json.contract.state, insight:json.contract.forecast?.headline??json.contract.morningInsight?.message??null, guidance:json.contract.guidance.line, context_line, context_pattern });
          setMode("ready"); return;
        }
      }
    } catch {}
    setMode("idle"); sessionStorage.removeItem("munk_awake");
  }

  function handleWake() {
    if (mode === "loading") return;
    setMode("loading");
    async function run() {
      try {
        const res = await fetch("/api/state/today", { headers: { "x-user-id": USER_ID } });
        if (res.ok) {
          const json: StateResponse = await res.json();
          if (json.contract && json.state) {
            logMorningEvent('wake_monk_state_found', { state:json.state, day_key:json.day_key });
            let context_line: string | null = null;
            let context_pattern: string | null = null;
            try {
              const pr = await fetch("/api/patterns/today");
              if (pr.ok) {
                const pj = await pr.json();
                if (pj.sufficient_data && pj.patterns?.length > 0) {
                  context_pattern = pj.patterns[0]?.code ?? null;
                  const { resolvePatternExpression } = await import("@themunk/core/state/pattern-expression-v1");
                  const expr = resolvePatternExpression(pj.patterns, pj.sufficient_data);
                  if (expr.show_context_line) context_line = expr.context_line;
                }
              }
            } catch {}
            setRatnaContract({ state:json.contract.state, insight:json.contract.forecast?.headline??json.contract.morningInsight?.message??null, guidance:json.contract.guidance.line, context_line, context_pattern });
            sessionStorage.setItem("munk_awake","true"); setMode("ready"); return;
          }
        }
      } catch {}
      logMorningEvent('wake_monk_sync_started');
      try {
        const syncRes = await fetch("/api/wearables/oura/sync", { method:"POST" });
        if (syncRes.ok) {
          const sj = await syncRes.json();
          if (sj.status==="no_data"||sj.status==="sleep_incomplete") { setMode("no_data"); return; }
        }
      } catch {}
      const start = Date.now();
      const interval = setInterval(async () => {
        try {
          const res = await fetch("/api/state/today", { headers:{"x-user-id":USER_ID} });
          if (res.ok) {
            const json: StateResponse = await res.json();
            if (json.contract && json.state) {
              setRatnaContract({ state:json.contract.state, insight:json.contract.forecast?.headline??json.contract.morningInsight?.message??null, guidance:json.contract.guidance.line });
              sessionStorage.setItem("munk_awake","true"); setShowBanner(true); setMode("ready"); clearInterval(interval); return;
            }
          }
        } catch {}
        if (Date.now()-start>=WAKE_POLL_MAX_MS) { clearInterval(interval); setMode("no_data"); }
      }, WAKE_POLL_INTERVAL_MS);
    }
    run();
  }

  if (mode==="ready"&&ratnaContract) {
    return (
      <>
        {showBanner && <ReadyBanner onDismiss={()=>setShowBanner(false)} />}
        <MunkDailyBriefRatnaV2 contract={ratnaContract} dateLabel={dateLabel} onRendered={()=>logMorningEvent('brief_rendered')} />
      </>
    );
  }
  return <WaitingState onWake={handleWake} mode={mode} />;
}
