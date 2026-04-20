'use client'
import { useEffect, useState } from 'react'
import { DEMO_CONTRACT } from '../../lib/mockData'

type SystemState = "GREEN" | "YELLOW" | "RED"

const STATE_LABEL: Record<SystemState, string> = {
  GREEN:  "Well recovered",
  YELLOW: "Moderate stress",
  RED:    "High stress",
}

const NOW_TEXT: Record<SystemState, Record<string, string>> = {
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
}

const ACTION_TEXT: Record<SystemState, Record<string, string>> = {
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
    day:     "Lower the intensity. The body cannot handle more right now.",
    evening: "No screens, no demanding conversations. Only rest.",
  },
}

function getTimeBucket(): string {
  const hour = parseInt(
    new Intl.DateTimeFormat("en", {
      timeZone: "Europe/Oslo",
      hour: "numeric",
      hour12: false,
    }).format(new Date()), 10
  )
  if (hour >= 4 && hour < 11) return "morning"
  if (hour >= 11 && hour < 17) return "day"
  return "evening"
}

export default function CheckInDemo() {
  const [mode, setMode] = useState<"idle" | "ready">("idle")
  const [mounted, setMounted] = useState(false)
  const [timeBucket, setTimeBucket] = useState("morning")

  useEffect(() => {
    setTimeBucket(getTimeBucket())
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const state = DEMO_CONTRACT.state as SystemState
  const hrv = DEMO_CONTRACT.hrv_rmssd
  const rhr = DEMO_CONTRACT.resting_hr
  const insight = DEMO_CONTRACT.insight
  const guidance = DEMO_CONTRACT.guidance
  const nowText = NOW_TEXT[state][timeBucket]
  const actionText = ACTION_TEXT[state][timeBucket]

  const osloHour = (() => {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: "Europe/Oslo", hour: "numeric", hour12: false
    }).formatToParts(new Date())
    return parseInt(parts.find(p => p.type === "hour")?.value ?? "12")
  })()

  const timeBlock = (() => {
    if (osloHour >= 12 && osloHour < 15) return {
      label: "MERIDIAN CHECK-IN",
      title: "Stoic pivot — midday",
      text: "Half the day is behind you. Your nervous system shows moderate load. Now is the time for one conscious choice: what do you release, and what do you carry forward to the evening?"
    }
    if (osloHour >= 20 && osloHour < 23) return {
      label: "EVENING REFLECTION",
      title: "The evening belongs to recovery",
      text: "Your body has done its work. An HRV of 52ms signals readiness for deep recovery. Release today's agenda. What was not done today was not meant for today."
    }
    return null
  })()

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long"
  })

  return (
    <div style={{
      minHeight: "100vh", width: "100%", position: "relative",
      overflow: "hidden", fontFamily: '"Crimson Pro", serif',
      background: "linear-gradient(180deg, #0a1c16 0%, #081210 100%)"
    }}>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/images/munk-bg-leaf-bright.jpg')",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.28, filter: "brightness(1.40) contrast(1.20) saturate(1.15)"
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(10,28,22,0.75) 0%, rgba(8,18,16,0.82) 100%)"
        }} />
      </div>

      {/* Demo badge */}
      <div style={{
        position: "fixed", top: "12px", left: "50%", transform: "translateX(-50%)",
        zIndex: 999, background: "rgba(212,175,55,0.15)",
        border: "1px solid rgba(212,175,55,0.30)", borderRadius: "20px",
        padding: "4px 14px", fontSize: "11px", color: "rgba(212,175,55,0.80)",
        letterSpacing: "0.08em", whiteSpace: "nowrap"
      }}>
        Munk Demo Mode – Simulated data for evaluation
      </div>

      {/* Content */}
      <div style={{
        width: "100%", display: "flex", alignItems: "flex-start",
        justifyContent: "center", paddingBottom: "96px", minHeight: "100vh"
      }}>
        <div style={{
          width: "100%", maxWidth: "560px", display: "flex",
          flexDirection: "column", alignItems: "center",
          textAlign: "center", padding: "0 20px"
        }}>

          {/* Date */}
          <div style={{
            fontSize: "11px", letterSpacing: "0.28em", textTransform: "uppercase",
            color: "#ffffff", paddingTop: "52px", marginBottom: "8px"
          }}>
            {today}
          </div>

          {/* Munk figure */}
          <div style={{ position: "relative", marginBottom: "4px", marginTop: "-4vh" }}>
            <div style={{
              position: "absolute", top: "42%", left: "50%",
              width: "70px", height: "70px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,160,50,0.85) 0%, rgba(255,100,20,0.4) 40%, transparent 70%)",
              transform: "translate(-50%, -50%)", pointerEvents: "none"
            }} />
            <img src="/assets/munk-transparent.png" alt="The Munk"
              style={{ width: "160px", position: "relative", zIndex: 1 }} />
          </div>

          {mode === "idle" ? (
            <>
              <div style={{
                backgroundColor: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "20px",
                padding: "32px 36px",
                marginTop: "8px",
                width: "100%"
              }}>
                <h1 style={{
                  fontSize: "34px", color: "#FFFFFF", fontWeight: 800,
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  margin: "0 0 12px"
                }}>
                  The Munk is ready
                </h1>
                <p style={{ fontSize: "17px", color: "rgba(255,255,255,1)", margin: "0 0 28px", fontWeight: 400 }}>
                  Tap to see your stress level.
                </p>
                <button onClick={() => setMode("ready")} style={{
                  background: "rgba(6,20,10,0.95)", border: "2px solid #D4AF37",
                  borderRadius: "16px", color: "#D4AF37",
                  fontSize: "14px", letterSpacing: "0.15em", textTransform: "uppercase",
                  padding: "18px 48px", cursor: "pointer", fontWeight: 700,
                  display: "block", margin: "0 auto",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.8)"
                }}>
                  MEET THE MUNK
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Stress level */}
              <div style={{ marginTop: "12px", marginBottom: "4px" }}>
                <div style={{
                  fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                  color: "rgba(212,175,55,0.40)", marginBottom: "8px", fontWeight: 600
                }}>
                  Stress level
                </div>
                <div style={{
                  fontSize: "34px", lineHeight: 1.15, fontWeight: 500,
                  color: "rgba(255,255,255,0.95)",
                  fontFamily: "var(--font-crimson), ui-serif, Georgia, serif"
                }}>
                  {STATE_LABEL[state]}
                </div>
              </div>

              {/* HRV + RHR */}
              <div style={{
                display: "flex", justifyContent: "center", gap: "48px",
                marginTop: "12px", marginBottom: "4px", opacity: 0.85
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{
                    fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.3em",
                    color: "rgba(212,175,55,0.55)", marginBottom: "4px"
                  }}>HRV (Oura)</span>
                  <span style={{
                    fontSize: "20px", fontWeight: 500, fontStyle: "italic",
                    color: "rgba(255,255,255,0.90)",
                    fontFamily: "var(--font-crimson), ui-serif, Georgia, serif"
                  }}>{hrv} ms</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{
                    fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.3em",
                    color: "rgba(212,175,55,0.55)", marginBottom: "4px"
                  }}>Resting HR (Oura)</span>
                  <span style={{
                    fontSize: "20px", fontWeight: 500, fontStyle: "italic",
                    color: "rgba(255,255,255,0.90)",
                    fontFamily: "var(--font-crimson), ui-serif, Georgia, serif"
                  }}>{rhr} bpm</span>
                </div>
              </div>

              {/* Insight card */}
              <div style={{
                marginTop: "20px", width: "100%",
                background: "rgba(255,255,255,0.06)", backdropFilter: "blur(30px)",
                border: "1px solid rgba(255,255,255,0.10)", borderRadius: "28px",
                padding: "22px 24px", position: "relative", overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute", inset: "0 0 auto 0", height: "1px",
                  background: "linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)"
                }} />
                <div style={{
                  fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.40)", marginBottom: "12px", fontWeight: 600
                }}>
                  Body signals
                </div>
                <div style={{
                  fontSize: "16px", color: "rgba(255,255,255,0.85)", lineHeight: 1.7,
                  marginBottom: "16px"
                }}>
                  {nowText}
                </div>

                <button style={{
                  width: "100%", marginBottom: "20px", borderRadius: "16px",
                  fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3em",
                  fontWeight: 600, padding: "14px",
                  background: "rgba(212,175,55,0.90)", color: "#0d1a15",
                  cursor: "pointer", border: "none"
                }}>
                  Ask The Munk about your signals →
                </button>

                <div style={{
                  width: "100%", height: "1px", marginBottom: "12px",
                  background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)"
                }} />
                <div style={{
                  fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                  color: "rgba(212,175,55,0.50)", marginBottom: "8px", fontWeight: 600
                }}>
                  Do now
                </div>
                <div style={{
                  fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.95)"
                }}>
                  {actionText}
                </div>
              </div>

              {/* Stoic insight */}
              {insight && (
                <div style={{
                  marginTop: "16px", width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px",
                  padding: "18px 22px"
                }}>
                  <div style={{
                    fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                    color: "rgba(212,175,55,0.40)", marginBottom: "10px", fontWeight: 600
                  }}>
                    The Munk's reading
                  </div>
                  <div style={{
                    fontSize: "15px", color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.75, fontStyle: "italic"
                  }}>
                    {insight}
                  </div>
                </div>
              )}

              {/* Guidance */}
              <div style={{
                marginTop: "16px", width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px",
                padding: "18px 22px"
              }}>
                <div style={{
                  fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase",
                  color: "rgba(212,175,55,0.40)", marginBottom: "10px", fontWeight: 600
                }}>
                  Today's guidance
                </div>
                <div style={{
                  fontSize: "15px", color: "rgba(255,255,255,0.75)", lineHeight: 1.75
                }}>
                  {guidance}
                </div>
              </div>

              {/* Time block */}
              {timeBlock && (
                <div style={{
                  marginTop: "16px", width: "100%",
                  background: "rgba(212,175,55,0.06)",
                  border: "1px solid rgba(212,175,55,0.20)", borderRadius: "20px",
                  padding: "18px 22px"
                }}>
                  <div style={{
                    fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
                    color: "#D4AF37", marginBottom: "8px"
                  }}>
                    {timeBlock.label}
                  </div>
                  <div style={{
                    fontSize: "17px", color: "rgba(255,255,255,0.95)", marginBottom: "10px"
                  }}>
                    {timeBlock.title}
                  </div>
                  <div style={{
                    fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.7
                  }}>
                    {timeBlock.text}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        display: "flex", justifyContent: "space-around", alignItems: "center",
        height: "72px", padding: "0 32px",
        background: "rgba(8,18,16,0.85)", backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)"
      }}>
        {[
          { label: "Today",   href: "/demo"    },
          { label: "Pattern", href: "/monster" },
          { label: "Library", href: "/library" },
        ].map(tab => (
          <button key={tab.label} onClick={() => window.location.href = tab.href}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase",
              color: tab.href === "/demo" ? "#D4AF37" : "rgba(255,255,255,0.30)",
              fontWeight: tab.href === "/demo" ? 500 : 400
            }}>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
