'use client'

import { useState, useEffect, useRef } from 'react'
import { logMorningEvent } from '../../lib/telemetry'

const APP_BG = 'radial-gradient(ellipse at 50% 0%, #4a8a7e 0%, #1a3d36 50%, #0a1a17 100%)'

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
      let result = await askMunk(q)
      if (result.status === 503) result = await askMunk(q)
      if (result.status !== 200 || !result.answer) {
        setError(result.error ?? 'Noe gikk galt.')
        logMorningEvent('ask_munk_answer_failed' as any)
        setLoading(false)
      } else {
        const settle = Math.max(0, 500 - (Date.now() - startTime))
        setLoading(false)
        setArriving(true)
        setTimeout(() => {
          setArriving(false)
          setAnswer(result.answer!)
          logMorningEvent('ask_munk_answer_rendered' as any)
          setTimeout(() => answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
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
          0%,100% { opacity: 0.35; transform: scale(1); }
          50%      { opacity: 0.65; transform: scale(1.10); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.50; transform: scale(0.95); }
          50%      { opacity: 1.00; transform: scale(1.15); }
        }
        @keyframes ringArrive {
          0%   { opacity: 0.80; transform: translate(-50%,-50%) scale(0.75); }
          100% { opacity: 0;    transform: translate(-50%,-50%) scale(1.70); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .fade-up  { animation: fadeUp 700ms cubic-bezier(.22,1,.36,1) both; }
        .fade-in  { animation: fadeIn 400ms ease both; }
        .a-s      { animation: fadeUp 500ms cubic-bezier(.22,1,.36,1) both; }
        .a-s:nth-child(1) { animation-delay: 0ms; }
        .a-s:nth-child(3) { animation-delay: 70ms; }
        .a-s:nth-child(5) { animation-delay: 140ms; }
        textarea::placeholder { color: rgba(255,255,255,0.42) !important; }
      `}</style>

      <div className="w-full max-w-sm flex flex-col">

        {/* ← Tilbake */}
        <button
          onClick={() => window.location.href = '/check-in'}
          className="self-start text-[13px] mb-10 tracking-[0.03em]"
          style={{ color: 'rgba(255,255,255,0.50)', background: 'none', border: 'none' }}
        >
          ← Tilbake
        </button>

        {/* HERO — all layers share exact center via translate(-50%,-50%) */}
        <div className="mb-10" style={{ position: 'relative', height: 88, width: '100%' }}>

          {/* Outer ring */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 88, height: 88,
            borderRadius: '50%',
            border: '1px solid rgba(255,160,50,0.22)',
          }} />

          {/* Mid ring */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 64, height: 64,
            borderRadius: '50%',
            border: '1px solid rgba(255,160,50,0.14)',
          }} />

          {/* Core glow — centered, no offset */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 60, height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(255,175,60,1.00) 0%, rgba(255,120,20,0.45) 45%, transparent 75%)',
            filter: 'blur(5px)',
            animation: isWaiting ? 'glowPulse 1.4s ease-in-out infinite' : 'glowBreath 5s ease-in-out infinite',
          }} />

          {/* Arrival expansion ring — same center */}
          {arriving && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 88, height: 88,
              borderRadius: '50%',
              border: '1px solid rgba(255,160,50,0.60)',
              animation: 'ringArrive 650ms ease-out forwards',
            }} />
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="text-[11px] tracking-[0.32em] uppercase mb-3"
            style={{ color: 'rgba(255,255,255,0.52)' }}
          >
            Spør Munken
          </div>
          <div
            className="text-[22px] font-semibold leading-snug"
            style={{ color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.01em' }}
          >
            Få en rolig forklaring på stresset ditt
          </div>
        </div>

        {/* Input — transparent, bottom line only, clear placeholder */}
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          placeholder="Hva lurer du på?"
          rows={3}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: '1.5px solid rgba(255,255,255,0.28)',
            borderRadius: 0,
            padding: '0 0 16px 0',
            lineHeight: '1.65',
            fontSize: '15px',
            color: 'rgba(255,255,255,0.94)',
            resize: 'none',
            outline: 'none',
            marginBottom: '22px',
          }}
        />

        {/* CTA — quietly ready */}
        <button
          onClick={handleSubmit}
          disabled={!question.trim() || isWaiting}
          style={{
            width: '100%',
            padding: '15px 0',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            marginBottom: '48px',
            transition: 'all 0.2s ease',
            background: question.trim() && !isWaiting
              ? 'rgba(255,200,80,0.18)'
              : 'rgba(255,255,255,0.07)',
            border: question.trim() && !isWaiting
              ? '1.5px solid rgba(255,200,80,0.40)'
              : '1.5px solid rgba(255,255,255,0.14)',
            color: question.trim() && !isWaiting
              ? 'rgba(255,255,255,0.96)'
              : 'rgba(255,255,255,0.32)',
            cursor: question.trim() && !isWaiting ? 'pointer' : 'default',
          }}
        >
          {isWaiting ? '·  ·  ·' : 'Spør'}
        </button>

        {/* Starter prompts */}
        {!answer && !isWaiting && (
          <div className="flex flex-col mb-6 fade-in">
            <div
              className="text-[11px] tracking-[0.24em] uppercase mb-4"
              style={{ color: 'rgba(255,255,255,0.40)' }}
            >
              Eller velg et spørsmål
            </div>
            {STARTER_PROMPTS.map((p, i) => (
              <button
                key={p}
                onClick={() => handlePrompt(p)}
                style={{
                  textAlign: 'left',
                  fontSize: '14px',
                  padding: '12px 0',
                  color: 'rgba(255,255,255,0.62)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: i < STARTER_PROMPTS.length - 1
                    ? '1px solid rgba(255,255,255,0.09)'
                    : 'none',
                  lineHeight: '1.5',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="text-[13px] text-center mb-6"
            style={{ color: 'rgba(255,200,80,0.80)' }}
          >
            {error}
          </div>
        )}

        {/* Answer */}
        {answer && (
          <div ref={answerRef} className="fade-up w-full flex flex-col mb-10">

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.14)', marginBottom: '28px' }} />

            <div className="a-s" style={{ marginBottom: '24px' }}>
              <div
                className="text-[11px] tracking-[0.26em] uppercase mb-3"
                style={{ color: 'rgba(255,255,255,0.44)' }}
              >
                Kort svar
              </div>
              <div
                className="text-[17px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.01em' }}
              >
                {answer.short_answer}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.09)', marginBottom: '24px' }} />

            <div className="a-s" style={{ marginBottom: '24px' }}>
              <div
                className="text-[11px] tracking-[0.26em] uppercase mb-3"
                style={{ color: 'rgba(255,255,255,0.44)' }}
              >
                Hvorfor det betyr noe
              </div>
              <div
                className="text-[14px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.70)' }}
              >
                {answer.why_it_matters}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.09)', marginBottom: '24px' }} />

            <div className="a-s">
              <div
                className="text-[11px] tracking-[0.26em] uppercase mb-3"
                style={{ color: 'rgba(255,255,255,0.44)' }}
              >
                Hva du gjør nå
              </div>
              <div
                className="text-[14px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.70)' }}
              >
                {answer.what_to_do}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.14)', margin: '28px 0 20px' }} />

            <button
              onClick={() => { setAnswer(null); setQuestion('') }}
              style={{
                fontSize: '12px',
                letterSpacing: '0.08em',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.36)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Nytt spørsmål
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
