'use client'

import { useState, useEffect, useRef } from 'react'
import { logMorningEvent } from '../../lib/telemetry'

const APP_BG = 'radial-gradient(ellipse at 50% 20%, #2F5D54 0%, #1C3A34 40%, #0F1F1C 100%)'

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

async function askMunk(question: string): Promise<{ answer?: Answer; error?: string; status: number }> {
  const res  = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  const json = await res.json()
  return { ...json, status: res.status }
}

export default function AskPage() {
  const [question,  setQuestion]  = useState('')
  const [answer,    setAnswer]    = useState<Answer | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [arriving,  setArriving]  = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const answerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logMorningEvent('ask_munk_opened' as any)
  }, [])

  async function handleSubmit() {
    const q = question.trim()
    if (!q || loading) return

    setLoading(true)
    setAnswer(null)
    setError(null)
    setArriving(false)
    logMorningEvent('ask_munk_question_submitted' as any, { length: q.length })

    const startTime = Date.now()

    try {
      // First attempt
      let result = await askMunk(q)

      // Silent retry — only on 503, only once
      if (result.status === 503) {
        result = await askMunk(q)
      }

      if (result.status !== 200 || !result.answer) {
        setError(result.error ?? 'Noe gikk galt.')
        logMorningEvent('ask_munk_answer_failed' as any)
        setLoading(false)
      } else {
        const elapsed = Date.now() - startTime
        const settle  = Math.max(0, 500 - elapsed)

        setLoading(false)
        setArriving(true)

        setTimeout(() => {
          setArriving(false)
          setAnswer(result.answer!)
          logMorningEvent('ask_munk_answer_rendered' as any)
          setTimeout(() => {
            answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }, settle)
      }
    } catch {
      setError('Munken svarer ikke akkurat nå. Prøv igjen.')
      logMorningEvent('ask_munk_answer_failed' as any)
      setLoading(false)
    }
  }

  function handlePrompt(prompt: string) {
    logMorningEvent('ask_munk_prompt_selected' as any, { prompt })
    setQuestion(prompt)
    setAnswer(null)
    setError(null)
  }

  const isWaiting = loading || arriving

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
        @keyframes glowPulse {
          0%   { opacity: 0.28; transform: scale(0.92); }
          50%  { opacity: 0.72; transform: scale(1.18); }
          100% { opacity: 0.28; transform: scale(0.92); }
        }
        @keyframes ringExpand {
          0%   { opacity: 0.55; transform: scale(0.70); }
          100% { opacity: 0;    transform: scale(1.60); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .fade-up { animation: fadeUp 700ms cubic-bezier(.22,1,.36,1) both; }
        .fade-in { animation: fadeIn 400ms ease both; }
        .answer-section { animation: fadeUp 500ms cubic-bezier(.22,1,.36,1) both; }
        .answer-section:nth-child(1) { animation-delay: 0ms; }
        .answer-section:nth-child(3) { animation-delay: 80ms; }
        .answer-section:nth-child(5) { animation-delay: 160ms; }
      `}</style>

      <div className="w-full max-w-sm flex flex-col">

        {/* Back */}
        <button
          onClick={() => window.location.href = '/check-in'}
          className="self-start text-xs text-[rgba(255,255,255,0.20)] mb-12 tracking-[0.04em]"
        >
          ← Tilbake
        </button>

        {/* Monk presence */}
        <div className="flex justify-center mb-10" style={{ position: 'relative', height: 72 }}>
          <div style={{
            position: 'absolute',
            width: 72, height: 72,
            borderRadius: '50%',
            border: '1px solid rgba(255,160,50,0.10)',
            top: 0, left: '50%', transform: 'translateX(-50%)',
          }} />
          <div style={{
            position: 'absolute',
            width: 52, height: 52,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,160,50,0.72) 0%, rgba(255,100,20,0.28) 52%, transparent 78%)',
            animation: isWaiting ? 'glowPulse 1.4s ease-in-out infinite' : 'glowBreath 5s ease-in-out infinite',
            filter: 'blur(3px)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.4s ease',
          }} />
          {arriving && (
            <div style={{
              position: 'absolute',
              width: 72, height: 72,
              borderRadius: '50%',
              border: '1px solid rgba(255,160,50,0.45)',
              top: 0, left: '50%', transform: 'translateX(-50%)',
              animation: 'ringExpand 600ms ease-out forwards',
            }} />
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.3em] uppercase text-[rgba(255,255,255,0.20)] mb-3">
            Spør Munken
          </div>
          <div className="text-[21px] font-medium leading-snug text-white" style={{ letterSpacing: '-0.01em' }}>
            Få en rolig forklaring på stresset ditt
          </div>
        </div>

        {/* Input */}
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          placeholder="Hva lurer du på?"
          rows={3}
          className="w-full text-[15px] text-white placeholder-[rgba(255,255,255,0.18)] resize-none outline-none"
          style={{
            background:    'transparent',
            border:        'none',
            borderBottom:  '1px solid rgba(255,255,255,0.10)',
            borderRadius:  0,
            padding:       '0 0 16px 0',
            lineHeight:    '1.65',
            marginBottom:  '28px',
          }}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!question.trim() || isWaiting}
          className="w-full py-[14px] text-[13px] font-medium mb-12 transition-all"
          style={{
            background:    question.trim() && !isWaiting ? 'rgba(255,200,80,0.10)' : 'transparent',
            border:        question.trim() && !isWaiting ? '1px solid rgba(255,200,80,0.20)' : '1px solid rgba(255,255,255,0.06)',
            borderRadius:  '14px',
            color:         question.trim() && !isWaiting ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.16)',
            cursor:        question.trim() && !isWaiting ? 'pointer' : 'default',
            letterSpacing: '0.08em',
          }}
        >
          {isWaiting ? '·  ·  ·' : 'Spør'}
        </button>

        {/* Starter prompts */}
        {!answer && !isWaiting && (
          <div className="flex flex-col gap-[6px] mb-6 fade-in">
            <div className="text-xs tracking-[0.22em] uppercase text-[rgba(255,255,255,0.15)] mb-3">
              Eller velg et spørsmål
            </div>
            {STARTER_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => handlePrompt(p)}
                className="text-left text-[13px] px-0 py-[10px] transition-all"
                style={{
                  color:        'rgba(255,255,255,0.32)',
                  background:   'transparent',
                  border:       'none',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  lineHeight:   '1.5',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-[13px] text-[rgba(255,200,80,0.55)] text-center mb-6">
            {error}
          </div>
        )}

        {/* Answer */}
        {answer && (
          <div ref={answerRef} className="fade-up w-full flex flex-col mb-10" style={{ paddingTop: '8px' }}>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '32px' }} />

            <div className="answer-section" style={{ marginBottom: '28px' }}>
              <div className="text-xs tracking-[0.24em] uppercase text-[rgba(255,255,255,0.20)] mb-3">
                Kort svar
              </div>
              <div className="text-[17px] text-white leading-relaxed" style={{ letterSpacing: '-0.01em' }}>
                {answer.short_answer}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '28px' }} />

            <div className="answer-section" style={{ marginBottom: '28px' }}>
              <div className="text-xs tracking-[0.24em] uppercase text-[rgba(255,255,255,0.20)] mb-3">
                Hvorfor det betyr noe
              </div>
              <div className="text-[14px] text-[rgba(255,255,255,0.50)] leading-relaxed">
                {answer.why_it_matters}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '28px' }} />

            <div className="answer-section">
              <div className="text-xs tracking-[0.24em] uppercase text-[rgba(255,255,255,0.20)] mb-3">
                Hva du gjør nå
              </div>
              <div className="text-[14px] text-[rgba(255,255,255,0.50)] leading-relaxed">
                {answer.what_to_do}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '32px 0 24px' }} />

            <button
              onClick={() => { setAnswer(null); setQuestion('') }}
              className="text-xs text-[rgba(255,255,255,0.18)] tracking-[0.08em] text-center"
            >
              Nytt spørsmål
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
