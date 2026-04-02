'use client'

import { useState, useEffect, useRef } from 'react'
import { logMorningEvent } from '../../lib/telemetry'
import { useAtmosphere } from '../../hooks/useAtmosphere'

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
  const atm = useAtmosphere()
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
      className="min-h-screen text-white flex flex-col items-center px-6"
      style={{ background: `linear-gradient(160deg, ${atm.gradientFrom} 0%, ${atm.gradientTo} 100%)`, transition: 'background 3s ease-in-out', paddingTop: '20px', paddingBottom: '88px' }}
    >
      <style>{`
        @keyframes glowBreath {
          0%,100% { opacity: 0.55; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 0.85; transform: translate(-50%,-50%) scale(1.08); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.65; transform: translate(-50%,-50%) scale(0.96); }
          50%      { opacity: 1.00; transform: translate(-50%,-50%) scale(1.12); }
        }
        @keyframes ringArrive {
          0%   { opacity: 0.80; transform: translate(-50%,-50%) scale(0.75); }
          100% { opacity: 0;    transform: translate(-50%,-50%) scale(1.70); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .fade-up { animation: fadeUp 700ms cubic-bezier(.22,1,.36,1) both; }
        .fade-in { animation: fadeIn 400ms ease both; }
        .a-s     { animation: fadeUp 500ms cubic-bezier(.22,1,.36,1) both; }
        .a-s:nth-child(1) { animation-delay: 0ms; }
        .a-s:nth-child(3) { animation-delay: 70ms; }
        .a-s:nth-child(5) { animation-delay: 140ms; }
        textarea::placeholder { color: rgba(255,255,255,0.50) !important; }
      `}</style>

      <div className="w-full max-w-sm flex flex-col">

        {/* ← Tilbake */}
        <button
          onClick={() => { window.location.href = '/check-in?awake=true'; }}
          style={{
            alignSelf: 'flex-start', fontSize: '13px',
            color: 'rgba(255,255,255,0.50)', background: 'none',
            border: 'none', padding: 0, marginBottom: '20px',
            letterSpacing: '0.02em', cursor: 'pointer',
          }}
        >
          ← Tilbake
        </button>

        {/* HERO — larger glow, same shared center */}
        <div style={{ position: 'relative', height: 70, width: '100%', marginBottom: '8px' }}>

          {/* Outer ring */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 88, height: 88, borderRadius: '50%',
            border: '1px solid rgba(255,160,50,0.25)',
          }} />

          {/* Mid ring */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 64, height: 64, borderRadius: '50%',
            border: '1px solid rgba(255,160,50,0.15)',
          }} />

          {/* Core glow — 68px, blur 10px, strong center */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 68, height: 68, borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(255,190,70,1.00) 0%, rgba(255,140,20,0.70) 35%, rgba(255,100,10,0.25) 60%, transparent 80%)',
            filter: 'blur(10px)',
            animation: isWaiting
              ? 'glowPulse 1.4s ease-in-out infinite'
              : 'glowBreath 5s ease-in-out infinite',
          }} />

          {/* Arrival ring */}
          {arriving && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 88, height: 88, borderRadius: '50%',
              border: '1px solid rgba(255,160,50,0.60)',
              animation: 'ringArrive 650ms ease-out forwards',
            }} />
          )}
        </div>

        {/* Label */}
        <div style={{
          textAlign: 'center', fontSize: '11px',
          letterSpacing: '0.30em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.52)', marginBottom: '8px',
        }}>
          Spør Munken
        </div>

        {/* Headline */}
        <div style={{
          textAlign: 'center', fontSize: '21px', fontWeight: 600,
          lineHeight: 1.25, color: 'rgba(255,255,255,0.96)',
          letterSpacing: '-0.01em', marginBottom: '10px',
        }}>
          Få en rolig forklaring på stresset ditt
        </div>
        <div style={{
          textAlign: 'center', fontSize: '14px', fontWeight: 400,
          lineHeight: 1.45, color: 'rgba(255,255,255,0.62)',
          marginTop: '4px', marginBottom: '0',
        }}>
          Dagens signaler er klare. Nå kan du spørre hva de betyr.
        </div>

        {/* Input */}
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          placeholder="Hva lurer du på?"
          rows={1}
          style={{
            width: '100%', background: 'transparent',
            border: 'none', borderBottom: '1.5px solid rgba(255,255,255,0.28)',
            borderRadius: 0, padding: '0 0 10px 0',
            lineHeight: '1.60', fontSize: '15px',
            color: 'rgba(255,255,255,0.94)',
            resize: 'none', outline: 'none', marginBottom: '8px',
          }}
        />

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!question.trim() || isWaiting}
          style={{
            width: '100%', padding: '12px 0',
            borderRadius: '13px', fontSize: '15px',
            fontWeight: 700, letterSpacing: '0.10em',
            marginBottom: '20px', transition: 'all 0.2s ease',
            background: question.trim() && !isWaiting
              ? 'rgba(255,200,80,0.22)'
              : 'rgba(255,255,255,0.08)',
            border: question.trim() && !isWaiting
              ? '1.5px solid rgba(255,200,80,0.50)'
              : '1.5px solid rgba(255,255,255,0.16)',
            color: question.trim() && !isWaiting
              ? 'rgba(255,255,255,1.00)'
              : 'rgba(255,255,255,0.28)',
            cursor: question.trim() && !isWaiting ? 'pointer' : 'default',
          }}
        >
          {isWaiting ? 'Munken lytter til hjertet ditt...' : 'Spør'}
        </button>

        {/* Starter prompts */}
        {!answer && !isWaiting && (
          <div className="fade-in">
            <div style={{
              fontSize: '11px', letterSpacing: '0.24em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)',
              marginBottom: '12px',
            }}>
              Eller velg et spørsmål
            </div>
            {STARTER_PROMPTS.map((p, i) => (
              <button
                key={p}
                onClick={() => handlePrompt(p)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  fontSize: '14px', padding: '11px 0',
                  color: 'rgba(255,255,255,0.70)',
                  background: 'transparent', border: 'none',
                  borderBottom: i < STARTER_PROMPTS.length - 1
                    ? '1px solid rgba(255,255,255,0.09)' : 'none',
                  lineHeight: '1.5', cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            fontSize: '13px', textAlign: 'center',
            marginBottom: '16px', color: 'rgba(255,200,80,0.80)',
          }}>
            {error}
          </div>
        )}

        {/* Answer */}
        {answer && (
          <div ref={answerRef} className="fade-up w-full flex flex-col" style={{ marginBottom: '40px', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '24px', padding: '24px' }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.14)', marginBottom: '24px' }} />
            <div className="a-s" style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.44)', marginBottom: '8px' }}>Kort svar</div>
              <div style={{ fontSize: '17px', lineHeight: 1.55, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.01em' }}>{answer.short_answer}</div>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.09)', marginBottom: '20px' }} />
            <div className="a-s" style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.44)', marginBottom: '8px' }}>Hvorfor det betyr noe</div>
              <div style={{ fontSize: '14px', lineHeight: 1.60, color: 'rgba(255,255,255,0.70)' }}>{answer.why_it_matters}</div>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.09)', marginBottom: '20px' }} />
            <div className="a-s">
              <div style={{ fontSize: '11px', letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.44)', marginBottom: '8px' }}>Hva du gjør nå</div>
              <div style={{ fontSize: '14px', lineHeight: 1.60, color: 'rgba(255,255,255,0.70)' }}>{answer.what_to_do}</div>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.14)', margin: '24px 0 16px' }} />
            <button
              onClick={() => { setAnswer(null); setQuestion('') }}
              style={{
                fontSize: '12px', letterSpacing: '0.08em', textAlign: 'center',
                color: 'rgba(255,255,255,0.36)', background: 'none',
                border: 'none', cursor: 'pointer',
              }}
            >
              Nytt spørsmål
            </button>
          </div>
        )}

      {/* Disclaimer */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.5, paddingBottom: '32px', paddingTop: '8px' }}>
          Dette er AI-veiledning for stressmestring, ikke medisinske råd.<br />Kontakt lege ved behov.
        </div>

      </div>

      {/* Bottom nav */}
      <nav
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: "72px", display: "flex", justifyContent: "space-around", alignItems: "center",
          background: "rgba(8,18,16,0.85)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "0 32px",
        }}
      >
        {[
          { label: "I dag",   href: "/check-in?awake=true" },
          { label: "Mønster", href: "/monster" },
          { label: "Ro",      href: "/ro" },
        ].map(tab => (
          <button
            key={tab.label}
            onClick={() => window.location.href = tab.href}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", background: "none", border: "none", cursor: "pointer" }}
          >
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "transparent", marginBottom: "2px" }} />
            <span style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", fontWeight: 400 }}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>

    </main>
  )
}
