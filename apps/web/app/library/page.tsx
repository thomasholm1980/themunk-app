'use client'

import { useState, useEffect } from 'react'
import { useAtmosphere } from '../../hooks/useAtmosphere'

type CardType = 'hero' | 'podcast' | 'tips' | 'video' | 'instagram' | 'article' | 'poll'

interface LibraryCard {
  id: string
  type: CardType
  source: string
  title: string
  description?: string
  url?: string
  duration?: string
}

const CARDS: LibraryCard[] = [
  { id: 'tips-1', type: 'tips', source: 'MUNKENS TIPS', title: 'Hva HRV faktisk betyr', description: 'HRV-tallet ditt forteller ikke hvor stresset du er akkurat nå. Det forteller hvor godt kroppen din har restituert seg. Lavt tall = kroppen jobber fortsatt. Høyt tall = kroppen er klar.' },
  { id: 'podcast-1', type: 'podcast', source: 'SPOTIFY · PODCAST', title: 'Leger om livet med Torkil Færø', description: 'Lege Torkil Færø snakker om HRV, optimal stressbalanse, mat, søvn og restitusjon. Norges fremste stemme på kropp og stress.', url: 'https://open.spotify.com/episode/7osLNbvZPeb8gRBqfDEIav', duration: 'Lang · Norsk' },
  { id: 'poll-1', type: 'poll', source: 'SJEKK INN', title: 'Stemmer tallene med din opplevelse?', description: 'Oura sier moderat stress. Hva sier kroppen din?' },
  { id: 'video-1', type: 'video', source: 'HUBERMAN LAB · PODCAST', title: 'Essentials: Tools for Managing Stress & Anxiety', description: 'Huberman Lab kortversjon. Forklarer stressrespons, nervesystem og konkrete verktøy du kan bruke i dag.', url: 'https://www.hubermanlab.com/episode/essentials-tools-for-managing-stress-anxiety', duration: '30 min · Engelsk' },
  { id: 'instagram-1', type: 'instagram', source: 'INSTAGRAM', title: '@dr.annettedragland', description: 'Norsk lege med faglig, tilgjengelig innhold om stress, søvn og nervesystem. En av Norges viktigste stemmer på kropp og helse.', url: 'https://instagram.com/dr.annettedragland' },
  { id: 'podcast-hjernesterk', type: 'podcast', source: 'APPLE PODCASTS · NORSK', title: 'Hjernesterk med Mads og Ole Petter', description: 'Norsk podkast om fysisk aktivitet og mental helse. Faktabasert, maskulin tone. Om sammenhengen mellom kropp, bevegelse og stressmestring.', url: 'https://podcasts.apple.com/no/podcast/hjernesterk/id1515527327', duration: 'Norsk · Ulike lengder' },
  { id: 'tips-2', type: 'tips', source: 'MUNKENS TIPS', title: 'Morgenvinduet', description: 'De første 90 minuttene etter at du våkner setter tonen for nervesystemet ditt resten av dagen. Kroppen din vet allerede hva som venter. The Munk hjelper deg lese den.' },
  { id: 'podcast-2', type: 'podcast', source: 'PETER ATTIA · PODCAST', title: 'HRV: Mål, tolke og bruk', description: 'Peter Attia og Joel Jamieson går dypt inn i HRV — hva tallene betyr og hvordan restitusjon henger sammen med stressnivå.', url: 'https://peterattiamd.com/joeljamieson/', duration: 'Lang · Engelsk' },
  { id: 'video-2', type: 'video', source: 'TED · VIDEO', title: 'Sleep is your superpower', description: 'Matt Walker forklarer søvn og stressloopen på 20 minutter. Kortfattet, faktabasert og direkte relevant for deg som vil restituere bedre.', url: 'https://www.ted.com/talks/matt_walker_sleep_is_your_superpower', duration: '20 min · Engelsk' },
  { id: 'tips-3', type: 'tips', source: 'MUNKENS TIPS', title: 'Stress er ikke fienden', description: 'Kroppen din er ikke ødelagt når stressnivået er høyt. Den reagerer på noe. Det viktige spørsmålet er ikke om du har stress, men om du faktisk restituerer.' },
  { id: 'podcast-3', type: 'podcast', source: 'SPOTIFY · PODCAST', title: 'Søvnpodden', description: 'Norsk søvnpodkast for alle som vil lære mer om søvn. Faglig tyngde, norsk språk — søvn og stress henger tettere sammen enn du tror.', url: 'https://open.spotify.com/show/27qcaWQ1ZB7gaC1BvtPQzR', duration: 'Ulike lengder · Norsk' },
]

const TYPE_ICON: Record<CardType, string> = { hero: '✦', podcast: '🎙', tips: '✦', video: '▶', instagram: '◈', article: '◎', poll: '◐' }

