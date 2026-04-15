'use client'
import { useState, useEffect } from 'react'
import HumeVoice from '../components/hume/HumeVoice'
import { analyzeDissonance, DissonanceResult, HumeEmotions, OuraContext } from '../../lib/dissonanceEngine'
import { startBinaural, stopBinaural } from '../../lib/binauralEngine'

type PageState = 'idle' | 'listening' | 'result'

export default function MunkPage() {
  const [pageState, setPageState] = useState<PageState>('idle')
  const [result, setResult] = useState<DissonanceResult | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [ouraContext, setOuraContext] = useState<OuraContext | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Fetch today's Oura context
    fetch('/api/state/today')
      .then(r => r.json())
      .then(data => {
        if (data.hrv && data.rhr) {
          setOuraContext({
            hrv: data.hrv,
            hrv_7day_avg: data.hrv * 1.15, // fallback estimate
            rhr: data.rhr,
            rhr_baseline: data.rhr * 0.95
          })
        }
      })
      .catch(() => {})
  }, [])

  function handleEmotionDetected(emotions: { name: string; score: number }[]) {
    if (!ouraContext) return
    const emotionMap: HumeEmotions = {}
    emotions.forEach(e => { emotionMap[e.name] = e.score })
    const analysis = analyzeDissonance(ouraContext, emotionMap)
    if (analysis.mode) {
      setResult(analysis)
      setPageState('result')
      if (analysis.binauralHz) startBinaural(analysis.binauralHz)
    }
  }

  function handleReset() {
    stopBinaural()
    setResult(null)
    setTranscript('')
    setPageState('idle')
  }

  const modeColors: Record<string, string> = {
    SUPPORTIVE: '#D4AF37',
    ACCEPTANCE: 'rgba(100,180,140,0.90)',
    AUTHORITY:  'rgba(200,80,80,0.90)'
  }

  const modeLabels: Record<string, string> = {
    SUPPORTIVE: 'Supportive Mode',
    ACCEPTANCE: 'Acceptance Mode',
    AUTHORITY:  'Authority Mode'
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%', position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
      fontFamily: '"Crimson Pro", serif',
      background: 'linear-gradient(180deg, #0a1c16 0%, #081210 100%)'
    }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('/images/munk-bg-leaf.jpg')",
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.20
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,28,22,0.70) 0%, rgba(8,18,16,0.80) 100%)'
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px', textAlign: 'center' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <img src="/assets/munk-transparent.png" alt="The Munk"
            style={{ width: '80px', marginBottom: '12px' }} />
          <p style={{ fontSize: '11px', color: '#D4AF37', letterSpacing: '0.3em',
            textTransform: 'uppercase' }}>The Munk</p>
        </div>

        {pageState === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h1 style={{ fontSize: '28px', color: 'rgba(255,255,255,0.95)', fontWeight: 400, margin: 0 }}>
              Tell me how you are.
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.7 }}>
              Speak freely. The Munk listens to both your words and your body.
            </p>
            {!ouraContext && (
              <p style={{ fontSize: '12px', color: 'rgba(212,175,55,0.50)', margin: 0 }}>
                No biometric data — connect Oura for full analysis
              </p>
            )}
            <div style={{ marginTop: '8px' }}>
              <HumeVoice
                onEmotionDetected={handleEmotionDetected}
                onTranscript={t => { setTranscript(t); setPageState('listening') }}
              />
            </div>
          </div>
        )}

        {pageState === 'listening' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h1 style={{ fontSize: '24px', color: 'rgba(255,255,255,0.95)', fontWeight: 400, margin: 0 }}>
              The Munk is listening...
            </h1>
            {transcript && (
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic',
                maxWidth: '360px', lineHeight: 1.7 }}>
                "{transcript}"
              </p>
            )}
            <HumeVoice
              onEmotionDetected={handleEmotionDetected}
              onTranscript={t => setTranscript(t)}
            />
          </div>
        )}

        {pageState === 'result' && result && result.mode && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)',
              border: `1px solid ${modeColors[result.mode]}40`,
              borderRadius: '20px', padding: '28px 24px', width: '100%'
            }}>
              <p style={{ fontSize: '10px', color: modeColors[result.mode],
                letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '12px' }}>
                {modeLabels[result.mode]}
              </p>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.70)',
                lineHeight: 1.75, marginBottom: '16px' }}>
                {result.trigger}
              </p>
              {result.binauralHz && (
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.30)',
                  letterSpacing: '0.1em' }}>
                  ♪ Binaural {result.binauralHz} Hz active
                </p>
              )}
            </div>

            <button onClick={handleReset} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '24px', color: 'rgba(255,255,255,0.50)',
              fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '10px 24px', cursor: 'pointer'
            }}>
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
