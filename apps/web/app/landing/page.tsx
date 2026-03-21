'use client'
import { useState } from 'react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) { setStatus('success') } else { setStatus('error') }
    } catch { setStatus('error') }
  }

  return (
    <div style={{width:'100%',background:'#faf8f4',fontFamily:'"Outfit",sans-serif',color:'#2a2a2a',WebkitFontSmoothing:'antialiased'}}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{padding:'16px 44px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'0.5px solid rgba(42,42,42,0.08)',background:'#faf8f4',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center'}}>
          <img src="/assets/munk-logo.png" alt="The Munk" style={{height:'52px',width:'52px',objectFit:'contain',borderRadius:'50%'}} />
          <div style={{fontFamily:'"Lora",serif',fontSize:'15px',fontWeight:600,letterSpacing:'3px',color:'#1a1a1a',textTransform:'uppercase',marginLeft:'12px'}}>
            The Munk<span style={{fontSize:'9px',color:'#c8a84b',letterSpacing:'2px',fontFamily:'"Outfit",sans-serif',fontWeight:400}}>AI</span>
          </div>
        </div>
        <a href="#signup" style={{fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(42,42,42,0.5)',fontWeight:500,textDecoration:'none'}}>Bli med i testen</a>
      </nav>

      {/* HERO */}
      <div style={{maxWidth:'1100px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'48px',padding:'64px 44px 56px',alignItems:'start'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',color:'#2d5a3d',fontWeight:500,marginBottom:'24px',letterSpacing:'0.5px'}}>
            <span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#c8a84b',flexShrink:0,display:'inline-block'}}></span>
            Stress-forståelse for norske menn
          </div>
          <h1 style={{fontFamily:'"Lora",serif',fontSize:'46px',lineHeight:1.15,color:'#1a1a1a',marginBottom:'20px',fontWeight:400}}>
            Du er mer<br />stresset enn<br /><em style={{color:'#2d5a3d',fontStyle:'italic'}}>du tror.</em>
          </h1>
          <p style={{fontSize:'15px',lineHeight:1.7,color:'rgba(42,42,42,0.62)',fontWeight:300}}>
            The Munk AI leser dine bærbare enheter og forteller deg — på vanlig norsk — hva stresset gjør i kroppen din. Hver dag. Ikke tall. Ikke grafer. Bare forståelse.
          </p>
        </div>
        <div id="signup">
          <div style={{background:'#fff',border:'0.5px solid rgba(42,42,42,0.1)',borderRadius:'8px',padding:'32px 28px'}}>
            <div style={{fontFamily:'"Lora",serif',fontSize:'20px',color:'#1a1a1a',marginBottom:'8px',fontWeight:600}}>Bli med i testen</div>
            <div style={{fontSize:'13px',color:'rgba(42,42,42,0.5)',marginBottom:'24px',fontWeight:300}}>Vi inviterer nå et begrenset antall til å teste The Munk.</div>
            {status === 'success' ? (
              <div style={{padding:'20px 0 8px'}}>
                <div style={{display:'inline-flex',alignItems:'center',gap:'8px',fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',color:'#2d5a3d',fontWeight:500,marginBottom:'16px'}}>
                  <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#2d5a3d',flexShrink:0}}></span>Registrert
                </div>
                <div style={{fontFamily:'"Lora",serif',fontSize:'24px',color:'#1a1a1a',marginBottom:'10px',fontWeight:600,lineHeight:1.2}}>Takk — du er med.</div>
                <div style={{fontSize:'14px',color:'rgba(42,42,42,0.62)',lineHeight:1.7,fontWeight:300}}>Vi åpner gradvis for testbrukere.<br />Du får beskjed når vi er klare.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Din e-postadresse" value={email} onChange={e => setEmail(e.target.value)} required disabled={status === 'loading'}
                  style={{width:'100%',border:'0.5px solid rgba(42,42,42,0.2)',borderRadius:'4px',padding:'12px 16px',fontFamily:'"Outfit",sans-serif',fontSize:'14px',color:'#2a2a2a',background:'#faf8f4',marginBottom:'12px',outline:'none',boxSizing:'border-box'}} />
                <button type="submit" disabled={status === 'loading'}
                  style={{width:'100%',background:'#2d5a3d',color:'#f0ece2',fontFamily:'"Outfit",sans-serif',fontSize:'14px',fontWeight:500,padding:'14px 30px',border:'none',borderRadius:'4px',cursor:'pointer',display:'block'}}>
                  {status === 'loading' ? 'Sender...' : 'Bli med i testen'}
                </button>
                {status === 'error' && <div style={{fontSize:'12px',color:'#b94040',marginTop:'8px'}}>Noe gikk galt. Prøv igjen om litt.</div>}
                <div style={{fontSize:'11px',color:'rgba(42,42,42,0.38)',marginTop:'14px',lineHeight:1.6}}>Gratis i testperioden. Ingen binding. Vi sender kun relevant informasjon.</div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div style={{maxWidth:'1100px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',padding:'0 44px 56px'}}>
        {[
          {t:'Leser din wearable',b:'Oura, Apple Watch, Garmin eller Whoop (støtte utvides fortløpende).'},
          {t:'Én brief per dag',b:'En kort forklaring på vanlig norsk, hver morgen.'},
          {t:'Ser mønstrene dine',b:'Over tid ser The Munk hvordan stresset ditt bygger seg opp — og hva kroppen din prøver å si.'},
          {t:'Ingen optimalisering',b:'Vi forteller deg ikke hva du skal prestere. Vi hjelper deg å forstå hva som skjer.'},
        ].map(c => (
          <div key={c.t} style={{background:'#fff',border:'0.5px solid rgba(42,42,42,0.09)',borderRadius:'6px',padding:'24px 20px'}}>
            <div style={{fontFamily:'"Lora",serif',fontSize:'15px',color:'#1a1a1a',marginBottom:'8px',fontWeight:600}}>{c.t}</div>
            <div style={{fontSize:'13px',color:'rgba(42,42,42,0.55)',lineHeight:1.65,fontWeight:300}}>{c.b}</div>
          </div>
        ))}
      </div>

      {/* BRIEF */}
      <div style={{width:'100%',background:'#2d3d2d',padding:'56px 44px'}}>
        <div style={{maxWidth:'680px'}}>
          <div style={{fontSize:'10px',letterSpacing:'3px',textTransform:'uppercase',color:'rgba(240,235,224,0.35)',marginBottom:'16px'}}>Eksempel — daglig brief</div>
          <div style={{display:'inline-block',background:'rgba(200,168,75,0.2)',color:'#c8a84b',fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',padding:'4px 12px',borderRadius:'2px',marginBottom:'22px',border:'0.5px solid rgba(200,168,75,0.3)'}}>Moderat stress</div>
          <div style={{fontSize:'15px',color:'rgba(240,235,224,0.85)',lineHeight:1.75,marginBottom:'24px'}}>
            Moderat stress i dag.<br />Lav HRV og forhøyet hvilepuls — kroppen er ikke ferdig restituert.<br />Hold stressnivået lavt i dag.
          </div>
          <div style={{display:'flex',gap:'32px',paddingTop:'20px',borderTop:'0.5px solid rgba(240,235,224,0.1)',flexWrap:'wrap'}}>
            {[{v:'38 ms',l:'HRV · lav'},{v:'5t 42 min',l:'Søvn · lett'},{v:'62 bpm',l:'Hvilepuls · høyere enn normalt'}].map(s => (
              <div key={s.l} style={{fontSize:'11px',color:'rgba(240,235,224,0.4)'}}>
                <strong style={{display:'block',fontSize:'16px',color:'rgba(240,235,224,0.75)',fontWeight:500,marginBottom:'3px'}}>{s.v}</strong>{s.l}
              </div>
            ))}
          </div>
          <div style={{fontSize:'11px',color:'rgba(240,235,224,0.25)',letterSpacing:'1px',marginTop:'18px'}}>The Munk · Onsdag 06:47</div>
        </div>
      </div>

      {/* CTA */}
      <div style={{width:'100%',background:'#1e2e1e',padding:'64px 44px'}}>
        <div style={{fontFamily:'"Lora",serif',fontSize:'38px',color:'#f0ece2',fontWeight:400,marginBottom:'12px'}}>Gratis i testperioden</div>
        <div style={{fontSize:'14px',color:'rgba(240,235,224,0.45)',marginBottom:'32px',fontWeight:300}}>Begrenset antall plasser. Ingen binding.</div>
        <a href="#signup" style={{background:'transparent',color:'#f0ece2',fontFamily:'"Outfit",sans-serif',fontSize:'13px',fontWeight:500,padding:'12px 28px',border:'0.5px solid rgba(240,235,224,0.4)',borderRadius:'2px',cursor:'pointer',display:'inline-block',textDecoration:'none'}}>Bli med i testen</a>
      </div>

      {/* FOOTER */}
      <div style={{width:'100%',background:'#1a2a1a',padding:'28px 44px',borderTop:'0.5px solid rgba(240,235,224,0.06)'}}>
        <div style={{fontSize:'13px',color:'rgba(240,235,224,0.4)',marginBottom:'6px'}}>Følg utviklingen av The Munk</div>
        <div style={{fontSize:'12px',color:'rgba(240,235,224,0.4)',marginBottom:'10px'}}>Jeg deler hvordan stress faktisk ser ut i kroppen — hver dag.</div>
        <a href="https://x.com/themunk_ai" target="_blank" rel="noopener" style={{fontSize:'13px',color:'rgba(200,168,75,0.7)',textDecoration:'none'}}>→ Følg på X</a>
      </div>
    </div>
  )
}
