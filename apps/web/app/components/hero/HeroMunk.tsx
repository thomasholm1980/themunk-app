'use client'

/**
 * HeroMunk — Phase 16: Monk Presence Engine
 *
 * State-driven breathing + glow. No intro choreography.
 * Breathing model: inhale → hold → exhale, continuous loop.
 *
 * GREEN:  ~8s cycle, soft glow
 * YELLOW: ~6s cycle, medium glow
 * RED:    ~4s cycle, stronger glow
 */

import Image from 'next/image'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null

interface HeroMunkProps {
  state: RegulationState
  isReading?: boolean
  forecastReady?: boolean
  dominantPattern?: string | null
  onIdleReached?: () => void
}

// ─── State config ─────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<string, {
  breathDuration: number   // total cycle seconds
  glowScale: number        // peak chest glow scale
  glowOpacity: number      // peak glow opacity
  haloOpacity: number      // ambient halo opacity
}> = {
  GREEN:  { breathDuration: 8,  glowScale: 1.35, glowOpacity: 0.82, haloOpacity: 0.18 },
  YELLOW: { breathDuration: 6,  glowScale: 1.55, glowOpacity: 0.90, haloOpacity: 0.26 },
  RED:    { breathDuration: 4,  glowScale: 1.75, glowOpacity: 0.95, haloOpacity: 0.34 },
  idle:   { breathDuration: 8,  glowScale: 1.25, glowOpacity: 0.75, haloOpacity: 0.14 },
}

// ─── Glow colors per state ────────────────────────────────────────────────────

const GLOW_COLOR: Record<string, { core: string; halo: string }> = {
  GREEN:  { core: 'rgba(255,240,140,1.0), rgba(255,200,40,1.0) 45%, rgba(180,255,140,0.4) 75%', halo: 'rgba(120,220,100,0.5)' },
  YELLOW: { core: 'rgba(255,240,140,1.0), rgba(255,200,40,1.0) 45%, rgba(255,140,0,0.5) 75%',   halo: 'rgba(255,180,20,0.55)' },
  RED:    { core: 'rgba(255,220,140,1.0), rgba(255,140,80,1.0) 45%, rgba(220,60,40,0.5) 75%',   halo: 'rgba(220,80,60,0.45)'  },
  idle:   { core: 'rgba(255,240,140,1.0), rgba(255,200,40,1.0) 45%, rgba(255,140,0,0.5) 75%',   halo: 'rgba(255,180,20,0.40)' },
}

export function HeroMunk({ state, onIdleReached }: HeroMunkProps) {
  const key    = state ?? 'idle'
  const config = STATE_CONFIG[key]
  const colors = GLOW_COLOR[key]

  const breathDur  = config.breathDuration
  // inhale = 35%, hold = 15%, exhale = 50% of cycle
  const inhaleEnd  = Math.round(breathDur * 0.35 * 10) / 10
  const holdEnd    = Math.round(breathDur * 0.50 * 10) / 10

  const animName   = `breathe_${key}`
  const glowName   = `glow_${key}`
  const haloName   = `halo_${key}`

  // % values for keyframes
  const inhaleP = 35
  const holdP   = 50

  return (
    <>
      <style>{`
        /* Monk body breathing — scale only, no translate */
        @keyframes ${animName} {
          0%        { transform: scale(1.000); }
          ${inhaleP}% { transform: scale(1.018); }
          ${holdP}%   { transform: scale(1.018); }
          100%      { transform: scale(1.000); }
        }

        /* Chest glow pulse synced to breath */
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

        /* Ambient halo — slow, always slightly behind breath */
        @keyframes ${haloName} {
          0%, 100% { opacity: ${config.haloOpacity * 0.6}; transform: translate(-50%, -50%) scale(1.0); }
          ${holdP}% { opacity: ${config.haloOpacity};       transform: translate(-50%, -50%) scale(1.15); }
        }

        /* Slow float — state-independent */
        @keyframes munkFloat {
          0%, 100% { transform: translateY(0px); }
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
          animation: `${haloName} ${breathDur}s ease-in-out infinite`,
          transition: 'background 1000ms ease-in-out',
        }} />

        {/* Monk image */}
        <div style={{
          width: '90%', maxWidth: '580px', height: '100%', position: 'relative',
          animation: `munkFloat 16s ease-in-out infinite, ${animName} ${breathDur}s ease-in-out infinite`,
          transition: 'animation-duration 1000ms ease-in-out',
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
          animation: `${glowName} ${breathDur}s ease-in-out infinite`,
          transition: 'background 1000ms ease-in-out',
        }} />
      </div>
    </>
  )
}
