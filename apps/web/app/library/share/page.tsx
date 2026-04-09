'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function ShareHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'analyserer' | 'lagret' | 'feil'>('analyserer')

  useEffect(() => {
    const url = searchParams.get('url') || searchParams.get('text') || ''
    if (!url) {
      router.replace('/library')
      return
    }

    // Ekstraher URL fra tekst hvis nødvendig
    const urlMatch = url.match(/https?:\/\/[^\s]+/)
    const cleanUrl = urlMatch ? urlMatch[0] : url

    fetch('/api/library/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setStatus('lagret')
          setTimeout(() => router.replace('/library?tab=saved'), 1500)
        } else {
          setStatus('feil')
          setTimeout(() => router.replace('/library'), 2000)
        }
      })
      .catch(() => {
        setStatus('feil')
        setTimeout(() => router.replace('/library'), 2000)
      })
  }, [searchParams, router])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, #2F5D54 0%, #1C3A34 40%, #0F1F1C 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#f0ebe3',
      fontFamily: 'var(--font-crimson), ui-serif, Georgia, serif',
      gap: '24px',
      padding: '32px',
    }}>
      {status === 'analyserer' && (
        <>
          <div style={{
            width: '48px',
            height: '48px',
            border: '2px solid rgba(212,175,55,0.20)',
            borderTop: '2px solid #D4AF37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.60)', marginBottom: '8px' }}>THE MUNK</p>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.80)', margin: 0 }}>Munken analyserer...</p>
          </div>
        </>
      )}
      {status === 'lagret' && (
        <>
          <div style={{ fontSize: '32px' }}>✦</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.60)', marginBottom: '8px' }}>THE MUNK</p>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.80)', margin: 0 }}>Lenken er lagret i ditt bibliotek</p>
          </div>
        </>
      )}
      {status === 'feil' && (
        <>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.60)', marginBottom: '8px' }}>THE MUNK</p>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.50)', margin: 0 }}>Kunne ikke lagre lenken. Prøver igjen...</p>
          </div>
        </>
      )}
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0F1F1C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid rgba(212,175,55,0.20)', borderTop: '2px solid #D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <ShareHandler />
    </Suspense>
  )
}
