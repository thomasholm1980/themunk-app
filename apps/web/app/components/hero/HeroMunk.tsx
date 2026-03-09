// apps/web/app/components/hero/HeroMunk.tsx
// Phase 14.5 — Monk Presence System v1
// Spec: Chief AI Architect (Manju) | Implementation: Aval

'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

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

// ---------------------------------------------------------------------------
// Presence presets per state
// ---------------------------------------------------------------------------
const PRESETS = {
  GREEN:   { opacityBase: 1.00,  glowColor: 'rgba(255, 200, 100, 0.75)', glowSize: '80px' },
  YELLOW:  { opacityBase: 0.88,  glowColor: 'rgba(255, 180, 80, 0.50)',  glowSize: '60px' },
  RED:     { opacityBase: 0.75,  glowColor: 'rgba(255, 160, 60, 0.35)',  glowSize: '44px' },
  NEUTRAL: { opacityBase: 0.82,  glowColor: 'rgba(255, 180, 80, 0.42)', glowSize: '52px' },
} as const

// ---------------------------------------------------------------------------
// Pattern modifiers — secondary to daily state
// ---------------------------------------------------------------------------
const PATTERN_MODIFIERS: Record<string, {
  breathScale: number   // multiplier on cycle duration (>1 = slower)
  glowDim: number       // subtracted from glow opacity peak (0–0.1)
  floatScale: number    // multiplier on float intensity (0–1)
}> = {
  PATTERN_ACCUMULATING_STRAIN: { breathScale: 1.15, glowDim: 0.08, floatScale: 0.6 },
  PATTERN_RECOVERY_DEBT:       { breathScale: 1.20, glowDim: 0.06, floatScale: 0.3 },
  PATTERN_SLEEP_INSTABILITY:   { breathScale: 1.05, glowDim: 0.02, floatScale: 1.0 },
  PATTERN_FRAGMENTED_RECOVERY: { breathScale: 1.08, glowDim: 0.04, floatScale: 1.0 },
}

export function HeroMunk({ state, isReading = false, forecastReady = false, dominantPattern = null }: HeroMunkProps) {
  const key = state === 'GREEN' || state === 'YELLOW' || state === 'RED' ? state : 'NEUTRAL'
  const preset = PRESETS[key]

  // Temporal smoothing — ramp intensity from 60% to 100% over 15s
  const [intensity, setIntensity] = useState(0.6)
  const intensityRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIntensity(0.6)
    intensityRef.current = setTimeout(() => setIntensity(1.0), 15000)
    return () => { if (intensityRef.current) clearTimeout(intensityRef.current) }
  }, [state])

  // Forecast acknowledgement state
  const [acknowledging, setAcknowledging] = useState(false)
  useEffect(() => {
    if (!forecastReady) return
    const t1 = setTimeout(() => setAcknowledging(true), 200)
    const t2 = setTimeout(() => setAcknowledging(false), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [forecastReady])

  // Pattern modifier
  const mod = dominantPattern ? (PATTERN_MODIFIERS[dominantPattern] ?? null) : null

  // Breathing parameters
  const baseCycle = isReading ? 9 : 12
  const breathCycle = mod ? baseCycle * mod.breathScale : baseCycle
  const breathScalePeak = acknowledging ? 1.020 : 1.015

  // Glow parameters
  const glowOpacityMin = 0.88 * intensity
  const glowOpacityMax = (acknowledging ? 1.10 : 1.00) * intensity - (mod?.glowDim ?? 0)
  const brightnessPeak = acknowledging ? 110 : 107

  // Float parameters
  const floatIntensity = isReading ? 0.7 : 1.0
  const floatMod = mod?.floatScale ?? 1.0
  const floatPx = 2 * floatIntensity * floatMod

  return (
    <>
      <style>{`
        @keyframes munkBreathe {
          0%   { transform: scale(1); }
          37%  { transform: scale(${breathScalePeak}); }
          45%  { transform: scale(${breathScalePeak}); }
          100% { transform: scale(1); }
        }

        @keyframes munkFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-${floatPx}px); }
        }

        @keyframes munkGlow {
          0%   { opacity: ${glowOpacityMin}; filter: blur(10px) brightness(100%); }
          37%  { opacity: ${glowOpacityMax}; filter: blur(10px) brightness(${brightnessPeak}%); }
          45%  { opacity: ${glowOpacityMax}; filter: blur(10px) brightness(${brightnessPeak}%); }
          100% { opacity: ${glowOpacityMin}; filter: blur(10px) brightness(100%); }
        }
      `}</style>

      <div
        className="relative w-full flex justify-center items-end"
        style={{ height: 'clamp(300px, 40vh, 480px)' }}
        role="img"
        aria-label="Munk regulation presence"
      >
        {/* Floating + breathing wrapper */}
        <div
          style={{
            width: '95%',
            maxWidth: '660px',
            height: '100%',
            position: 'relative',
            animation: `munkFloat ${13.5}s ease-in-out infinite, munkBreathe ${breathCycle}s ease-in-out infinite`,
            transition: 'opacity 1.2s ease-in-out',
          }}
        >
          <Image
            src="/assets/munk-hero-v7.png"
            alt="The Munk"
            fill
            priority
            className="object-contain"
            style={{
              opacity: preset.opacityBase * intensity,
              transition: 'opacity 1.2s ease-in-out',
            }}
          />
        </div>

        {/* Chest glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '48%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: preset.glowSize,
            height: preset.glowSize,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${preset.glowColor} 0%, transparent 70%)`,
            animation: `munkGlow ${breathCycle}s ease-in-out infinite`,
          }}
        />
      </div>
    </>
  )
}
