'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null
type SequenceStep = 'INTRO_FADE_IN' | 'GLOW_BUILD' | 'FORECAST_SHOW' | 'SETTLE' | 'IDLE'

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
    const t3 = setTimeout(() => setStep('SETTLE'), 2800)
    const t4 = setTimeout(() => setStep('IDLE'), 6000)
    return () => { [t1,t2,t3,t4].forEach(clearTimeout) }
  }, [])

  const chestTop = '44%'
  const SETTLE_TRANSITION = '3200ms'
  const INTRO_TRANSITION = '1800ms'
  const transition = step === 'SETTLE' ? `all ${SETTLE_TRANSITION} ease-in-out` : `all ${INTRO_TRANSITION} ease-in-out`

  // Core scale — settles slowly into idle size
  const coreScale =
    step === 'INTRO_FADE_IN' ? 0.1 :
    step === 'GLOW_BUILD'    ? 1.8 :
    step === 'FORECAST_SHOW' ? 2.2 :
    step === 'SETTLE'        ? 1.05 :
    1.0

  // Halo — same transition as core so they fade together
  const haloOpacity =
    step === 'GLOW_BUILD'    ? 0.55 :
    step === 'FORECAST_SHOW' ? 0.75 :
    step === 'SETTLE'        ? 0.0 :
    0.0

  const haloScale =
    step === 'GLOW_BUILD'    ? 1.6 :
    step === 'FORECAST_SHOW' ? 2.0 :
    step === 'SETTLE'        ? 1.8 :
    1.8

  // Core glow color — warm white/yellow intro → soft amber idle
  const coreGradient =
    step === 'FORECAST_SHOW'
      ? 'radial-gradient(circle, rgba(255,255,180,1.0) 0%, rgba(255,220,60,1.0) 35%, rgba(255,160,10,0.7) 65%, transparent 90%)'
      : step === 'SETTLE'
      ? 'radial-gradient(circle, rgba(255,230,100,1.0) 0%, rgba(255,195,30,1.0) 40%, rgba(255,140,0,0.55) 70%, transparent 90%)'
      : 'radial-gradient(circle, rgba(255,240,120,1.0) 0%, rgba(255,200,40,1.0) 40%, rgba(255,140,0,0.6) 70%, transparent 90%)'

  return (
    <>
      <style>{`
        @keyframes munkBreathe {
          0%, 100% { transform: scale(1.000); }
          50%       { transform: scale(1.018); }
        }
        @keyframes munkFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes chestPulse {
          0%, 100% {
            opacity: 0.88;
            transform: translate(-50%, -50%) scale(1.0);
            filter: blur(8px) brightness(138%);
          }
          50% {
            opacity: 1.0;
            transform: translate(-50%, -50%) scale(1.22);
            filter: blur(11px) brightness(172%);
          }
        }
      `}</style>

      <div
        className="relative w-full flex justify-center"
        style={{ height: 'clamp(280px, 38vh, 420px)' }}
        role="img"
        aria-label="Munk regulation presence"
      >
        {/* Halo */}
        <div className="absolute pointer-events-none" style={{
          top: chestTop, left: '50%',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,180,20,0.65) 0%, rgba(255,110,0,0.3) 55%, transparent 80%)',
          opacity: haloOpacity,
          transform: `translate(-50%, -50%) scale(${haloScale})`,
          filter: 'blur(32px)',
          transition,
        }} />

        {/* Monk */}
        <div style={{
          width: '90%', maxWidth: '580px', height: '100%', position: 'relative',
          opacity: step === 'INTRO_FADE_IN' ? 0 : 1,
          transition: 'opacity 700ms ease-out',
          animation: step === 'IDLE' ? 'munkFloat 16s ease-in-out infinite, munkBreathe 5s ease-in-out infinite' : 'none',
        }}>
          <Image src="/assets/munk-hero-v7.png" alt="The Munk" fill priority className="object-contain object-bottom" />
        </div>

        {/* Chest glow */}
        <div className="absolute pointer-events-none" style={{
          top: chestTop, left: '50%',
          width: '70px', height: '70px',
          borderRadius: '50%',
          background: coreGradient,
          opacity: step === 'INTRO_FADE_IN' ? 0 : 1,
          transform: `translate(-50%, -50%) scale(${coreScale})`,
          filter: 'blur(8px)',
          transition,
          animation: step === 'IDLE' ? 'chestPulse 5s ease-in-out infinite' : 'none',
        }} />
      </div>
    </>
  )
}
