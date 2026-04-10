'use client'
import { useState } from 'react'

interface Props {
  userId: string
  onConsented: () => void
}

export default function LegalOnboarding({ userId, onConsented }: Props) {
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'no' | 'en'>('no')

  async function handleAccept() {
    if (!checked) return
    setLoading(true)
    try {
      await fetch('/api/legal-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ consented: true })
      })
      onConsented()
    } catch {
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
          <p style={{ color: '#D4AF37', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
            {lang === 'no' ? 'Ansvarsfraskrivelse' : 'Medical Disclaimer'}
          </p>
          <div style={{
            maxHeight: '200px', overflowY: 'auto',
            background: 'rgba(0,0,0,0.20)',
            borderRadius: '12px', padding: '16px',
            fontSize: '13px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.7
          }}>
            {lang === 'no' ? (
              <>
                <p style={{ marginBottom: '10px' }}>The Munk AI er en digital refleksjonsassistent. <strong style={{ color: 'rgba(255,255,255,0.90)' }}>The Munk AI er ikke en medisinsk tjeneste og ikke en erstatning for profesjonell helsehjelp.</strong></p>
                <p style={{ marginBottom: '6px' }}>The Munk AI diagnostiserer ikke sykdom, foreskriver ikke behandling, og erstatter ikke lege eller annet helsepersonell.</p>
                <p style={{ marginBottom: '6px' }}>Brukeren er eneansvarlig for sine helsebeslutninger. Ved symptomer på sykdom oppfordres brukeren til å kontakte kvalifisert helsepersonell umiddelbart.</p>
                <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#D4AF37' }}>«Du kontrollerer ikke hendelsene — du kontrollerer din respons på dem.»</p>
              </>
            ) : (
              <>
                <p style={{ marginBottom: '10px' }}>The Munk AI is a digital reflection assistant. <strong style={{ color: 'rgba(255,255,255,0.90)' }}>The Munk AI is not a medical service and is not a substitute for professional healthcare.</strong></p>
                <p style={{ marginBottom: '6px' }}>The Munk AI does not diagnose disease, prescribe treatment, or replace any healthcare professional.</p>
                <p style={{ marginBottom: '6px' }}>The user is solely responsible for their health decisions. Contact qualified healthcare professionals immediately in case of illness.</p>
                <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#D4AF37' }}>"You do not control events — you control your response to them."</p>
              </>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: '#D4AF37', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
            {lang === 'no' ? 'Samtykke til helseopplysninger' : 'Health Data Consent'}
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.20)',
            borderRadius: '12px', padding: '16px',
            fontSize: '13px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.7,
            marginBottom: '16px'
          }}>
            {lang === 'no' ? (
              <>
                <p style={{ marginBottom: '8px' }}>Ved å huke av denne boksen gir du <strong style={{ color: 'rgba(255,255,255,0.90)' }}>Holms Holding AS («The Munk AI»)</strong> ditt uttrykkelige samtykke til å behandle:</p>
                <ul style={{ paddingLeft: '16px', marginBottom: '8px' }}>
                  <li>Søvndata (søvnfaser, varighet, kvalitet)</li>
                  <li>Hjerteratevariabilitet (HRV)</li>
                  <li>Hvilepuls og hjertefrekvens</li>
                  <li>Aktivitetsdata og restitusjonsscore</li>
                </ul>
                <p style={{ marginBottom: '8px' }}>Data overføres til Anthropic, Inc. (USA) via kryptert API utelukkende for AI-analyse. Lagres hos Supabase (EU) i 24 måneder.</p>
                <p>Samtykke kan trekkes tilbake via Innstillinger → Tilkoblinger → Fjern Oura-tilgang.</p>
              </>
            ) : (
              <>
                <p style={{ marginBottom: '8px' }}>By checking this box, you grant <strong style={{ color: 'rgba(255,255,255,0.90)' }}>Holms Holding AS ("The Munk AI")</strong> your explicit consent to process:</p>
                <ul style={{ paddingLeft: '16px', marginBottom: '8px' }}>
                  <li>Sleep data (stages, duration, quality)</li>
                  <li>Heart rate variability (HRV)</li>
                  <li>Resting heart rate and pulse</li>
                  <li>Activity data and recovery scores</li>
                </ul>
                <p style={{ marginBottom: '8px' }}>Data is transmitted to Anthropic, Inc. (USA) via encrypted API for AI analysis only. Stored with Supabase (EU) for 24 months.</p>
                <p>You may withdraw consent via Settings → Connections → Remove Oura Access.</p>
              </>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              style={{ marginTop: '3px', accentColor: '#D4AF37', width: '16px', height: '16px', flexShrink: 0 }}
            />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
              {lang === 'no'
                ? 'Jeg bekrefter at jeg har lest og forstått erklæringen, og gir mitt uttrykkelige samtykke til behandling av mine sensitive helseopplysninger i henhold til GDPR Artikkel 9.'
                : 'I confirm that I have read and understood this statement, and I hereby provide my explicit consent to the processing of my sensitive health data pursuant to GDPR Article 9.'}
            </span>
          </label>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleAccept}
            disabled={!checked || loading}
            style={{
              background: checked ? '#D4AF37' : 'rgba(212,175,55,0.20)',
              color: checked ? '#000' : 'rgba(255,255,255,0.30)',
              border: 'none',
              borderRadius: '24px',
              padding: '14px 40px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: checked ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            {loading ? '...' : (lang === 'no' ? 'Jeg godtar' : 'I agree')}
          </button>
        </div>
      </div>
    </div>
  )
}
