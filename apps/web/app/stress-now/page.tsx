'use client'

import { useState } from 'react'
import { logMorningEvent } from '../../lib/telemetry'

type SelfReport = 'rolig' | 'spent' | 'tung' | 'presset'
type Screen = 'checkin' | 'result' | 'loading' | 'error'

interface StressNowResult {
  stress_now_level: 'LOW' | 'MODERATE' | 'HIGH'
  headline:         string
  why_line:         string
  action_line:      string
}

const OPTIONS: { value: SelfReport; label: string }[] = [
  { value: 'rolig',   label: 'Rolig'   },
  { value: 'spent',   label: 'Spent'   },
  { value: 'tung',    label: 'Tung'    },
  { value: 'presset', label: 'Presset' },
]

const APP_BG = 'radial-gradient(ellipse at 50% 20%, #2F5D54 0%, #1C3A34 40%, #0F1F1C 100%)'

const LEVEL_LABEL: Record<string, string> = {
  LOW:      'Lavt',
  MODERATE: 'Moderat',
  HIGH:     'Høyt',
}

export default function StressNowPage() {
  const [screen,   setScreen]   = useState<Screen>('checkin')
  const [selected, setSelected] = useState<SelfReport | null>(null)
  const [result,   setResult]   = useState<StressNowResult | null>(null)

  // Log open on mount
  useState(() => {
    logMorningEvent('stress_now_opened' as any)
  })

  async function handleSubmit() {
    if (!selected) return
    logMorningEvent('stress_now_option_selected' as any, { option: selected })
    setScreen('loading')

    try {
      const res = await fetch('/api/checkin/now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ self_report: selected }),
      })
      if (!res.ok) throw new Error('api_error')
      const json: StressNowResult = await res.json()
      setResult(json)
      setScreen('result')
      logMorningEvent('stress_now_result_rendered' as any, { level: json.stress_now_level })
    } catch {
      setScreen('error')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center text-white"
      style={{ background: APP_BG }}>

      {/* CHECK-IN */}
      {screen === 'checkin' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="text-xs tracking-[0.3em] uppercase text-[#6E6E73]">Stress nå</div>
          <h1 className="text-2xl font-medium leading-snug">
            Hva kjenner du mest i kroppen akkurat nå?
          </h1>
          <div className="w-full flex flex-col gap-3 mt-2">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className="w-full py-4 rounded-2xl text-base font-medium transition-all"
                style={{
                  background: selected === opt.value
                    ? 'rgba(255,200,80,0.22)'
                    : 'rgba(255,255,255,0.07)',
                  border: selected === opt.value
                    ? '1px solid rgba(255,200,80,0.45)'
                    : '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="mt-2 px-8 py-4 rounded-full text-base font-medium transition-all"
            style={{
              background: selected ? 'rgba(255,200,80,0.18)' : 'rgba(255,255,255,0.05)',
              border: selected ? '1px solid rgba(255,200,80,0.35)' : '1px solid rgba(255,255,255,0.08)',
              color: selected ? '#fff' : 'rgba(255,255,255,0.3)',
              cursor: selected ? 'pointer' : 'default',
              letterSpacing: '0.04em',
            }}
          >
            Se tolkning
          </button>
        </div>
      )}

      {/* LOADING */}
      {screen === 'loading' && (
        <div className="text-base text-[rgba(255,255,255,0.5)]">Tolker...</div>
      )}

      {/* ERROR */}
      {screen === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-[rgba(255,200,80,0.85)]">Noe gikk galt. Prøv igjen.</p>
          <button
            onClick={() => setScreen('checkin')}
            className="px-6 py-3 rounded-full text-sm text-white"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Tilbake
          </button>
        </div>
      )}

      {/* RESULT */}
      {screen === 'result' && result && (
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <div className="text-xs tracking-[0.3em] uppercase text-[#6E6E73]">Stress nå</div>

          <div className="flex flex-col items-center gap-1">
            <div className="text-xs tracking-[0.25em] uppercase text-[#6E6E73]">Stressnivå</div>
            <div className="text-[34px] font-semibold leading-tight">
              {LEVEL_LABEL[result.stress_now_level]}
            </div>
          </div>

          <div className="text-[17px] text-[#C7C7CC] max-w-xs leading-snug">
            {result.why_line}
          </div>

          <div className="w-10 h-px bg-white/10" />

          <div className="text-[17px] text-[#C7C7CC] max-w-xs leading-snug">
            {result.action_line}
          </div>

          <button
            onClick={() => { setScreen('checkin'); setSelected(null); setResult(null) }}
            className="mt-4 px-6 py-3 rounded-full text-sm text-white"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', letterSpacing: '0.04em' }}
          >
            Sjekk igjen
          </button>
        </div>
      )}

    </main>
  )
}
