'use client'
import { useState } from 'react'

interface Props {
  onConsented: () => void
  onDeclined: () => void
}

export default function HumeConsentModal({ onConsented, onDeclined }: Props) {
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'no' | 'en'>('no')
  const [error, setError] = useState<string | null>(null)

  async function handleAccept() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/consents/hume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consented: true, language: lang })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'consent_failed')
      }
      onConsented()
    } catch (err: any) {
      setError(lang === 'no' ? 'Kunne ikke lagre samtykke. Prøv igjen.' : 'Could not save consent. Please try again.')
      setLoading(false)
    }
  }

  const ghostButton: React.CSSProperties = {
    background: 'none',
    border: '1px solid rgba(212,175,55,0.40)',
    borderRadius: '24px',
    color: '#D4AF37',
    fontSize: '13px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '12px 28px',
    cursor: 'pointer',
    fontFamily: 'inherit'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(4,18,6,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '560px', width: '100%',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '40px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/assets/munk-transparent.png" alt="The Munk" style={{ width: '64px' }} />
          <p style={{ color: '#D4AF37', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '8px' }}>THE MUNK AI</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          {(['no', 'en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              ...ghostButton,
              padding: '6px 16px',
              fontSize: '11px',
              borderColor: lang === l ? 'rgba(212,175,55,0.80)' : 'rgba(212,175,55,0.20)',
              color: lang === l ? '#D4AF37' : 'rgba(255,255,255,0.40)'
            }}>
              {l === 'no' ? 'Norsk' : 'English'}
            </button>
          ))}
        </div>

        <div style={{ width: '40px', height: '1px', background: 'rgba(212,175,55,0.30)', margin: '0 auto 24px' }} />

        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.95)', marginBottom: '16px', textAlign: 'center' }}>
            {lang === 'no' ? 'Valgfri funksjon: Emosjonsanalyse via stemme' : 'Optional Feature: Emotion Analysis via Voice'}
          </p>

          <div style={{
            maxHeight: '340px', overflowY: 'auto',
            background: 'rgba(0,0,0,0.20)',
            borderRadius: '12px', padding: '16px',
            fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7
          }}>
            {lang === 'no' ? (
              <>
                <p style={{ marginBottom: '10px', color: '#D4AF37' }}>⚠️ <strong>Dette er et tilleggssamtykke — separat fra ditt helsesamtykke.</strong></p>
                <p style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>Hva denne funksjonen gjør</strong></p>
                <p style={{ marginBottom: '10px' }}>Ved å aktivere stemmefunksjonen kan du snakke til The Munk og få refleksjoner basert på emosjonelle mønstre i stemmen din. Funksjonen er drevet av Hume AI.</p>
                <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>Hva vi analyserer:</strong></p>
                <ul style={{ paddingLeft: '16px', marginBottom: '10px' }}>
                  <li>Stemmemønstre fra dine lydopptak</li>
                  <li>Emosjonelle estimater generert av Hume AI</li>
                  <li>Kombinasjon med dine biometriske data for helhetlig refleksjon</li>
                </ul>
                <p style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>Dette er sensitive data:</strong> Biometrisk analyse av emosjoner er en særlig kategori av personopplysninger under GDPR Artikkel 9 og krever ditt separate, uttrykkelige samtykke.</p>
                <p style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>AI-transparens:</strong> Du interagerer med et AI-system (EU AI Act Art. 50). Hume AI sine estimater er ikke psykologiske diagnoser.</p>
                <p style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>Hume AI og dine data:</strong> Hume AI, Inc. (USA) behandler stemmedata under databehandleravtale med Holms Holding AS. Hume AI trener ikke modeller på dine data. Lydopptak slettes umiddelbart etter analyse.</p>
                <p style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>Deaktiver når som helst:</strong> Innstillinger → Funksjoner → Emosjonsanalyse</p>
                <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.60)' }}>Denne funksjonen er helt valgfri. The Munk fungerer fullt ut uten den.</p>
              </>
            ) : (
              <>
                <p style={{ marginBottom: '10px', color: '#D4AF37' }}>⚠️ <strong>This is a supplementary consent — separate from your health data consent.</strong></p>
                <p style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>What this feature does</strong></p>
                <p style={{ marginBottom: '10px' }}>By activating the voice feature, you can speak to The Munk and receive reflections based on emotional patterns in your voice. This feature is powered by Hume AI.</p>
                <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>What we analyse:</strong></p>
                <ul style={{ paddingLeft: '16px', marginBottom: '10px' }}>
                  <li>Voice patterns from your audio recordings</li>
                  <li>Emotional state estimates generated by Hume AI</li>
                  <li>Combination with your biometric data for holistic reflection</li>
                </ul>
                <p style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>This is sensitive data:</strong> Biometric analysis of emotions is a special category of personal data under GDPR Article 9 and requires your separate, explicit consent.</p>
                <p style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>AI Transparency:</strong> You are interacting with an AI system (EU AI Act Art. 50). Hume AI estimates are not psychological diagnoses.</p>
                <p style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>Hume AI and your data:</strong> Hume AI, Inc. (USA) processes voice data under a Data Processing Agreement with Holms Holding AS. Hume AI does not train models on your data. Audio recordings are deleted immediately after analysis.</p>
                <p style={{ marginBottom: '10px' }}><strong style={{ color: 'rgba(255,255,255,0.95)' }}>Deactivate at any time:</strong> Settings → Features → Emotion Analysis</p>
                <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.60)' }}>This feature is entirely optional. The Munk operates fully without it.</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <p style={{ color: 'rgba(220,80,80,0.90)', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleAccept}
            disabled={loading}
            style={{
              background: '#D4AF37',
              color: '#000',
              border: 'none',
              borderRadius: '24px',
              padding: '14px 32px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? '...' : (lang === 'no' ? 'Aktiver funksjon' : 'Enable feature')}
          </button>
          <button
            onClick={onDeclined}
            disabled={loading}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.20)',
              borderRadius: '24px',
              color: 'rgba(255,255,255,0.60)',
              padding: '14px 32px',
              fontSize: '13px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {lang === 'no' ? 'Ikke nå' : 'Not now'}
          </button>
        </div>
      </div>
    </div>
  )
}
