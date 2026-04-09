"use client";
import { useEffect, useState } from "react";
import { useAtmosphere } from "../../hooks/useAtmosphere";

type BreathPhase = "idle" | "inn" | "hold" | "ut";

const MUNKENS_TIPS = [
  "Slipp kjeven.",
  "Senk skuldrene.",
  "Se på horisonten.",
  "La hendene hvile tungt.",
  "Pust ut litt lenger enn du puster inn.",
];

const ARTIKLER = [
  { title: "Hva skjer i kroppen når du puster rolig?", tid: "3 min", url: "https://www.themunk.ai/library?tab=ro" },
  { title: "Vagusnerven: kroppens robryter", tid: "5 min", url: "https://www.themunk.ai/library?tab=ro" },
  { title: "Meditasjon for menn under press", tid: "4 min", url: "https://www.themunk.ai/library?tab=ro" },
];

export default function RoPage() {
  const atm = useAtmosphere();
  const [breathActive, setBreathActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [circleScale, setCircleScale] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!breathActive) { setPhase("idle"); setCircleScale(1); return; }
    let cancelled = false;
    async function run() {
      while (!cancelled) {
        setPhase("inn"); setCircleScale(1.6);
        await wait(4000);
        if (cancelled) break;
        setPhase("hold"); 
        await wait(2000);
        if (cancelled) break;
        setPhase("ut"); setCircleScale(1);
        await wait(4000);
        if (cancelled) break;
      }
    }
    run();
    return () => { cancelled = true; };
  }, [breathActive]);

  function wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }

  const phaseLabel: Record<BreathPhase, string> = {
    idle: "Trykk for å starte",
    inn: "Pust inn ...",
    hold: "Hold ...",
    ut: "Pust ut ...",
  };

  return (
    <div

      className="min-h-screen min-h-[100dvh] w-full relative overflow-hidden pb-28"
      style={{
        background: `linear-gradient(160deg, ${atm.gradientFrom} 0%, ${atm.gradientTo} 100%)`,
        transition: "background 3s ease-in-out",
        color: "#fff",
      }}
    >

      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/images/munk-bg-leaf-bright.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", opacity: 0.28, filter: "brightness(1.40) contrast(1.20) saturate(1.15)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,28,22,0.55) 0%, rgba(8,18,16,0.65) 100%)" }} />
      </div>
      <style>{`
        .fade-up { opacity: 0; transform: translateY(10px); animation: fuAnim 700ms cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes fuAnim { to { opacity:1; transform:translateY(0); } }
        .breath-circle { transition: transform 4s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <div className="w-full max-w-xl mx-auto px-5 pt-12 flex flex-col items-center gap-8">

        {/* Header */}
        <div className={`fade-up text-center`} style={{ animationDelay: "0ms" }}>
          <div className="text-[11px] tracking-[0.28em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.40)" }}>
            Verktøy
          </div>
          <div className="text-[28px] font-semibold text-white">Ro</div>
        </div>

        {/* Quick Breath Hero */}
        <div
          className={`fade-up w-full cursor-pointer`}
          style={{ animationDelay: "100ms", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "16px 20px", display: "flex", flexDirection: "row", alignItems: "center", gap: "16px" }}
          onClick={() => setBreathActive(b => !b)}
        >
          <div className="text-[11px] tracking-[0.28em] uppercase" style={{ display: "none" }}>
            Pusteøvelse
          </div>

          {/* SVG Breath Circle */}
          <div style={{ position: "relative", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              className="breath-circle"
              style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.05) 60%, transparent 100%)",
                border: "1px solid rgba(212,175,55,0.30)",
                transform: `scale(${circleScale})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)" }} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: "4px" }}>Pusteøvelse</div>
              <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.90)" }}>{phaseLabel[phase]}</div>
              {breathActive && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.30)", marginTop: "4px" }}>Trykk for å stoppe</div>}
            </div>


        </div>

        {/* Munkens tips */}
        <div className={`fade-up w-full`} style={{ animationDelay: "200ms" }}>
          <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "rgba(255,255,255,0.40)" }}>
            Munkens tips
          </div>
          <div className="flex flex-col gap-3">
            {MUNKENS_TIPS.map((tip, i) => (
              <div key={i} className="text-[17px] text-white" style={{ opacity: 0.85, lineHeight: 1.5 }}>
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* Artikler — horisontal scroll */}
        <div className={`fade-up w-full`} style={{ animationDelay: "300ms" }}>
          <div className="text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "rgba(255,255,255,0.40)" }}>
            Les mer
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {ARTIKLER.map((art, i) => (
              <div
                key={i}
                onClick={() => window.location.href = art.url}
                style={{
                  minWidth: "200px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "16px",
                  padding: "18px 16px",
                  flexShrink: 0,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position:"absolute", inset:"0 0 auto 0", height:"1px", background:"linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)" }} />
                <div style={{ fontSize:"10px", letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(255,255,255,0.30)", marginBottom:"8px" }}>Bibliotek →</div>
                <div style={{ fontSize:"14px", fontWeight:600, color:"rgba(255,255,255,0.90)", lineHeight:1.4, marginBottom:"8px" }}>
                  {art.title}
                </div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>{art.tid} lesetid</div>
              </div>
            ))}
          </div>
        </div>

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
        }}
      >
        {[
          { label: "I dag",   href: "/check-in" },
          { label: "Mønster", href: "/monster"  },
          { label: "Bibliotek", href: "/library", active: false },
        ].map(tab => (
          <button
            key={tab.label}
            onClick={() => window.location.href = tab.href}
            className="flex flex-col items-center"
          >
            <div style={{ width:"4px", height:"4px", background: tab.active ? "#D4AF37" : "transparent", borderRadius:"50%", marginBottom:"2px" }} />
            <span
              className="text-[11px] tracking-[0.18em] uppercase"
              style={{ color: tab.active ? "#D4AF37" : "rgba(255,255,255,0.30)", fontWeight: tab.active ? 500 : 400 }}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
