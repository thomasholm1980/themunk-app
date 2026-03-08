// apps/web/app/components/hero/HeroMunk.tsx
// Phase 6 — Hero Munk Integration v4
// Transparent asset + CSS mist/cloud layer
// Chest light = regulation state proxy. Not HRV. Not energy score.

import Image from 'next/image'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null

interface HeroMunkProps {
  state: RegulationState
}

const PRESETS = {
  GREEN:   { opacity: 1,    glowColor: 'rgba(255, 200, 100, 0.75)', glowSize: '72px' },
  YELLOW:  { opacity: 0.88, glowColor: 'rgba(255, 180, 80, 0.50)',  glowSize: '52px' },
  RED:     { opacity: 0.75, glowColor: 'rgba(255, 160, 60, 0.35)',  glowSize: '36px' },
  NEUTRAL: { opacity: 0.82, glowColor: 'rgba(255, 180, 80, 0.42)',  glowSize: '44px' },
} as const

export function HeroMunk({ state }: HeroMunkProps) {
  const key = state === 'GREEN' || state === 'YELLOW' || state === 'RED' ? state : 'NEUTRAL'
  const preset = PRESETS[key]

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(260px, 34vh, 420px)' }}
      role="img"
      aria-label="Munk regulation presence"
    >
      {/* CSS mist — ground cloud base under the Munk */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '0%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120%',
          height: '50%',
          background: 'radial-gradient(ellipse 90% 60% at 50% 90%, rgba(200, 190, 175, 0.55) 0%, rgba(180, 170, 155, 0.2) 50%, transparent 75%)',
          filter: 'blur(22px)',
        }}
      />

      {/* Munk — transparent PNG */}
      <Image
        src="/assets/munk-transparent.png"
        alt="The Munk"
        fill
        priority
        className="object-contain"
        style={{ opacity: preset.opacity, transition: 'opacity 1.2s ease-in-out' }}
      />

      {/* Chest glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '45%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: preset.glowSize, height: preset.glowSize,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${preset.glowColor} 0%, transparent 70%)`,
          filter: 'blur(8px)',
          transition: 'all 1.2s ease-in-out',
        }}
      />

      {/* Bottom fade — blends into dark page */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: '30%', background: 'linear-gradient(to bottom, transparent, #18181b)' }}
      />
    </div>
  )
}