function PollCard() {
  const [selected, setSelected] = useState<string | null>(null)
  const options = ['Mye mer', 'Litt mer', 'Stemmer', 'Litt mindre']
  return (
    <div className="flex flex-col gap-3">
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.70)', lineHeight: 1.6 }}>Oura sier moderat stress. Hva sier kroppen din?</p>
      <div className="grid grid-cols-2 gap-2 mt-1">
        {options.map(opt => (
          <button key={opt} onClick={() => setSelected(opt)} style={{ padding: '10px 8px', borderRadius: '12px', border: selected === opt ? '1px solid rgba(212,175,55,0.6)' : '1px solid rgba(255,255,255,0.10)', background: selected === opt ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)', color: selected === opt ? '#D4AF37' : 'rgba(255,255,255,0.60)', fontSize: '13px', cursor: 'pointer', transition: 'all 200ms ease' }}>{opt}</button>
        ))}
      </div>
      {selected && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: '4px' }}>Takk. Munken tar dette med i tolkningen.</p>}
    </div>
  )
}

function CardItem({ card }: { card: LibraryCard }) {
  const [saved, setSaved] = useState(false)
  const isTips = card.type === 'tips'
  const isPoll = card.type === 'poll'
  return (
    <div style={{ background: isTips ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: `1px solid ${isTips ? 'rgba(212,175,55,0.20)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: '0 0 auto 0', height: '1px', background: isTips ? 'linear-gradient(to right, transparent, rgba(212,175,55,0.15), transparent)' : 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
      <div style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: isTips ? 'rgba(212,175,55,0.60)' : 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>{TYPE_ICON[card.type]} {card.source}</div>
      <div style={{ fontSize: '17px', fontWeight: 600, color: 'rgba(255,255,255,0.95)', lineHeight: 1.3, marginBottom: '10px', fontFamily: 'var(--font-crimson), ui-serif, Georgia, serif' }}>{card.title}</div>
      {isPoll ? <PollCard /> : <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, marginBottom: card.url ? '16px' : '0' }}>{card.description}</p>}
      {(card.url || card.duration) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {card.duration && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.30)' }}>{card.duration}</span>}
          <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
            <button onClick={() => setSaved(s => !s)} style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: saved ? 'rgba(212,175,55,0.80)' : 'rgba(255,255,255,0.30)', background: 'none', border: 'none', cursor: 'pointer' }}>{saved ? '✦ Lagret' : '+ Lagre'}</button>
            {card.url && <button onClick={() => window.open(card.url, '_blank')} style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.50)', background: 'none', border: 'none', cursor: 'pointer' }}>Åpne →</button>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LibraryPage() {
  const atm = useAtmosphere()
  const [heroText, setHeroText] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/state/today', { headers: { 'x-user-id': 'thomas' } })
      .then(r => r.json())
      .then(json => {
        const hrv = json.hrv_rmssd
        const rhr = json.resting_hr
        if (hrv && rhr) {
          setHeroText(`HRV ${hrv} ms og hvilepuls ${rhr} bpm i dag. Kroppen din er i moderat beredskap — ikke på rødt, men heller ikke i full hvile. Innholdet under er valgt for akkurat dette.`)
        } else {
          setHeroText('Kroppen din sender signaler hele dagen. Her er innhold som hjelper deg lese dem bedre.')
        }
      })
      .catch(() => setHeroText('Kroppen din sender signaler hele dagen. Her er innhold som hjelper deg lese dem bedre.'))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${atm.gradientFrom} 0%, ${atm.gradientTo} 100%)`, transition: 'background 3s ease-in-out', color: '#fff', paddingBottom: '96px' }}>
      <svg aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.015, pointerEvents: 'none', zIndex: 1, mixBlendMode: 'overlay' as const }}>
        <filter id="lib-grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#lib-grain)" />
      </svg>

      <div style={{ maxWidth: '384px', margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{ paddingTop: '20px', paddingBottom: '8px' }}>
          <button onClick={() => window.location.href = '/check-in?awake=true'} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.40)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 16px 0', display: 'block' }}>← Tilbake</button>
          <div style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Bibliotek</div>
          <div style={{ fontSize: '26px', fontWeight: 600, fontFamily: 'var(--font-crimson), ui-serif, Georgia, serif', marginBottom: '20px' }}>Valgt for deg</div>
        </div>

        {/* Hero-kort */}
        <div style={{ background: 'rgba(212,175,55,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: '24px', padding: '24px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: '0 0 auto 0', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.20), transparent)' }} />
          <div style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.60)', marginBottom: '10px' }}>✦ DAGENS INNSIKT</div>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.80)', lineHeight: 1.6 }}>{heroText ?? 'Laster dagens signaler...'}</p>
        </div>

        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {CARDS.map(card => <CardItem key={card.id} card={card} />)}
        </div>
      </div>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '72px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'rgba(8,18,16,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', zIndex: 50 }}>
        {[{ label: 'I dag', href: '/check-in?awake=true' }, { label: 'Mønster', href: '/monster' }, { label: 'Ro', href: '/ro' }].map(tab => (
          <button key={tab.label} onClick={() => window.location.href = tab.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'transparent', marginBottom: '2px' }} />
            <span style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', fontWeight: 400 }}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
