// apps/web/app/components/hero/HeroMunk.tsx
// Phase 6 — Hero Munk Integration v3
// Presentation layer only.
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

const BG = '#e4e0d9'

export function HeroMunk({ state }: HeroMunkProps) {
  const key = state === 'GREEN' || state === 'YELLOW' || state === 'RED' ? state : 'NEUTRAL'
  const preset = PRESETS[key]

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(260px, 34vh, 420px)', background: BG }}
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
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: '30%', background: `linear-gradient(to bottom, ${BG}, transparent)` }} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: '40%', background: `linear-gradient(to top, ${BG}, transparent)` }} />
      {/* Left fade */}
      <div className="absolute inset-y-0 left-0 pointer-events-none"
        style={{ width: '20%', background: `linear-gradient(to right, ${BG}, transparent)` }} />
      {/* Right fade */}
      <div className="absolute inset-y-0 right-0 pointer-events-none"
        style={{ width: '20%', background: `linear-gradient(to left, ${BG}, transparent)` }} />
    </div>
  )
}
