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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --green:#2d5a3d;--green-light:#3a7050;--gold:#c8a84b;--gold-light:#e8c97a;
          --cream:#faf8f4;--cream-card:#ffffff;--ink:#1a1a1a;
          --ink-mid:rgba(42,42,42,0.62);--ink-muted:rgba(42,42,42,0.38);--ink-faint:rgba(42,42,42,0.08);
          --brief-bg:#243d2e;--brief-text:rgba(240,235,224,0.88);--brief-muted:rgba(240,235,224,0.45);
          --brief-dim:rgba(240,235,224,0.28);--brief-faint:rgba(240,235,224,0.12);
          --dark-end:#1a2e22;
        }
        html{scroll-behavior:smooth;}
        body{background:var(--cream);font-family:'Outfit',sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;}
        .page-shell{max-width:960px;margin:0 auto;width:100%;}
        .nav{padding:22px 48px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid var(--ink-faint);position:sticky;top:0;background:var(--cream);z-index:100;}
        .logo{font-family:'Lora',serif;font-size:16px;font-weight:600;letter-spacing:3px;color:var(--green);text-transform:uppercase;}
        .logo-ai{font-size:10px;color:var(--gold);letter-spacing:2px;margin-left:5px;font-family:'Outfit',sans-serif;font-weight:400;}
        .nav-cta{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--green);font-weight:500;cursor:pointer;text-decoration:none;border-bottom:1px solid rgba(45,90,61,0.25);padding-bottom:1px;transition:border-color 0.2s;}
        .nav-cta:hover{border-color:var(--green);}
        .hero{padding:72px 48px 60px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;}
        .kicker{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--green);font-weight:500;margin-bottom:28px;letter-spacing:0.5px;}
        .dot{width:7px;height:7px;border-radius:50%;background:var(--gold);flex-shrink:0;}
        h1{font-family:'Lora',serif;font-size:clamp(34px,4vw,48px);line-height:1.15;color:var(--ink);margin-bottom:20px;font-weight:400;}
        h1 em{color:var(--green);font-style:italic;}
        .sub{font-size:16px;line-height:1.72;color:var(--ink-mid);font-weight:300;}
        .hero-right{padding-top:8px;}

        /* ── FORM PANEL ── */
        .form-panel{
          background:var(--cream-card);
          border:0.5px solid rgba(42,42,42,0.12);
          border-radius:8px;
          padding:36px 32px;
          box-shadow: 0 2px 16px rgba(42,42,42,0.06);
        }
        .form-panel-title{font-family:'Lora',serif;font-size:21px;color:var(--ink);margin-bottom:6px;font-weight:600;}
        .form-panel-invite{font-size:13px;color:var(--ink-muted);margin-bottom:28px;font-weight:300;line-height:1.5;}
        .form-row{display:flex;flex-direction:column;gap:10px;}
        .email-input{width:100%;padding:14px 16px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:300;color:var(--ink);background:var(--cream);border:0.5px solid rgba(42,42,42,0.18);border-radius:2px;outline:none;transition:border-color 0.2s;}
        .email-input:focus{border-color:var(--green);}
        .email-input::placeholder{color:var(--ink-muted);}
        .btn-primary{width:100%;background:var(--green);color:#f0ece2;font-family:'Outfit',sans-serif;font-size:14px;font-weight:500;padding:15px 24px;border:none;border-radius:2px;cursor:pointer;transition:background 0.2s;letter-spacing:0.3px;}
        .btn-primary:hover{background:var(--green-light);}
        .btn-primary:disabled{opacity:0.6;cursor:not-allowed;}
        .form-trust{font-size:11px;color:var(--ink-muted);margin-top:14px;line-height:1.6;padding-top:14px;border-top:0.5px solid var(--ink-faint);}

        /* ── SUCCESS STATE ── */
        .success-state{padding:20px 0 8px;}
        .success-marker{
          display:inline-flex;align-items:center;gap:8px;
          font-size:11px;letter-spacing:2px;text-transform:uppercase;
          color:var(--green);font-weight:500;margin-bottom:16px;
        }
        .success-marker-dot{
          width:8px;height:8px;border-radius:50%;
          background:var(--green);flex-shrink:0;
        }
        .success-title{font-family:'Lora',serif;font-size:24px;color:var(--ink);margin-bottom:10px;font-weight:600;line-height:1.2;}
        .success-sub{font-size:14px;color:var(--ink-mid);line-height:1.7;font-weight:300;}
        .error-msg{font-size:12px;color:#b94040;margin-top:8px;}

        .divider{border:none;border-top:0.5px solid var(--ink-faint);margin:0 48px 48px;}
        .cards{padding:0 48px 52px;display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .card{background:var(--cream-card);border:0.5px solid rgba(42,42,42,0.09);border-radius:6px;padding:22px 20px;}
        .card-title{font-family:'Lora',serif;font-size:15px;color:var(--ink);margin-bottom:8px;font-weight:600;}
        .card-body{font-size:13px;color:rgba(42,42,42,0.56);line-height:1.65;font-weight:300;}

        .brief-section{background:var(--brief-bg);padding:52px 48px;margin-bottom:0;}
        .brief-inner{max-width:560px;}
        .brief-label{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--brief-dim);margin-bottom:16px;}
        .brief-state{display:inline-block;background:rgba(200,168,75,0.2);color:var(--gold-light);font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:4px 12px;border-radius:2px;margin-bottom:20px;}
        .brief-lines{margin-bottom:22px;}
        .brief-line{font-family:'Lora',serif;font-size:16px;color:var(--brief-text);line-height:1.8;}
        .brief-line+.brief-line{margin-top:2px;}
        .brief-signals{display:flex;gap:28px;padding-top:18px;border-top:0.5px solid var(--brief-faint);flex-wrap:wrap;}
        .signal{font-size:12px;color:var(--brief-muted);}
        .signal strong{display:block;font-size:15px;color:rgba(240,235,224,0.78);font-weight:500;margin-bottom:2px;font-family:'Outfit',sans-serif;}
        .brief-sig{font-size:11px;color:var(--brief-dim);letter-spacing:1px;margin-top:18px;}

        /* ── DARK END SECTION ── */
        .end-section{
          background:var(--dark-end);
          padding:60px 48px 52px;
        }
        .end-title{font-family:'Lora',serif;font-size:32px;color:rgba(240,235,224,0.92);margin-bottom:8px;font-weight:400;}
        .end-note{font-size:13px;color:rgba(240,235,224,0.45);margin-bottom:32px;font-weight:300;}
        .btn-end{
          display:inline-block;background:transparent;
          color:rgba(240,235,224,0.88);
          font-family:'Outfit',sans-serif;font-size:14px;font-weight:500;
          padding:13px 28px;
          border:0.5px solid rgba(240,235,224,0.3);
          border-radius:2px;cursor:pointer;text-decoration:none;
          transition:background 0.2s,border-color 0.2s;
        }
        .btn-end:hover{background:rgba(240,235,224,0.08);border-color:rgba(240,235,224,0.5);}

        /* ── SOCIAL ── */
        .social-section{padding:28px 48px 48px;background:var(--dark-end);border-top:0.5px solid rgba(240,235,224,0.08);}
        .social-text{font-size:13px;color:rgba(240,235,224,0.38);line-height:1.7;font-weight:300;max-width:380px;}
        .social-text strong{display:block;color:rgba(240,235,224,0.6);font-weight:500;margin-bottom:4px;font-size:13px;}
        .social-link{display:inline-block;margin-top:10px;font-size:12px;color:rgba(240,235,224,0.45);text-decoration:none;border-bottom:1px solid rgba(240,235,224,0.15);padding-bottom:1px;transition:color 0.2s,border-color 0.2s;}
        .social-link:hover{color:rgba(240,235,224,0.7);border-color:rgba(240,235,224,0.35);}

        @media(max-width:720px){
          .nav{padding:18px 20px;}
          .hero{padding:48px 20px 40px;grid-template-columns:1fr;gap:32px;}
          h1{font-size:34px;}
          .divider{margin:0 20px 40px;}
          .cards{padding:0 20px 40px;grid-template-columns:1fr;}
          .brief-section{padding:40px 20px;}
          .end-section{padding:48px 20px 40px;}
          .social-section{padding:24px 20px 40px;}
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />

      <div className="page-shell">
        <nav className="nav">
          <div className="logo">The Munk<span className="logo-ai">AI</span></div>
          <a href="#signup" className="nav-cta">Bli med i testen</a>
        </nav>

        <div className="hero">
          <div className="hero-left">
            <div className="kicker"><span className="dot"></span>Stress-forståelse for norske menn</div>
            <h1>Du er mer<br />stresset enn<br /><em>du tror.</em></h1>
            <p className="sub">The Munk AI leser dine teknologiske bærbare enheter (klokke, ring eller armbånd) og forteller deg — på vanlig norsk — hva stresset gjør i kroppen din. Hver dag. Ikke tall. Ikke grafer. Bare forståelse.</p>
          </div>
          <div className="hero-right" id="signup">
            <div className="form-panel">
              <div className="form-panel-title">Bli med i testen</div>
              <div className="form-panel-invite">Vi inviterer nå et begrenset antall til å teste The Munk.</div>
              {status === 'success' ? (
                <div className="success-state">
                  <div className="success-marker">
                    <span className="success-marker-dot"></span>
                    Registrert
                  </div>
                  <div className="success-title">Takk — du er med.</div>
                  <div className="success-sub">Vi åpner gradvis for testbrukere.<br />Du får beskjed når vi er klare.</div>
                </div>
              ) : (
                <form className="form-row" onSubmit={handleSubmit}>
                  <input className="email-input" type="email" placeholder="Din e-postadresse" value={email} onChange={e => setEmail(e.target.value)} required disabled={status === 'loading'} />
                  <button className="btn-primary" type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sender...' : 'Bli med i testen'}
                  </button>
                  {status === 'error' && <div className="error-msg">Noe gikk galt. Prøv igjen om litt.</div>}
                  <div className="form-trust">Gratis i testperioden. Ingen binding. Vi sender kun relevant informasjon.</div>
                </form>
              )}
            </div>
          </div>
        </div>

        <hr className="divider" />

        <div className="cards">
          <div className="card"><div className="card-title">Leser din wearable</div><div className="card-body">Oura, Apple Watch, Garmin eller Whoop (støtte utvides fortløpende).</div></div>
          <div className="card"><div className="card-title">Én brief per dag</div><div className="card-body">En kort forklaring på vanlig norsk, hver morgen.</div></div>
          <div className="card"><div className="card-title">Ser mønstrene dine</div><div className="card-body">Over tid ser The Munk hvordan stresset ditt bygger seg opp — og hva kroppen din prøver å si.</div></div>
          <div className="card"><div className="card-title">Ingen optimalisering</div><div className="card-body">Vi forteller deg ikke hva du skal prestere. Vi hjelper deg å forstå hva som skjer.</div></div>
        </div>

        <div className="brief-section">
          <div className="brief-inner">
            <div className="brief-label">Eksempel — daglig brief</div>
            <div className="brief-state">Moderat stress</div>
            <div className="brief-lines">
              <div className="brief-line">Moderat stress i dag.</div>
              <div className="brief-line">Lav HRV og forhøyet hvilepuls — kroppen er ikke ferdig restituert.</div>
              <div className="brief-line">Kroppen ber om lavere tempo i dag.</div>
            </div>
            <div className="brief-signals">
              <div className="signal"><strong>38 ms</strong>HRV · lav</div>
              <div className="signal"><strong>5 t 42 min</strong>Søvn · lett</div>
              <div className="signal"><strong>62 bpm</strong>Hvilepuls · høyere enn normalt</div>
            </div>
            <div className="brief-sig">The Munk · Onsdag 06:47</div>
          </div>
        </div>

        <div className="end-section">
          <div className="end-title">Gratis i testperioden</div>
          <div className="end-note">Begrenset antall plasser. Ingen binding.</div>
          <a href="#signup" className="btn-end">Bli med i testen</a>
        </div>

        <div className="social-section">
          <div className="social-text">
            <strong>Følg utviklingen av The Munk</strong>
            Jeg deler hvordan stress faktisk ser ut i kroppen — hver dag.
          </div>
          <a href="https://x.com/themunk_ai" target="_blank" rel="noopener" className="social-link">→ Følg på X</a>
        </div>
      </div>
    </>
  )
}
