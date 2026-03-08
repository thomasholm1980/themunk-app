// apps/web/app/components/hero/HeroMunk.tsx
// Phase 6 — Hero Munk Integration v6
// Transparent asset + CSS mist + chest glow breathing + mist drift
// Chest light = regulation state proxy. Not HRV. Not energy score.

import Image from 'next/image'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null

interface HeroMunkProps {
  state: RegulationState
}

const PRESETS = {
  GREEN:   { opacity: 1,    glowColor: 'rgba(255, 200, 100, 0.75)', glowSize: '72px', breathDuration: '8s' },
  YELLOW:  { opacity: 0.88, glowColor: 'rgba(255, 180, 80, 0.50)',  glowSize: '52px', breathDuration: '6s' },
  RED:     { opacity: 0.75, glowColor: 'rgba(255, 160, 60, 0.35)',  glowSize: '36px', breathDuration: '4s' },
  NEUTRAL: { opacity: 0.82, glowColor: 'rgba(255, 180, 80, 0.42)',  glowSize: '44px', breathDuration: '6s' },
} as const

export function HeroMunk({ state }: HeroMunkProps) {
  const key = state === 'GREEN' || state === 'YELLOW' || state === 'RED' ? state : 'NEUTRAL'
  const preset = PRESETS[key]

  return (
    <>
      <style>{`
        @keyframes munkGlowBreathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.85; }
          50%       { transform: translate(-50%, -50%) scale(1.03); opacity: 1; }
        }
        @keyframes munkMistDrift {
          0%, 100% { transform: translateX(-20%) translateX(0px); }
          50%       { transform: translateX(-20%) translateX(10px); }
        }
      `}</style>

      <div
        className="relative w-full overflow-hidden flex justify-center items-end"
        style={{ height: 'clamp(260px, 32vh, 420px)' }}
        role="img"
        aria-label="Munk regulation presence"
      >
        {/* CSS mist — ground cloud base */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-5%',
            left: '-20%',
            width: '140%',
            height: '55%',
            background: 'radial-gradient(ellipse 85% 55% at 50% 85%, rgba(210, 200, 185, 0.55) 0%, rgba(200, 190, 175, 0.2) 50%, transparent 72%)',
            filter: 'blur(24px)',
            animation: 'munkMistDrift 20s linear infinite',
          }}
        />

        {/* Munk — transparent PNG, 70% width centered */}
        <div
          className="relative"
          style={{ width: '70%', maxWidth: '520px', height: '100%' }}
        >
          <Image
            src="/assets/munk-transparent.png"
            alt="The Munk"
            fill
            priority
            className="object-contain"
            style={{ opacity: preset.opacity, transition: 'opacity 1.2s ease-in-out' }}
          />
        </div>

        {/* Chest glow — breathing animation, state-mapped duration */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '45%', left: '50%',
            width: preset.glowSize, height: preset.glowSize,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${preset.glowColor} 0%, transparent 70%)`,
            filter: 'blur(8px)',
            animation: `munkGlowBreathe ${preset.breathDuration} ease-in-out infinite`,
          }}
        />
      </div>
    </>
  )
}
