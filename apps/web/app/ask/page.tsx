'use client'

import { useState, useEffect } from 'react'
import { logMorningEvent } from '../../lib/telemetry'

const APP_BG = 'radial-gradient(ellipse at 50% 20%, #2F5D54 0%, #1C3A34 40%, #0F1F1C 100%)'

// Tightened — human, stress-focused, not product onboarding
const STARTER_PROMPTS = [
  'Hva betyr dette stresset?',
  'Hva er HRV egentlig?',
  'Hvorfor blir dagen tyngre utover?',
  'Hva gjør stress med søvnen?',
  'Hva trenger kroppen min nå?',
]

interface Answer {
  short_answer:   string
  why_it_matters: string
  what_to_do:     string
}

export default function AskPage() {
  const [question, setQuestion] = useState('')
  const [answer,   setAnswer]   = useState<Answer | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    logMorningEvent('ask_munk_opened' as any)
  }, [])

  async function handleSubmit() {
    const q = question.trim()
    if (!q || loading) return
    setLoading(true)
    setAnswer(null)
    setError(null)
    logMorningEvent('ask_munk_question_submitted' as any, { length: q.length })
    try {
      const res  = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Noe gikk galt.')
        logMorningEvent('ask_munk_answer_failed' as any)
      } else {
        setAnswer(json.answer)
        logMorningEvent('ask_munk_answer_rendered' as any)
      }
    } catch {
      setError('Munken svarer ikke akkurat nå. Prøv igjen.')
      logMorningEvent('ask_munk_answer_failed' as any)
    } finally {
      setLoading(false)
    }
  }

  function handlePrompt(prompt: string) {
    logMorningEvent('ask_munk_prompt_selected' as any, { prompt })
    setQuestion(prompt)
    setAnswer(null)
    setError(null)
  }

  return (
    <main
      className="min-h-screen text-white flex flex-col items-center px-6 py-10"
      style={{ background: APP_BG }}
    >
      <style>{`
        @keyframes glowBreath {
          0%,100% { opacity: 0.18; transform: scale(1); }
          50%      { opacity: 0.34; transform: scale(1.10); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 600ms cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div className="w-full max-w-sm flex flex-col">

        {/* Back */}
        <button
          onClick={() => window.location.href = '/check-in'}
          className="self-start text-xs text-[rgba(255,255,255,0.22)] mb-10 tracking-[0.04em]"
        >
          ← Tilbake
        </button>

        {/* Monk presence — +15% glow, slightly larger, more atmospheric */}
        <div className="flex justify-center mb-8">
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,160,50,0.70) 0%, rgba(255,100,20,0.28) 50%, transparent 75%)',
            animation: 'glowBreath 5s ease-in-out infinite',
            filter: 'blur(3px)',
          }} />
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.3em] uppercase text-[rgba(255,255,255,0.22)] mb-3">
            Spør Munken
          </div>
          <div className="text-[22px] font-medium leading-snug text-white">
            Få en rolig forklaring på stresset ditt
          </div>
        </div>

        {/* Input — more breathing room, less "app" */}
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          placeholder="Hva lurer du på?"
          rows={3}
          className="w-full rounded-2xl text-[15px] text-white placeholder-[rgba(255,255,255,0.20)] resize-none outline-none px-5 py-4 mb-4"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            lineHeight: '1.6',
          }}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!question.trim() || loading}
          className="w-full py-4 rounded-2xl text-[14px] font-medium mb-10 transition-all"
          style={{
            background: question.trim() && !loading ? 'rgba(255,200,80,0.14)' : 'rgba(255,255,255,0.04)',
            border: question.trim() && !loading ? '1px solid rgba(255,200,80,0.25)' : '1px solid rgba(255,255,255,0.06)',
            color: question.trim() && !loading ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.18)',
            cursor: question.trim() && !loading ? 'pointer' : 'default',
            letterSpacing: '0.06em',
          }}
        >
          {loading ? 'Munken tenker...' : 'Spør'}
        </button>

        {/* Starter prompts — tightened, human */}
        {!answer && !loading && (
          <div className="flex flex-col gap-2 mb-6">
            <div className="text-xs tracking-[0.2em] uppercase text-[rgba(255,255,255,0.18)] mb-2">
              Eller velg et spørsmål
            </div>
            {STARTER_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => handlePrompt(p)}
                className="text-left text-[13px] px-4 py-3 rounded-xl transition-all"
                style={{
                  color: 'rgba(255,255,255,0.38)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  lineHeight: '1.5',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-[13px] text-[rgba(255,200,80,0.65)] text-center mb-6">
            {error}
          </div>
        )}

        {/* Answer — weighted, still, intentional hierarchy */}
        {answer && (
          <div
            className="fade-up w-full flex flex-col rounded-2xl px-6 py-6 mb-8"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              gap: '0',
            }}
          >
            {/* Kort svar */}
            <div style={{ marginBottom: '20px' }}>
              <div className="text-xs tracking-[0.22em] uppercase text-[rgba(255,255,255,0.22)] mb-2">
                Kort svar
              </div>
              <div className="text-[16px] text-white leading-relaxed">
                {answer.short_answer}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px' }} />

            {/* Hvorfor */}
            <div style={{ marginBottom: '20px' }}>
              <div className="text-xs tracking-[0.22em] uppercase text-[rgba(255,255,255,0.22)] mb-2">
                Hvorfor det betyr noe
              </div>
              <div className="text-[14px] text-[rgba(255,255,255,0.55)] leading-relaxed">
                {answer.why_it_matters}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px' }} />

            {/* Hva du gjør */}
            <div style={{ marginBottom: '8px' }}>
              <div className="text-xs tracking-[0.22em] uppercase text-[rgba(255,255,255,0.22)] mb-2">
                Hva du gjør nå
              </div>
              <div className="text-[14px] text-[rgba(255,255,255,0.55)] leading-relaxed">
                {answer.what_to_do}
              </div>
            </div>

            <button
              onClick={() => { setAnswer(null); setQuestion('') }}
              className="text-xs text-[rgba(255,255,255,0.20)] tracking-[0.04em] mt-5 text-center"
            >
              Nytt spørsmål
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
