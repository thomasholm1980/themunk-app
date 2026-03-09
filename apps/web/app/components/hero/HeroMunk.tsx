'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null
type PatternCode =
  | 'PATTERN_SLEEP_INSTABILITY'
  | 'PATTERN_ACCUMULATING_STRAIN'
  | 'PATTERN_RECOVERY_DEBT'
  | 'PATTERN_FRAGMENTED_RECOVERY'
  | null

interface HeroMunkProps {
  state: RegulationState
  isReading?: boolean
  forecastReady?: boolean
  dominantPattern?: PatternCode
}

const PRESETS = {
  GREEN:   { opacity: 1.00, glowColor: 'rgba(255, 210, 80, 0.95)',  glowSize: '140px', glowColor2: 'rgba(255, 180, 40, 0.6)' },
  YELLOW:  { opacity: 0.95, glowColor: 'rgba(255, 190, 60, 0.85)',  glowSize: '120px', glowColor2: 'rgba(255, 160, 30, 0.5)' },
  RED:     { opacity: 0.90, glowColor: 'rgba(255, 140, 40, 0.75)',  glowSize: '100px', glowColor2: 'rgba(255, 100, 20, 0.4)' },
  NEUTRAL: { opacity: 0.95, glowColor: 'rgba(255, 200, 70, 0.90)',  glowSize: '120px', glowColor2: 'rgba(255, 170, 40, 0.55)' },
} as const

export function HeroMunk({ state, isReading = false, forecastReady = false, dominantPattern = null }: HeroMunkProps) {
  const key = state === 'GREEN' || state === 'YELLOW' || state === 'RED' ? state : 'NEUTRAL'
  const preset = PRESETS[key]

  const [acknowledging, setAcknowledging] = useState(false)
  useEffect(() => {
    if (!forecastReady) return
    const t1 = setTimeout(() => setAcknowledging(true), 200)
    const t2 = setTimeout(() => setAcknowledging(false), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [forecastReady])

  const breathCycle = isReading ? '9s' : '12s'
  const breathPeak = acknowledging ? 1.025 : 1.015
  const glowPeak = acknowledging ? 1.15 : 1.00
  const glowMin = acknowledging ? 0.92 : 0.82
  const brightnessPeak = acknowledging ? 130 : 115
  const floatPx = isReading ? 1.4 : 2

  return (
    <>
      <style>{`
        @keyframes munkBreathe {
          0%   { transform: scale(1); }
          37%  { transform: scale(${breathPeak}); }
          46%  { transform: scale(${breathPeak}); }
          100% { transform: scale(1); }
        }
        @keyframes munkFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-${floatPx}px); }
        }
        @keyframes munkGlow {
          0%   { opacity: ${glowMin};  filter: blur(18px) brightness(100%); }
          37%  { opacity: ${glowPeak}; filter: blur(22px) brightness(${brightnessPeak}%); }
          46%  { opacity: ${glowPeak}; filter: blur(22px) brightness(${brightnessPeak}%); }
          100% { opacity: ${glowMin};  filter: blur(18px) brightness(100%); }
        }
        @keyframes munkGlowOuter {
          0%   { opacity: 0.4; transform: translate(-50%, -50%) scale(1.0); }
          37%  { opacity: 0.8; transform: translate(-50%, -50%) scale(1.12); }
          46%  { opacity: 0.8; transform: translate(-50%, -50%) scale(1.12); }
          100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.0); }
        }
      `}</style>

      <div
        className="relative w-full flex justify-center items-end"
        style={{ height: 'clamp(300px, 40vh, 480px)' }}
        role="img"
        aria-label="Munk regulation presence"
      >
        {/* Outer ambient glow — large halo */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '46%', left: '50%',
            width: '220px', height: '220px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${preset.glowColor2} 0%, transparent 70%)`,
            animation: `munkGlowOuter ${breathCycle} ease-in-out infinite`,
          }}
        />

        {/* Monk — floating + breathing */}
        <div
          style={{
            width: '95%',
            maxWidth: '660px',
            height: '100%',
            position: 'relative',
            animation: `munkFloat 13.5s ease-in-out infinite, munkBreathe ${breathCycle} ease-in-out infinite`,
          }}
        >
          <Image
            src="/assets/munk-hero-v7.png"
            alt="The Munk"
            fill
            priority
            className="object-contain"
            style={{ opacity: preset.opacity }}
          />
        </div>

        {/* Chest glow — inner core */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '47%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: preset.glowSize,
            height: preset.glowSize,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${preset.glowColor} 0%, transparent 65%)`,
            animation: `munkGlow ${breathCycle} ease-in-out infinite`,
          }}
        />
      </div>
    </>
  )
}
