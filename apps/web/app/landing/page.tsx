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
    <div style={{ width:'100%', minHeight:'100vh', background:'linear-gradient(160deg, #081609 0%, #112915 100%)', fontFamily:'"Outfit",sans-serif', color:'#fff', position:'relative', overflow:'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />

      <svg aria-hidden="true" style={{ position:'fixed',top:0,left:0,width:'100%',height:'100%',opacity:0.015,pointerEvents:'none',zIndex:1,mixBlendMode:'overlay' }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <div style={{ position:'fixed',top:'-10%',left:'-10%',width:'60vw',height:'60vw',borderRadius:'50%',background:'radial-gradient(circle, rgba(26,77,46,0.12) 0%, transparent 70%)',filter:'blur(80px)',pointerEvents:'none',zIndex:0 }} />
      <div style={{ position:'fixed',bottom:'-20%',right:'-10%',width:'70vw',height:'70vw',borderRadius:'50%',background:'radial-gradient(circle, rgba(14,47,26,0.08) 0%, transparent 70%)',filter:'blur(100px)',pointerEvents:'none',zIndex:0 }} />

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        .shell{max-width:960px;margin:0 auto;padding:0 44px;}
        .hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;padding:56px 0 56px;align-items:start;}
        .hero-left{display:flex;flex-direction:column;}
        .hero-visuals{display:flex;align-items:center;justify-content:flex-start;margin-bottom:32px;}
        .cards-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-bottom:56px;}
        @media(max-width:720px){
          .shell{padding:0 20px;}
          .hero-grid{grid-template-columns:1fr;gap:24px;padding:24px 0 40px;}
          .hero-visuals{justify-content:center;margin-bottom:20px;}
          .cards-grid{grid-template-columns:1fr;}
          h1{font-size:36px!important;margin-bottom:16px!important;}
          .eyebrow{margin-bottom:16px!important;}
          .hero-text-block{margin-bottom:24px!important;}
        }
      `}</style>

      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)',position:'sticky',top:0,zIndex:100,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',background:'rgba(8,22,9,0.80)' }}>
        <div className="shell" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 44px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
            <img src="/assets/munk-logo.png" alt="The Munk" style={{ height:'40px',width:'40px',objectFit:'contain',borderRadius:'50%' }} />
            <span style={{ fontFamily:'"Crimson Pro",serif',fontSize:'15px',fontWeight:600,letterSpacing:'3px',color:'#FFFFFF',textTransform:'uppercase' as const }}>
              The Munk<span style={{ fontSize:'9px',color:'#D4AF37',letterSpacing:'2px',fontFamily:'"Outfit",sans-serif',fontWeight:400 }}>AI</span>
            </span>
          </div>
          <a href="#signup" style={{ fontSize:'11px',letterSpacing:'0.2em',textTransform:'uppercase' as const,color:'rgba(255,255,255,0.45)',fontWeight:500,textDecoration:'none' }}>Bli med i testen</a>
        </div>
      </nav>

      <div className="shell" style={{ position:'relative',zIndex:10 }}>
        <div className="hero-grid">
          <div className="hero-left">

            <div className="eyebrow" style={{ display:'flex',alignItems:'center',gap:'8px',fontSize:'clamp(9.5px, 2.8vw, 14px)',color:'#D4AF37',fontWeight:500,letterSpacing:'0.12em',textTransform:'uppercase' as const,marginBottom:'28px',marginTop:'8px',whiteSpace:'nowrap' as const }}>
              <span style={{ width:'6px',height:'6px',borderRadius:'50%',background:'#D4AF37',display:'inline-block' }}></span>
              KAN DU MÅLE DET – KAN DU MESTRE DET
            </div>

            <div className="hero-visuals">
              <div style={{ position:'relative',display:'inline-block' }}>
                <div style={{ position:'absolute',top:'50%',left:'50%',width:'140px',height:'140px',borderRadius:'50%',background:'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',filter:'blur(30px)',transform:'translate(-50%, -50%)',pointerEvents:'none' }} />
                <img src="/assets/munk-transparent.png" alt="Munk" style={{ width:'180px',position:'relative',zIndex:1 }} />
              </div>
              <img src="/assets/wearables.png" alt="Wearables" style={{ width:'170px',position:'relative',zIndex:1 }} />
            </div>

            <h1 style={{ fontFamily:'"Crimson Pro",serif',fontSize:'48px',lineHeight:1.1,color:'rgba(255,255,255,0.95)',marginBottom:'20px',fontWeight:400 }}>
              Du er mer<br />stresset enn<br /><em style={{ color:'#D4AF37',fontStyle:'italic' }}>du tror.</em>
            </h1>
            <p style={{ fontFamily:'serif',fontSize:'20px',color:'#D4AF37',fontStyle:'italic',fontWeight:400,marginBottom:'24px',lineHeight:1.5 }}>Wearablen måler. The Munk AI tolker. Du mestrer.</p>

            <div className="hero-text-block" style={{ maxWidth:'400px',marginBottom:'32px' }}>
              <p style={{ fontSize:'16px',lineHeight:1.75,color:'rgba(255,255,255,0.90)',fontWeight:500,marginBottom:'20px' }}>Stress setter seg i kroppen. Ikke i hodet.</p>
              <p style={{ fontSize:'16px',lineHeight:1.75,color:'rgba(255,255,255,0.90)',fontWeight:500,marginBottom:'20px' }}>The Munk er appen som tolker dine wearables og oversetter signalene til menneskelig forståelse.</p>
              <p style={{ fontSize:'16px',lineHeight:1.75,color:'rgba(255,255,255,0.90)',fontWeight:500,marginBottom:'20px' }}>Du får én klar daglig beskjed: hva stressnivået ditt faktisk er, hvorfor, og hva du kan gjøre med det.</p>
              <p style={{ fontSize:'16px',lineHeight:1.75,color:'rgba(255,255,255,0.90)',fontWeight:600,marginBottom:'0' }}>The Munk AI vet hva kroppen din forteller deg.</p>
            </div>

          </div>

          <div id="signup">
            <div style={{ background:'rgba(255,255,255,0.03)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'32px',padding:'36px 32px',position:'relative',overflow:'hidden',marginBottom:'16px' }}>
              <div style={{ position:'absolute',inset:'0 0 auto 0',height:'1px',background:'linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent)' }} />
              <div style={{ fontFamily:'"Crimson Pro",serif',fontSize:'22px',color:'#fff',marginBottom:'8px',fontWeight:500 }}>Bli med i testen</div>
              <div style={{ fontSize:'13px',color:'rgba(255,255,255,0.90)',fontWeight:500,marginBottom:'28px' }}>Vi inviterer et begrenset antall til å teste The Munk.</div>
              {status === 'success' ? (
                <div>
                  <div style={{ display:'flex',alignItems:'center',gap:'8px',fontSize:'11px',letterSpacing:'0.2em',textTransform:'uppercase' as const,color:'#D4AF37',fontWeight:500,marginBottom:'16px' }}>
                    <span style={{ width:'6px',height:'6px',borderRadius:'50%',background:'#D4AF37' }}></span>Registrert
                  </div>
                  <div style={{ fontFamily:'"Crimson Pro",serif',fontSize:'24px',color:'#fff',marginBottom:'10px',fontWeight:500 }}>Takk — du er med.</div>
                  <div style={{ fontSize:'14px',color:'rgba(255,255,255,0.90)',lineHeight:1.7,fontWeight:500 }}>Vi åpner gradvis for testbrukere.<br />Du får beskjed når vi er klare.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <input type="email" placeholder="Din e-postadresse" value={email} onChange={e => setEmail(e.target.value)} required disabled={status==='loading'}
                    style={{ width:'100%',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',padding:'14px 18px',fontFamily:'"Outfit",sans-serif',fontSize:'14px',color:'#fff',background:'rgba(255,255,255,0.04)',marginBottom:'12px',outline:'none' }} />
                  <button type="submit" disabled={status==='loading'}
                    style={{ width:'100%',background:'rgba(212,175,55,0.90)',color:'#0d1a15',fontFamily:'"Outfit",sans-serif',fontSize:'13px',fontWeight:600,padding:'16px',border:'none',borderRadius:'14px',cursor:'pointer',letterSpacing:'0.2em',textTransform:'uppercase' as const }}>
                    {status==='loading' ? 'Sender...' : 'Bli med i testen'}
                  </button>
                  {status==='error' && <div style={{ fontSize:'12px',color:'#f87171',marginTop:'8px' }}>Noe gikk galt. Prøv igjen.</div>}
                  <div style={{ fontSize:'10px',letterSpacing:'0.2em',textTransform:'uppercase' as const,color:'rgba(255,255,255,0.40)',marginTop:'16px',lineHeight:1.8 }}>
                    The Munk er ansvarlig AI. Hver innsikt er forankret i din faktiske biologi (wearables) og verifisert medisinsk og fysiologisk kunnskap. Ingen &quot;AI-slop&quot;. Bare ekte forståelse.
                  </div>
                  <div style={{ fontSize:'11px',color:'rgba(255,255,255,0.25)',marginTop:'10px',lineHeight:1.6 }}>Gratis i testperioden. Ingen binding.</div>
                </form>
              )}
            </div>

            <div style={{ background:'rgba(255,255,255,0.03)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'24px',padding:'24px',position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',inset:'0 0 auto 0',height:'1px',background:'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
              <div style={{ fontSize:'10px',letterSpacing:'0.28em',textTransform:'uppercase' as const,color:'rgba(255,255,255,0.30)',marginBottom:'12px' }}>Eksempel: daglig brief</div>
              <div style={{ display:'inline-block',background:'rgba(212,175,55,0.15)',color:'#D4AF37',fontSize:'10px',letterSpacing:'0.2em',textTransform:'uppercase' as const,padding:'4px 12px',borderRadius:'100px',marginBottom:'14px',border:'1px solid rgba(212,175,55,0.25)' }}>Moderat stress</div>
              <div style={{ fontSize:'14px',color:'rgba(255,255,255,0.90)',lineHeight:1.7,marginBottom:'16px',fontWeight:500 }}>
                Stressnivået holder seg oppe og kroppen jobber fortsatt. Litt bevegelse, mye ro.
              </div>
              <div style={{ display:'flex',gap:'24px',paddingTop:'14px',borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                {[{v:'44 ms',l:'HRV (Oura)'},{v:'57 bpm',l:'Hvilepuls (Oura)'}].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize:'18px',fontFamily:'"Crimson Pro",serif',fontStyle:'italic',color:'rgba(255,255,255,0.90)',marginBottom:'2px' }}>{s.v}</div>
                    <div style={{ fontSize:'10px',color:'rgba(255,255,255,0.40)',letterSpacing:'0.15em',textTransform:'uppercase' as const }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.04)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',border:'1px solid rgba(212,175,55,0.20)',borderRadius:'28px',padding:'40px 36px',position:'relative',overflow:'hidden',marginBottom:'24px' }}>
          <div style={{ position:'absolute',inset:'0 0 auto 0',height:'1px',background:'linear-gradient(to right, transparent, rgba(212,175,55,0.25), transparent)' }} />
          <div style={{ fontSize:'10px',letterSpacing:'0.28em',textTransform:'uppercase' as const,color:'rgba(212,175,55,0.70)',marginBottom:'20px' }}>✦ Da systemet ikke strakk til</div>
          <div style={{ fontFamily:'"Crimson Pro",serif',fontSize:'20px',color:'rgba(255,255,255,0.92)',lineHeight:1.80,marginBottom:'28px',fontWeight:400,fontStyle:'italic',maxWidth:'680px' }}>
            &quot;Jeg heter Thomas (45). For noen år siden merket jeg at stresset holdt på å ta overhånd, men i møte med helsevesenet fikk jeg bare høre at jeg var &apos;frisk&apos;. Kroppen min sa noe helt annet. Jeg nektet å vente på smellen. Jeg kjøpte en Oura-ring (wearable) for å måle mine egne verdier og utforske mitt eget stress. The Munk er resultatet av den reisen, et system bygget på ekte data for å hjelpe meg selv og for å hjelpe andre menn med å ta kontrollen tilbake.&quot;
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
            <div style={{ width:'32px',height:'32px',borderRadius:'50%',background:'rgba(212,175,55,0.20)',border:'1px solid rgba(212,175,55,0.30)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px' }}>T</div>
            <div style={{ fontSize:'13px',color:'rgba(255,255,255,0.55)',letterSpacing:'0.05em' }}>— Thomas, Founder av The Munk</div>
          </div>
        </div>

        <div style={{ fontSize:'10px',letterSpacing:'0.28em',textTransform:'uppercase',color:'rgba(255,255,255,0.30)',marginBottom:'16px' }}>Slik fungerer The Munk</div>
        <div className="cards-grid">
          {[
            {t:'Total biologisk oversikt',b:'Vi kobler oss til dine wearables (f.eks. Apple Watch, Garmin, Oura, Whoop og andre) for å gi deg et samlet bilde av nervesystemets faktiske tilstand.'},
            {t:'Din daglige operative ordre',b:'Ingen støvete rapporter. Bare en kort, presis status som forteller deg nøyaktig hvordan du bør disponere kreftene i dag.'},
            {t:'Forutser smellen',b:'The Munk ser når stresset bygger seg opp over tid, og gir deg beskjed før kroppen selv sier stopp.'},
            {t:'Fri fra prestasjonspress',b:'Vi pusher deg ikke til å prestere mer. The Munk gir deg tilgang til et skreddersydd bibliotek med innhold om stress, søvn og pusteteknikker, slik at du kan lære å forstå signalene og leve bedre med det ansvaret du allerede bærer.'},
          ].map(c => (
            <div key={c.t} style={{ background:'rgba(255,255,255,0.03)',backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'20px',padding:'24px 20px' }}>
              <div style={{ fontFamily:'"Crimson Pro",serif',fontSize:'16px',color:'rgba(255,255,255,0.95)',marginBottom:'8px',fontWeight:500 }}>{c.t}</div>
              <div style={{ fontSize:'13px',color:'rgba(255,255,255,0.90)',lineHeight:1.65,fontWeight:500 }}>{c.b}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)',padding:'64px 0',position:'relative',zIndex:10 }}>
        <div className="shell">
          <div style={{ fontFamily:'"Crimson Pro",serif',fontSize:'28px',color:'#D4AF37',fontStyle:'italic',fontWeight:400,marginBottom:'8px' }}>Kan du måle det – kan du mestre det.</div><div style={{ fontFamily:'"Crimson Pro",serif',fontSize:'38px',color:'rgba(255,255,255,0.95)',fontWeight:400,marginBottom:'12px' }}>Gratis i testperioden</div>
          <div style={{ fontSize:'14px',color:'rgba(255,255,255,0.90)',marginBottom:'32px',fontWeight:500 }}>Begrenset antall plasser. Ingen binding.</div>
          <a href="#signup" style={{ background:'rgba(212,175,55,0.90)',color:'#0d1a15',fontFamily:'"Outfit",sans-serif',fontSize:'12px',fontWeight:600,padding:'14px 32px',border:'none',borderRadius:'100px',display:'inline-block',textDecoration:'none',letterSpacing:'0.2em',textTransform:'uppercase' as const }}>Bli med i testen</a>
        </div>
      </div>

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)',padding:'28px 0',position:'relative',zIndex:10 }}>
        <div className="shell">
          <div style={{ fontSize:'13px',color:'rgba(255,255,255,0.40)',marginBottom:'6px' }}>Følg utviklingen av The Munk</div>
          <div style={{ fontSize:'12px',color:'rgba(255,255,255,0.35)',marginBottom:'10px',fontWeight:500 }}>Jeg deler hvordan stress faktisk ser ut i kroppen — hver dag.</div>
          <a href="https://x.com/themunk_ai" target="_blank" rel="noopener" style={{ fontSize:'13px',color:'rgba(212,175,55,0.65)',textDecoration:'none' }}>→ Følg på X</a>
        </div>
      </div>
    </div>
  )
}
