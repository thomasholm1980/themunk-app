'use client'
import { useState, useEffect } from 'react'
import MunkDailyBriefRatnaV2 from '../components/MunkDailyBriefRatnaV2'
import { DEMO_CONTRACT } from '../../lib/mockData'

type Mode = "idle" | "ready"

export default function CheckInDemo() {
  const [mode, setMode] = useState<Mode>("idle")
  const [ratnaContract, setRatnaContract] = useState<any>(null)

  const osloHour = (() => {
    const parts = new Intl.DateTimeFormat("no", {
      timeZone: "Europe/Oslo", hour: "numeric", hour12: false
    }).formatToParts(new Date())
    return parseInt(parts.find(p => p.type === "hour")?.value ?? "12")
  })()

  const timeBlock = (() => {
    if (osloHour >= 12 && osloHour < 15) return {
      label: "MERIDIAN CHECK-IN",
      title: "Stoic pivot — midday",
      text: "Half the day is behind you. Your nervous system shows moderate load. Now is the time for one conscious choice: what do you release, and what do you carry forward?"
    }
    if (osloHour >= 20 && osloHour < 23) return {
      label: "EVENING REFLECTION",
      title: "The evening belongs to recovery",
      text: "Your body has done its work. An HRV of 52ms signals readiness for deep recovery. Release today's agenda. What was not done today was not meant for today."
    }
    return null
  })()

  function handleWake() {
    setRatnaContract({
      state: DEMO_CONTRACT.state,
      insight: DEMO_CONTRACT.insight,
      guidance: DEMO_CONTRACT.guidance,
      hrv: DEMO_CONTRACT.hrv_rmssd,
      rhr: DEMO_CONTRACT.resting_hr
    })
    setMode("ready")
  }

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long"
  })

  return (
    <main style={{
      minHeight: "100vh", width: "100%", position: "relative",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", overflow: "hidden",
      fontFamily: '"Crimson Pro", serif'
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "url('/images/munk-bg-leaf.jpg')",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.28, filter: "brightness(1.40) contrast(1.20) saturate(1.15)"
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "linear-gradient(180deg, rgba(10,28,22,0.52) 0%, rgba(8,18,16,0.60) 100%)"
      }} />
      <div style={{
        position: "fixed", top: "12px", left: "50%", transform: "translateX(-50%)",
        zIndex: 999, background: "rgba(212,175,55,0.15)",
        border: "1px solid rgba(212,175,55,0.30)", borderRadius: "20px",
        padding: "4px 14px", fontSize: "11px", color: "rgba(212,175,55,0.80)",
        letterSpacing: "0.08em", whiteSpace: "nowrap"
      }}>
        Munk Demo Mode – Simulated data for evaluation
      </div>

      {mode === "ready" && ratnaContract ? (
        <>
          {timeBlock && (
            <div style={{
              position: "fixed", bottom: "100px", left: "50%", transform: "translateX(-50%)",
              zIndex: 999, width: "90%", maxWidth: "360px",
              background: "rgba(10,28,22,0.92)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(212,175,55,0.25)", borderRadius: "16px",
              padding: "20px 24px"
            }}>
              <p style={{ color: "#D4AF37", fontSize: "10px", letterSpacing: "0.15em",
                textTransform: "uppercase", marginBottom: "8px" }}>{timeBlock.label}</p>
              <p style={{ color: "rgba(255,255,255,0.95)", fontSize: "17px",
                marginBottom: "10px" }}>{timeBlock.title}</p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px",
                lineHeight: 1.7 }}>{timeBlock.text}</p>
            </div>
          )}
          <MunkDailyBriefRatnaV2
            contract={ratnaContract}
            dateLabel={today}
            onRendered={() => {}}
          />
        </>
      ) : (
        <div style={{
          position: "relative", zIndex: 10, display: "flex", flexDirection: "column",
          alignItems: "center", gap: "24px", textAlign: "center", padding: "0 24px"
        }}>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: "140px", height: "140px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
              filter: "blur(30px)", transform: "translate(-50%, -50%)"
            }} />
            <img src="/assets/munk-transparent.png" alt="The Munk"
              style={{ width: "180px", position: "relative", zIndex: 1 }} />
          </div>
          <h1 style={{ fontSize: "26px", color: "rgba(255,255,255,0.95)",
            fontWeight: 400, margin: 0 }}>
            The Munk is ready
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", margin: 0 }}>
            Tap to see your stress level.
          </p>
          <button onClick={handleWake} style={{
            background: "none", border: "1px solid rgba(255,255,255,0.20)",
            borderRadius: "24px", color: "rgba(255,255,255,0.80)",
            fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "14px 32px", cursor: "pointer", marginTop: "8px"
          }}>
            Meet the Munk
          </button>
        </div>
      )}
    </main>
  )
}
