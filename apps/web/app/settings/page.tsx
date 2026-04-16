'use client'
import { useEffect, useState } from 'react'

type ConsentState = {
  biometric_emotion_v1: boolean
  consent_timestamp: string | null
}

export default function SettingsPage() {
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function loadStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/consents/hume/status')
      const data = await res.json()
      setConsent({
        biometric_emotion_v1: data.consented === true,
        consent_timestamp: data.timestamp || null
      })
    } catch (err) {
      setConsent({ biometric_emotion_v1: false, consent_timestamp: null })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  async function handleDeactivate() {
    if (!confirm('Er du sikker på at du vil deaktivere emosjonsanalyse? Mikrofonen vil bli sperret, og du må gi nytt samtykke for å bruke funksjonen igjen.')) {
      return
    }
    setUpdating(true)
    setMessage(null)
    try {
      const res = await fetch('/api/consents/hume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consented: false, language: 'no' })
      })
      if (!res.ok) throw new Error('deactivation_failed')
      setMessage('Emosjonsanalyse er deaktivert og dine preferanser er oppdatert.')
      await loadStatus()
    } catch (err) {
      setMessage('Kunne ikke deaktivere. Prøv igjen.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(180deg, #0a1c16 0%, #081210 100%)',
      fontFamily: '"Crimson Pro", serif',
      padding: '40px 24px',
      color: 'rgba(255,255,255,0.90)'
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="/assets/munk-transparent.png" alt="The Munk" style={{ width: '72px', marginBottom: '12px' }} />
          <p style={{ color: '#D4AF37', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>INNSTILLINGER</p>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 400, marginBottom: '8px' }}>Dine samtykker</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px', lineHeight: 1.6 }}>
          Her kan du administrere hvilke data The Munk har tilgang til. Du kan trekke tilbake samtykke når som helst.
        </p>

        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: '14px' }}>Laster...</p>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                  Emosjonsanalyse via stemme
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.50)' }}>
                  Hume AI · GDPR Artikkel 9
                </p>
              </div>
              <div style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: consent?.biometric_emotion_v1 ? 'rgba(100,180,140,0.20)' : 'rgba(255,255,255,0.08)',
                color: consent?.biometric_emotion_v1 ? 'rgba(120,200,160,0.95)' : 'rgba(255,255,255,0.50)'
              }}>
                {consent?.biometric_emotion_v1 ? 'Aktiv' : 'Inaktiv'}
              </div>
            </div>

            {consent?.biometric_emotion_v1 && consent.consent_timestamp && (
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.40)', marginBottom: '16px' }}>
                Samtykke gitt: {new Date(consent.consent_timestamp).toLocaleString('no-NO')}
              </p>
            )}

            {consent?.biometric_emotion_v1 ? (
              <button
                onClick={handleDeactivate}
                disabled={updating}
                style={{
                  background: 'none',
                  border: '1px solid rgba(220,80,80,0.50)',
                  borderRadius: '20px',
                  color: 'rgba(220,120,120,0.90)',
                  padding: '10px 20px',
                  fontSize: '12px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: updating ? 'wait' : 'pointer',
                  opacity: updating ? 0.6 : 1
                }}
              >
                {updating ? 'Deaktiverer...' : 'Deaktiver'}
              </button>
            ) : (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
                Gå til <a href="/munk" style={{ color: '#D4AF37' }}>/munk</a> for å aktivere.
              </p>
            )}
          </div>
        )}

        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(100,180,140,0.10)',
            border: '1px solid rgba(100,180,140,0.30)',
            color: 'rgba(180,220,200,0.95)',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <a href="/munk" style={{
            color: 'rgba(255,255,255,0.50)',
            fontSize: '12px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none'
          }}>
            &#8592; Tilbake til The Munk
          </a>
        </div>
      </div>
    </div>
  )
}
