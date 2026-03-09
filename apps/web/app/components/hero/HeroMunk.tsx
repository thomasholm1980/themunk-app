'use client'

/**
 * HeroMunk — Phase 21.5: Monk Arrival Intro
 *
 * Intro sequence (~1.4s total):
 *   0ms    — Monk hidden
 *   0ms    — fade-in starts (600ms)
 *   400ms  — glow expands
 *   1000ms — glow settles into breathing loop
 *   1400ms — onIdleReached() → Forecast becomes visible
 *
 * After intro: state-driven breathing + glow loop (Phase 16).
 */

import Image from 'next/image'
import { useEffect, useState } from 'react'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null
type IntroStep = 'hidden' | 'arriving' | 'settling' | 'idle'

interface HeroMunkProps {
  state: RegulationState
  isReading?: boolean
  forecastReady?: boolean
  dominantPattern?: string | null
  onIdleReached?: () => void
}

const STATE_CONFIG: Record<string, {
  breathDuration: number
  glowScale:      number
  glowOpacity:    number
  haloOpacity:    number
}> = {
  GREEN:  { breathDuration: 8, glowScale: 1.35, glowOpacity: 0.82, haloOpacity: 0.18 },
  YELLOW: { breathDuration: 6, glowScale: 1.55, glowOpacity: 0.90, haloOpacity: 0.26 },
  RED:    { breathDuration: 4, glowScale: 1.75, glowOpacity: 0.95, haloOpacity: 0.34 },
  idle:   { breathDuration: 8, glowScale: 1.25, glowOpacity: 0.75, haloOpacity: 0.14 },
}

const GLOW_COLOR: Record<string, { core: string; halo: string }> = {
  GREEN:  { core: 'rgba(255,240,140,1.0), rgba(255,200,40,1.0) 45%, rgba(180,255,140,0.4) 75%', halo: 'rgba(120,220,100,0.5)'  },
  YELLOW: { core: 'rgba(255,240,140,1.0), rgba(255,200,40,1.0) 45%, rgba(255,140,0,0.5) 75%',   halo: 'rgba(255,180,20,0.55)' },
  RED:    { core: 'rgba(255,220,140,1.0), rgba(255,140,80,1.0) 45%, rgba(220,60,40,0.5) 75%',   halo: 'rgba(220,80,60,0.45)'  },
  idle:   { core: 'rgba(255,240,140,1.0), rgba(255,200,40,1.0) 45%, rgba(255,140,0,0.5) 75%',   halo: 'rgba(255,180,20,0.40)' },
}

export function HeroMunk({ state, onIdleReached }: HeroMunkProps) {
  const [intro, setIntro] = useState<IntroStep>('hidden')

  useEffect(() => {
    const t1 = setTimeout(() => setIntro('arriving'),  0)
    const t2 = setTimeout(() => setIntro('settling'),  400)
    const t3 = setTimeout(() => {
      setIntro('idle')
      onIdleReached?.()
    }, 1400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const key    = state ?? 'idle'
  const config = STATE_CONFIG[key]
  const colors = GLOW_COLOR[key]

  const breathDur = config.breathDuration
  const inhaleP   = 35
  const holdP     = 50

  const animName = `breathe_${key}`
  const glowName = `glow_${key}`
  const haloName = `halo_${key}`

  const inIntro     = intro !== 'idle'
  const munkOpacity = intro === 'hidden' ? 0 : 1
  const glowOpacity = intro === 'hidden' ? 0 : intro === 'arriving' ? 0.4 : config.glowOpacity
  const introScale  =
    intro === 'hidden'   ? 0.1 :
    intro === 'arriving' ? 0.5 :
    intro === 'settling' ? 1.4 :
    null

  return (
    <>
      <style>{`
        @keyframes ${animName} {
          0%          { transform: scale(1.000); }
          ${inhaleP}% { transform: scale(1.018); }
          ${holdP}%   { transform: scale(1.018); }
          100%        { transform: scale(1.000); }
        }
        @keyframes ${glowName} {
          0% {
            transform: translate(-50%, -50%) scale(1.0);
            opacity: ${config.glowOpacity * 0.72};
            filter: blur(6px);
          }
          ${inhaleP}% {
            transform: translate(-50%, -50%) scale(${config.glowScale});
            opacity: ${config.glowOpacity};
            filter: blur(8px);
          }
          ${holdP}% {
            transform: translate(-50%, -50%) scale(${config.glowScale});
            opacity: ${config.glowOpacity};
            filter: blur(8px);
          }
          100% {
            transform: translate(-50%, -50%) scale(1.0);
            opacity: ${config.glowOpacity * 0.72};
            filter: blur(6px);
          }
        }
        @keyframes ${haloName} {
          0%, 100% { opacity: ${config.haloOpacity * 0.6}; transform: translate(-50%, -50%) scale(1.0);  }
          ${holdP}% { opacity: ${config.haloOpacity};      transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes munkFloat {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-3px); }
        }
      `}</style>

      <div
        className="relative w-full flex justify-center"
        style={{ height: 'clamp(280px, 38vh, 420px)' }}
        role="img"
        aria-label="Munk regulation presence"
      >
        {/* Ambient halo */}
        <div className="absolute pointer-events-none" style={{
          top: '38%', left: '50%',
          width: '220px', height: '220px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.halo} 0%, transparent 75%)`,
          filter: 'blur(28px)',
          opacity: munkOpacity,
          animation: inIntro ? 'none' : `${haloName} ${breathDur}s ease-in-out infinite`,
          transition: 'opacity 600ms ease-out',
        }} />

        {/* Monk image */}
        <div style={{
          width: '90%', maxWidth: '580px', height: '100%', position: 'relative',
          opacity: munkOpacity,
          transition: 'opacity 600ms ease-out',
          animation: inIntro ? 'none' : `munkFloat 16s ease-in-out infinite, ${animName} ${breathDur}s ease-in-out infinite`,
        }}>
          <Image
            src="/assets/munk-hero-v7.png"
            alt="The Munk"
            fill priority
            className="object-contain object-bottom"
          />
        </div>

        {/* Chest glow */}
        <div className="absolute pointer-events-none" style={{
          top: '38%', left: '50%',
          width: '52px', height: '52px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.core}, transparent 95%)`,
          opacity: glowOpacity,
          transform: introScale !== null
            ? `translate(-50%, -50%) scale(${introScale})`
            : undefined,
          filter: 'blur(6px)',
          transition: 'opacity 600ms ease-out, transform 600ms ease-out',
          animation: inIntro ? 'none' : `${glowName} ${breathDur}s ease-in-out infinite`,
        }} />
      </div>
    </>
  )
}
