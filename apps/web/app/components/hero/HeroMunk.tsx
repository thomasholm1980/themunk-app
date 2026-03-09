'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null

type SequenceStep =
  | 'INTRO_FADE_IN'
  | 'GLOW_BUILD'
  | 'FORECAST_SHOW'
  | 'IDLE'

interface HeroMunkProps {
  state: RegulationState
  isReading?: boolean
  forecastReady?: boolean
  dominantPattern?: string | null
}

export function HeroMunk({ state }: HeroMunkProps) {
  const [step, setStep] = useState<SequenceStep>('INTRO_FADE_IN')

  useEffect(() => {
    const t1 = setTimeout(() => setStep('GLOW_BUILD'), 700)
    const t2 = setTimeout(() => setStep('FORECAST_SHOW'), 1600)
    const t3 = setTimeout(() => setStep('IDLE'), 2500)
    return () => { [t1,t2,t3].forEach(clearTimeout) }
  }, [])

  const monkOpacity = step === 'INTRO_FADE_IN' ? 0 : 1
  const coreScale = step === 'INTRO_FADE_IN' ? 0.2 : step === 'GLOW_BUILD' ? 2.5 : step === 'FORECAST_SHOW' ? 3.2 : 1.6
  const midScale  = step === 'INTRO_FADE_IN' ? 0.2 : step === 'GLOW_BUILD' ? 2.0 : step === 'FORECAST_SHOW' ? 2.8 : 1.4
  const haloScale = step === 'INTRO_FADE_IN' ? 0.2 : step === 'GLOW_BUILD' ? 1.5 : step === 'FORECAST_SHOW' ? 2.2 : 1.2
  const glowAlpha = step === 'INTRO_FADE_IN' ? 0   : 1.0

  return (
    <>
      <style>{`
        @keyframes munkBreathe {
          0%, 100% { transform: scale(1.000); }
          50%       { transform: scale(1.022); }
        }
        @keyframes munkFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes coreGlow {
          0%, 100% { opacity: 0.90; transform: translate(-50%,-50%) scale(1.6); filter: blur(14px) brightness(140%); }
          50%       { opacity: 1.00; transform: translate(-50%,-50%) scale(2.0); filter: blur(20px) brightness(180%); }
        }
        @keyframes midGlow {
          0%, 100% { opacity: 0.75; transform: translate(-50%,-50%) scale(1.4); filter: blur(22px) brightness(130%); }
          50%       { opacity: 1.00; transform: translate(-50%,-50%) scale(1.7); filter: blur(28px) brightness(155%); }
        }
        @keyframes haloGlow {
          0%, 100% { opacity: 0.55; transform: translate(-50%,-50%) scale(1.2); filter: blur(40px); }
          50%       { opacity: 0.90; transform: translate(-50%,-50%) scale(1.55); filter: blur(50px); }
        }
      `}</style>

      <div
        className="relative w-full flex justify-center"
        style={{ height: 'clamp(280px, 38vh, 420px)' }}
        role="img"
        aria-label="Munk regulation presence"
      >
        {/* Layer 3 — outer halo, 400px */}
        <div className="absolute pointer-events-none" style={{
          top: '50%', left: '50%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,180,20,0.65) 0%, rgba(255,120,0,0.35) 50%, transparent 75%)',
          opacity: glowAlpha,
          transform: `translate(-50%, -50%) scale(${haloScale})`,
          filter: 'blur(40px)',
          transition: step === 'IDLE' ? 'none' : 'all 900ms ease-out',
          animation: step === 'IDLE' ? 'haloGlow 5s ease-in-out infinite' : 'none',
        }} />

        {/* Layer 2 — mid glow, 220px */}
        <div className="absolute pointer-events-none" style={{
          top: '50%', left: '50%',
          width: '220px', height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,210,60,0.90) 0%, rgba(255,160,10,0.80) 45%, transparent 75%)',
          opacity: glowAlpha,
          transform: `translate(-50%, -50%) scale(${midScale})`,
          filter: 'blur(22px)',
          transition: step === 'IDLE' ? 'none' : 'all 900ms ease-out',
          animation: step === 'IDLE' ? 'midGlow 5s ease-in-out infinite' : 'none',
        }} />

        {/* Monk */}
        <div style={{
          width: '90%', maxWidth: '580px', height: '100%', position: 'relative',
          opacity: monkOpacity,
          transition: 'opacity 700ms ease-out',
          animation: step === 'IDLE' ? 'munkFloat 16s ease-in-out infinite, munkBreathe 5s ease-in-out infinite' : 'none',
        }}>
          <Image src="/assets/munk-hero-v7.png" alt="The Munk" fill priority className="object-contain object-bottom" />
        </div>

        {/* Layer 1 — core chest glow, 180px */}
        <div className="absolute pointer-events-none" style={{
          top: '50%', left: '50%',
          width: '180px', height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,245,150,1.0) 0%, rgba(255,210,50,1.0) 30%, rgba(255,150,0,0.85) 60%, transparent 80%)',
          opacity: glowAlpha,
          transform: `translate(-50%, -50%) scale(${coreScale})`,
          filter: 'blur(12px)',
          transition: step === 'IDLE' ? 'none' : 'all 900ms ease-out',
          animation: step === 'IDLE' ? 'coreGlow 5s ease-in-out infinite' : 'none',
        }} />
      </div>
    </>
  )
}
