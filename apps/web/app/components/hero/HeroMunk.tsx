'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null

type SequenceStep = 'INTRO_FADE_IN' | 'GLOW_BUILD' | 'FORECAST_SHOW' | 'IDLE'

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
  const isIntro = step !== 'IDLE'

  // Chest position — brystet er ca 44% ned på Munken
  const chestTop = '44%'

  const coreScale = step === 'INTRO_FADE_IN' ? 0.1 : step === 'GLOW_BUILD' ? 1.8 : step === 'FORECAST_SHOW' ? 2.2 : 1.0
  const haloScale = step === 'INTRO_FADE_IN' ? 0.1 : step === 'GLOW_BUILD' ? 1.6 : step === 'FORECAST_SHOW' ? 2.0 : 0
  const haloOpacity = step === 'FORECAST_SHOW' ? 0.8 : step === 'GLOW_BUILD' ? 0.6 : 0

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
            opacity: 0.85;
            transform: translate(-50%, -50%) scale(1.0);
            filter: blur(8px) brightness(140%);
          }
          50% { 
            opacity: 1.0;
            transform: translate(-50%, -50%) scale(1.25);
            filter: blur(11px) brightness(180%);
          }
        }
      `}</style>

      <div
        className="relative w-full flex justify-center"
        style={{ height: 'clamp(280px, 38vh, 420px)' }}
        role="img"
        aria-label="Munk regulation presence"
      >
        {/* Halo — only during intro sequence, fades out after */}
        <div className="absolute pointer-events-none" style={{
          top: chestTop, left: '50%',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,180,20,0.7) 0%, rgba(255,120,0,0.3) 50%, transparent 75%)',
          opacity: haloOpacity,
          transform: `translate(-50%, -50%) scale(${haloScale})`,
          filter: 'blur(30px)',
          transition: 'all 1800ms ease-in-out',
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

        {/* Chest glow — stays in idle, pumping in breast */}
        <div className="absolute pointer-events-none" style={{
          top: chestTop, left: '50%',
          width: '70px', height: '70px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,240,120,1.0) 0%, rgba(255,200,40,1.0) 40%, rgba(255,140,0,0.6) 70%, transparent 90%)',
          opacity: step === 'INTRO_FADE_IN' ? 0 : 1,
          transform: `translate(-50%, -50%) scale(${coreScale})`,
          filter: 'blur(8px)',
          transition: isIntro ? 'all 1800ms ease-in-out' : 'none',
          animation: step === 'IDLE' ? 'chestPulse 5s ease-in-out infinite' : 'none',
        }} />
      </div>
    </>
  )
}
