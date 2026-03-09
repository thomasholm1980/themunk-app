'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

type RegulationState = 'GREEN' | 'YELLOW' | 'RED' | null

type SequenceStep =
  | 'INTRO_FADE_IN'
  | 'GLOW_BUILD'
  | 'FORECAST_SHOW'
  | 'SIGNALS_PEEK_UP'
  | 'SIGNALS_HOLD'
  | 'SIGNALS_RETURN'
  | 'IDLE'

interface HeroMunkProps {
  state: RegulationState
  onForecastShow?: () => void
  onSignalsPeek?: () => void
}

export function HeroMunk({ state, onForecastShow, onSignalsPeek }: HeroMunkProps) {
  const [step, setStep] = useState<SequenceStep>('INTRO_FADE_IN')

  useEffect(() => {
    const t1 = setTimeout(() => setStep('GLOW_BUILD'), 700)
    const t2 = setTimeout(() => { setStep('FORECAST_SHOW'); onForecastShow?.() }, 1600)
    const t3 = setTimeout(() => { setStep('SIGNALS_PEEK_UP'); onSignalsPeek?.() }, 1600)
    const t4 = setTimeout(() => setStep('SIGNALS_HOLD'), 2200)
    const t5 = setTimeout(() => setStep('SIGNALS_RETURN'), 4200)
    const t6 = setTimeout(() => setStep('IDLE'), 4900)
    return () => { [t1,t2,t3,t4,t5,t6].forEach(clearTimeout) }
  }, [])

  const monkOpacity = step === 'INTRO_FADE_IN' ? 0 : 1
  const glowScale = step === 'INTRO_FADE_IN' ? 0.3 : step === 'GLOW_BUILD' ? 2.2 : step === 'FORECAST_SHOW' ? 2.8 : 1.4
  const glowOpacity = step === 'INTRO_FADE_IN' ? 0 : step === 'GLOW_BUILD' ? 1.0 : step === 'FORECAST_SHOW' ? 1.0 : 1.0
  const haloScale = step === 'FORECAST_SHOW' ? 2.0 : step === 'IDLE' ? 1.2 : 1.0

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
        @keyframes munkGlowIdle {
          0%, 100% { opacity: 0.90; transform: translate(-50%,-50%) scale(1.4); filter: blur(22px) brightness(130%); }
          50%       { opacity: 1.00; transform: translate(-50%,-50%) scale(1.7); filter: blur(30px) brightness(160%); }
        }
        @keyframes munkHaloIdle {
          0%, 100% { opacity: 0.55; transform: translate(-50%,-50%) scale(1.2); }
          50%       { opacity: 0.90; transform: translate(-50%,-50%) scale(1.5); }
        }
      `}</style>

      <div
        className="relative w-full flex justify-center"
        style={{ height: 'clamp(280px, 38vh, 420px)' }}
        role="img"
        aria-label="Munk regulation presence"
      >
        {/* Outer halo — massive */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '52%', left: '50%',
            width: '360px', height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,200,40,0.75) 0%, rgba(255,140,0,0.4) 45%, transparent 70%)',
            transform: `translate(-50%, -50%) scale(${haloScale})`,
            opacity: glowOpacity,
            filter: 'blur(35px)',
            transition: step === 'IDLE' ? 'none' : 'all 900ms ease-out',
            animation: step === 'IDLE' ? 'munkHaloIdle 5s ease-in-out infinite' : 'none',
          }}
        />

        {/* Monk */}
        <div
          style={{
            width: '90%',
            maxWidth: '580px',
            height: '100%',
            position: 'relative',
            opacity: monkOpacity,
            transition: 'opacity 700ms ease-out',
            animation: step === 'IDLE' ? 'munkFloat 16s ease-in-out infinite, munkBreathe 5s ease-in-out infinite' : 'none',
          }}
        >
          <Image
            src="/assets/munk-hero-v7.png"
            alt="The Munk"
            fill
            priority
            className="object-contain object-bottom"
          />
        </div>

        {/* Chest glow — nuclear */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%', left: '50%',
            width: '160px', height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,230,100,1.0) 0%, rgba(255,180,20,1.0) 35%, rgba(255,120,0,0.6) 60%, transparent 80%)',
            filter: 'blur(16px)',
            opacity: glowOpacity,
            transform: `translate(-50%, -50%) scale(${glowScale})`,
            transition: step === 'IDLE' ? 'none' : 'all 900ms ease-out',
            animation: step === 'IDLE' ? 'munkGlowIdle 5s ease-in-out infinite' : 'none',
          }}
        />
      </div>
    </>
  )
}
