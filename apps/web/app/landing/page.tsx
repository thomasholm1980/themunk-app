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
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#faf8f4;font-family:"Outfit",sans-serif;color:#2a2a2a;}
        .nav{padding:16px 44px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid rgba(42,42,42,0.08);}
        .nav-logo{height:52px;width:52px;object-fit:contain;border-radius:50%;}
        .nav-wordmark{font-family:"Lora",serif;font-size:15px;font-weight:600;letter-spacing:3px;color:#1a1a1a;text-transform:uppercase;margin-left:12px;}
        .nav-wordmark span{font-size:9px;color:#c8a84b;letter-spacing:2px;font-family:"Outfit",sans-serif;font-weight:400;}
        .nav-left{display:flex;align-items:center;}
        .nav-link{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(42,42,42,0.5);cursor:pointer;font-family:"Outfit",sans-serif;font-weight:500;}
        .hero-wrap{display:grid;grid-template-columns:1fr 1fr;gap:48px;padding:64px 44px 56px;align-items:start;max-width:1100px;margin:0 auto;}
        .kicker{display:flex;align-items:center;gap:8px;font-size:12px;color:#2d5a3d;font-weight:500;margin-bottom:24px;letter-spacing:0.5px;}
        .dot{width:7px;height:7px;border-radius:50%;background:#c8a84b;flex-shrink:0;display:inline-block;}
        h1{font-family:"Lora",serif;font-size:46px;line-height:1.15;color:#1a1a1a;margin-bottom:20px;font-weight:400;}
        h1 em{color:#2d5a3d;font-style:italic;}
        .sub{font-size:15px;line-height:1.7;color:rgba(42,42,42,0.62);font-weight:300;margin-bottom:0;}
        .signup-box{background:#fff;border:0.5px solid rgba(42,42,42,0.1);border-radius:8px;padding:32px 28px;}
        .signup-title{font-family:"Lora",serif;font-size:20px;color:#1a1a1a;margin-bottom:8px;font-weight:600;}
        .signup-sub{font-size:13px;color:rgba(42,42,42,0.5);margin-bottom:24px;font-weight:300;}
        .signup-input{width:100%;border:0.5px solid rgba(42,42,42,0.2);border-radius:4px;padding:12px 16px;font-family:"Outfit",sans-serif;font-size:14px;color:#2a2a2a;background:#faf8f4;margin-bottom:12px;outline:none;}
        .signup-input:focus{border-color:#2d5a3d;}
        .btn-primary{width:100%;background:#2d5a3d;color:#f0ece2;font-family:"Outfit",sans-serif;font-size:14px;font-weight:500;padding:14px 30px;border:none;border-radius:4px;cursor:pointer;display:block;}
        .btn-primary:hover{background:#3a7050;}
        .btn-primary:disabled{opacity:0.6;cursor:not-allowed;}
        .signup-note{font-size:11px;color:rgba(42,42,42,0.38);margin-top:14px;line-height:1.6;}
        .success-state{padding:20px 0 8px;}
        .success-marker{display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#2d5a3d;font-weight:500;margin-bottom:16px;}
        .success-marker-dot{width:8px;height:8px;border-radius:50%;background:#2d5a3d;flex-shrink:0;}
        .success-title{font-family:"Lora",serif;font-size:24px;color:#1a1a1a;margin-bottom:10px;font-weight:600;line-height:1.2;}
        .success-sub{font-size:14px;color:rgba(42,42,42,0.62);line-height:1.7;font-weight:300;}
        .error-msg{font-size:12px;color:#b94040;margin-top:8px;}
        .cards{padding:0 44px 48px;display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:900px;margin:0 auto;}
        .card{background:#fff;border:0.5px solid rgba(42,42,42,0.09);border-radius:6px;padding:24px 20px;}
        .card-title{font-family:"Lora",serif;font-size:15px;color:#1a1a1a;margin-bottom:8px;font-weight:600;}
        .card-body{font-size:13px;color:rgba(42,42,42,0.55);line-height:1.65;font-weight:300;}
        .brief-section{background:#2d3d2d;padding:56px 44px;margin-top:0;}
        .brief-inner{max-width:680px;}
        .brief-label{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(240,235,224,0.35);margin-bottom:16px;}
        .brief-state{display:inline-block;background:rgba(200,168,75,0.2);color:#c8a84b;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:4px 12px;border-radius:2px;margin-bottom:22px;border:0.5px solid rgba(200,168,75,0.3);}
        .brief-text{font-size:15px;color:rgba(240,235,224,0.85);line-height:1.75;margin-bottom:24px;}
        .brief-signals{display:flex;gap:32px;padding-top:20px;border-top:0.5px solid rgba(240,235,224,0.1);}
        .signal{font-size:11px;color:rgba(240,235,224,0.4);}
        .signal strong{display:block;font-size:16px;color:rgba(240,235,224,0.75);font-weight:500;margin-bottom:3px;}
        .brief-sig{font-size:11px;color:rgba(240,235,224,0.25);letter-spacing:1px;margin-top:18px;}
        .cta-section{background:#1e2e1e;padding:64px 44px;}
        .cta-title{font-family:"Lora",serif;font-size:38px;color:#f0ece2;font-weight:400;margin-bottom:12px;}
        .cta-sub{font-size:14px;color:rgba(240,235,224,0.45);margin-bottom:32px;font-weight:300;}
        .btn-outline{background:transparent;color:#f0ece2;font-family:"Outfit",sans-serif;font-size:13px;font-weight:500;padding:12px 28px;border:0.5px solid rgba(240,235,224,0.4);border-radius:2px;cursor:pointer;display:inline-block;text-decoration:none;}
        .btn-outline:hover{background:rgba(240,235,224,0.05);}
        .footer-bar{background:#1a2a1a;padding:28px 44px;border-top:0.5px solid rgba(240,235,224,0.06);}
        .footer-text{font-size:13px;color:rgba(240,235,224,0.4);margin-bottom:6px;}
        .footer-link{font-size:13px;color:rgba(200,168,75,0.7);cursor:pointer;text-decoration:none;}
        .section-gap{padding-top:48px;}
        @media(max-width:720px){
          .nav{padding:14px 20px;}
          .hero-wrap{grid-template-columns:1fr;padding:40px 20px 36px;gap:28px;}
          h1{font-size:34px;}
          .cards{padding:0 20px 40px;grid-template-columns:1fr;}
          .brief-section{padding:40px 20px;}
          .cta-section{padding:48px 20px;}
          .footer-bar{padding:24px 20px;}
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />

      <nav className="nav">
        <div className="nav-left">
          <img src="/assets/munk-logo.png" alt="The Munk" className="nav-logo" />
          <div className="nav-wordmark">The Munk<span>AI</span></div>
        </div>
        <a href="#signup" className="nav-link">Bli med i testen</a>
      </nav>

      <div className="hero-wrap">
        <div>
          <div className="kicker"><span className="dot"></span>Stress-forståelse for norske menn</div>
          <h1>Du er mer<br />stresset enn<br /><em>du tror.</em></h1>
          <p className="sub">The Munk AI leser dine bærbare enheter og forteller deg — på vanlig norsk — hva stresset gjør i kroppen din. Hver dag. Ikke tall. Ikke grafer. Bare forståelse.</p>
        </div>
        <div id="signup">
          <div className="signup-box">
            <div className="signup-title">Bli med i testen</div>
            <div className="signup-sub">Vi inviterer nå et begrenset antall til å teste The Munk.</div>
            {status === 'success' ? (
              <div className="success-state">
                <div className="success-marker"><span className="success-marker-dot"></span>Registrert</div>
                <div className="success-title">Takk — du er med.</div>
                <div className="success-sub">Vi åpner gradvis for testbrukere.<br />Du får beskjed når vi er klare.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <input className="signup-input" type="email" placeholder="Din e-postadresse" value={email} onChange={e => setEmail(e.target.value)} required disabled={status === 'loading'} />
                <button className="btn-primary" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sender...' : 'Bli med i testen'}
                </button>
                {status === 'error' && <div className="error-msg">Noe gikk galt. Prøv igjen om litt.</div>}
                <div className="signup-note">Gratis i testperioden. Ingen binding. Vi sender kun relevant informasjon.</div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="cards section-gap">
        <div className="card"><div className="card-title">Leser din wearable</div><div className="card-body">Oura, Apple Watch, Garmin eller Whoop (støtte utvides fortløpende).</div></div>
        <div className="card"><div className="card-title">Én brief per dag</div><div className="card-body">En kort forklaring på vanlig norsk, hver morgen.</div></div>
        <div className="card"><div className="card-title">Ser mønstrene dine</div><div className="card-body">Over tid ser The Munk hvordan stresset ditt bygger seg opp — og hva kroppen din prøver å si.</div></div>
        <div className="card"><div className="card-title">Ingen optimalisering</div><div className="card-body">Vi forteller deg ikke hva du skal prestere. Vi hjelper deg å forstå hva som skjer.</div></div>
      </div>

      <div className="brief-section">
        <div className="brief-inner">
          <div className="brief-label">Eksempel — daglig brief</div>
          <div className="brief-state">Moderat stress</div>
          <div className="brief-text">Moderat stress i dag.<br />Lav HRV og forhøyet hvilepuls — kroppen er ikke ferdig restituert.<br />Hold stressnivået lavt i dag.</div>
          <div className="brief-signals">
            <div className="signal"><strong>38 ms</strong>HRV · lav</div>
            <div className="signal"><strong>5t 42 min</strong>Søvn · lett</div>
            <div className="signal"><strong>62 bpm</strong>Hvilepuls · høyere enn normalt</div>
          </div>
          <div className="brief-sig">The Munk · Onsdag 06:47</div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-title">Gratis i testperioden</div>
        <div className="cta-sub">Begrenset antall plasser. Ingen binding.</div>
        <a href="#signup" className="btn-outline">Bli med i testen</a>
      </div>

      <div className="footer-bar">
        <div className="footer-text">Følg utviklingen av The Munk</div>
        <div className="footer-text" style={{fontSize:'12px',marginBottom:'10px'}}>Jeg deler hvordan stress faktisk ser ut i kroppen — hver dag.</div>
        <a href="https://x.com/themunk_ai" target="_blank" rel="noopener" className="footer-link">→ Følg på X</a>
      </div>
    </>
  )
}
