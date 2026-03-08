// apps/web/app/components/hero/HeroMunk.tsx
// Phase 6 — Hero Munk Integration v1
// Presentation layer only.
// Chest light = regulation state proxy. Not HRV. Not energy score.

import Image from 'next/image'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null

interface HeroMunkProps {
  state: RegulationState
}

const PRESETS = {
  GREEN: {
    opacity: 1,
    glowColor: 'rgba(255, 200, 100, 0.75)',
    glowSize: '72px',
  },
  YELLOW: {
    opacity: 0.88,
    glowColor: 'rgba(255, 180, 80, 0.50)',
    glowSize: '52px',
  },
  RED: {
    opacity: 0.75,
    glowColor: 'rgba(255, 160, 60, 0.35)',
    glowSize: '36px',
  },
  NEUTRAL: {
    opacity: 0.82,
    glowColor: 'rgba(255, 180, 80, 0.42)',
    glowSize: '44px',
  },
} as const

export function HeroMunk({ state }: HeroMunkProps) {
  const key = state === 'GREEN' || state === 'YELLOW' || state === 'RED'
    ? state
    : 'NEUTRAL'

  const preset = PRESETS[key]

  return (
    <div
      className="relative flex items-center justify-center w-full"
      style={{ height: 'clamp(220px, 28vh, 320px)' }}
      role="img"
      aria-label="Munk regulation presence"
    >
      <Image
        src="/assets/munk-base.png"
        alt="The Munk"
        fill
        priority
        className="object-contain"
        style={{ opacity: preset.opacity, transition: 'opacity 1.2s ease-in-out' }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: preset.glowSize,
          height: preset.glowSize,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${preset.glowColor} 0%, transparent 70%)`,
          filter: 'blur(8px)',
          transition: 'all 1.2s ease-in-out',
        }}
      />
    </div>
  )
}
