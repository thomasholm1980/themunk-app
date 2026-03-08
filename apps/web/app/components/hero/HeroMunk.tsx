// apps/web/app/components/hero/HeroMunk.tsx
// Phase 6 — Hero Munk Integration v8
// Taller hero, monk lower, stronger mist coverage

import Image from 'next/image'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null

interface HeroMunkProps {
  state: RegulationState
}

const PRESETS = {
  GREEN:   { opacity: 1,    glowColor: 'rgba(255, 200, 100, 0.75)', glowSize: '80px', breathDuration: '8s' },
  YELLOW:  { opacity: 0.88, glowColor: 'rgba(255, 180, 80, 0.50)',  glowSize: '60px', breathDuration: '6s' },
  RED:     { opacity: 0.75, glowColor: 'rgba(255, 160, 60, 0.35)',  glowSize: '44px', breathDuration: '4s' },
  NEUTRAL: { opacity: 0.82, glowColor: 'rgba(255, 180, 80, 0.42)',  glowSize: '52px', breathDuration: '6s' },
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
          0%, 100% { transform: translateX(-50%) translateX(0px); }
          50%       { transform: translateX(-50%) translateX(10px); }
        }
      `}</style>

      <div
        className="relative w-full overflow-hidden flex justify-center items-end"
        style={{ height: 'clamp(300px, 40vh, 480px)' }}
        role="img"
        aria-label="Munk regulation presence"
      >
        {/* Primary mist — dissolves base artifact */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '160%',
            height: '200px',
            background: 'radial-gradient(ellipse at center, rgba(225,218,208,0.7) 0%, rgba(215,208,195,0.35) 45%, transparent 70%)',
            filter: 'blur(36px)',
            animation: 'munkMistDrift 20s linear infinite',
          }}
        />

        {/* Secondary mist — wider, softer upper layer */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '180%',
            height: '120px',
            background: 'radial-gradient(ellipse at center, rgba(215,208,195,0.3) 0%, transparent 65%)',
            filter: 'blur(28px)',
          }}
        />

        {/* Munk — 92% width, grounded into mist */}
        <div
          className="relative"
          style={{
            width: '92%',
            maxWidth: '640px',
            height: '100%',
            transform: 'translateY(16px)',
          }}
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

        {/* Chest glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '48%', left: '50%',
            width: preset.glowSize, height: preset.glowSize,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${preset.glowColor} 0%, transparent 70%)`,
            filter: 'blur(10px)',
            animation: `munkGlowBreathe ${preset.breathDuration} ease-in-out infinite`,
          }}
        />
      </div>
    </>
  )
}
