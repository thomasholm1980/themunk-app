export default function LandingPage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green:       #2d5a3d;
          --green-light: #3a7050;
          --gold:        #c8a84b;
          --gold-light:  #e8c97a;
          --cream:       #faf8f4;
          --cream-card:  #ffffff;
          --ink:         #1a1a1a;
          --ink-mid:     rgba(42,42,42,0.62);
          --ink-muted:   rgba(42,42,42,0.38);
          --ink-faint:   rgba(42,42,42,0.08);
          --brief-bg:    #243d2e;
          --brief-text:  rgba(240,235,224,0.88);
          --brief-muted: rgba(240,235,224,0.45);
          --brief-dim:   rgba(240,235,224,0.28);
          --brief-faint: rgba(240,235,224,0.12);
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--cream);
          font-family: 'Outfit', sans-serif;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .page-shell {
          max-width: 720px;
          margin: 0 auto;
          width: 100%;
        }

        .nav {
          padding: 22px 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 0.5px solid var(--ink-faint);
          position: sticky;
          top: 0;
          background: var(--cream);
          z-index: 100;
        }

        .logo {
          font-family: 'Lora', serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 3px;
          color: var(--green);
          text-transform: uppercase;
        }

        .logo-ai {
          font-size: 10px;
          color: var(--gold);
          letter-spacing: 2px;
          margin-left: 5px;
          font-family: 'Outfit', sans-serif;
          font-weight: 400;
        }

        .nav-cta {
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--green);
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          border-bottom: 1px solid rgba(45,90,61,0.25);
          padding-bottom: 1px;
          transition: border-color 0.2s;
        }

        .nav-cta:hover { border-color: var(--green); }

        .hero {
          padding: 72px 44px 52px;
        }

        .kicker {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--green);
          font-weight: 500;
          margin-bottom: 28px;
          letter-spacing: 0.5px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--gold);
          flex-shrink: 0;
        }

        h1 {
          font-family: 'Lora', serif;
          font-size: clamp(36px, 6vw, 52px);
          line-height: 1.15;
          color: var(--ink);
          margin-bottom: 22px;
          font-weight: 400;
        }

        h1 em { color: var(--green); font-style: italic; }

        .sub {
          font-size: 17px;
          line-height: 1.72;
          color: var(--ink-mid);
          font-weight: 300;
          max-width: 480px;
          margin-bottom: 38px;
        }

        .hero-invite {
          font-size: 13px;
          color: var(--green);
          font-weight: 400;
          margin-bottom: 20px;
          letter-spacing: 0.2px;
        }

        .btn-primary {
          background: var(--green);
          color: #f0ece2;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          padding: 15px 32px;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          display: inline-block;
          letter-spacing: 0.3px;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-primary:hover { background: var(--green-light); }

        .btn-note {
          font-size: 12px;
          color: var(--ink-muted);
          margin-top: 13px;
        }

        .divider {
          border: none;
          border-top: 0.5px solid var(--ink-faint);
          margin: 0 44px 48px;
        }

        .cards {
          padding: 0 44px 52px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .card {
          background: var(--cream-card);
          border: 0.5px solid rgba(42,42,42,0.09);
          border-radius: 6px;
          padding: 22px 20px;
        }

        .card-title {
          font-family: 'Lora', serif;
          font-size: 15px;
          color: var(--ink);
          margin-bottom: 8px;
          font-weight: 600;
        }

        .card-body {
          font-size: 13px;
          color: rgba(42,42,42,0.56);
          line-height: 1.65;
          font-weight: 300;
        }

        .brief-wrap {
          margin: 0 44px 52px;
          background: var(--brief-bg);
          border-radius: 8px;
          padding: 32px 36px;
        }

        .brief-label {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--brief-dim);
          margin-bottom: 16px;
        }

        .brief-state {
          display: inline-block;
          background: rgba(200,168,75,0.2);
          color: var(--gold-light);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 2px;
          margin-bottom: 20px;
        }

        .brief-lines { margin-bottom: 22px; }

        .brief-line {
          font-family: 'Lora', serif;
          font-size: 15px;
          color: var(--brief-text);
          line-height: 1.8;
        }

        .brief-line + .brief-line { margin-top: 2px; }

        .brief-signals {
          display: flex;
          gap: 24px;
          padding-top: 18px;
          border-top: 0.5px solid var(--brief-faint);
          flex-wrap: wrap;
        }

        .signal { font-size: 12px; color: var(--brief-muted); }

        .signal strong {
          display: block;
          font-size: 15px;
          color: rgba(240,235,224,0.78);
          font-weight: 500;
          margin-bottom: 2px;
          font-family: 'Outfit', sans-serif;
        }

        .brief-sig {
          font-size: 11px;
          color: var(--brief-dim);
          letter-spacing: 1px;
          margin-top: 18px;
        }

        .price-section { padding: 0 44px 56px; }

        .price-title {
          font-family: 'Lora', serif;
          font-size: 38px;
          color: var(--green);
          margin-bottom: 6px;
          font-weight: 400;
        }

        .price-note {
          font-size: 13px;
          color: var(--ink-muted);
          margin-bottom: 26px;
        }

        .social-section {
          padding: 32px 44px 64px;
          border-top: 0.5px solid var(--ink-faint);
        }

        .social-text {
          font-size: 13px;
          color: var(--ink-muted);
          line-height: 1.7;
          font-weight: 300;
          max-width: 380px;
        }

        .social-text strong {
          display: block;
          color: var(--ink);
          font-weight: 500;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .social-link {
          display: inline-block;
          margin-top: 10px;
          font-size: 12px;
          color: var(--green);
          text-decoration: none;
          border-bottom: 1px solid rgba(45,90,61,0.25);
          padding-bottom: 1px;
          transition: border-color 0.2s;
        }

        .social-link:hover { border-color: var(--green); }

        @media (max-width: 600px) {
          .nav { padding: 18px 20px; }
          .hero { padding: 48px 20px 40px; }
          h1 { font-size: 34px; }
          .sub { font-size: 16px; }
          .divider { margin: 0 20px 40px; }
          .cards { padding: 0 20px 40px; grid-template-columns: 1fr; }
          .brief-wrap { margin: 0 20px 40px; padding: 24px 22px; }
          .brief-signals { gap: 16px; }
          .price-section { padding: 0 20px 48px; }
          .social-section { padding: 28px 20px 48px; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />

      <div className="page-shell">

        <nav className="nav">
          <div className="logo">The Munk<span className="logo-ai">AI</span></div>
          <a href="#signup" className="nav-cta">Bli med i testen</a>
        </nav>

        <div className="hero">
          <div className="kicker">
            <span className="dot"></span>
            Stress-forståelse for norske menn
          </div>
          <h1>Du er mer<br />stresset enn<br /><em>du tror.</em></h1>
          <p className="sub">The Munk AI leser dine teknologiske bærbare enheter (klokke, ring eller armbånd) og forteller deg — på vanlig norsk — hva stresset gjør i kroppen din. Hver dag. Ikke tall. Ikke grafer. Bare forståelse.</p>
          <p className="hero-invite">Vi inviterer nå et begrenset antall til å teste The Munk.</p>
          <a href="#signup" className="btn-primary">Bli med i testen</a>
          <div className="btn-note">Gratis i testperioden · Ingen betalingskort nødvendig</div>
        </div>

        <hr className="divider" />

        <div className="cards">
          <div className="card">
            <div className="card-title">Leser din wearable</div>
            <div className="card-body">Oura, Apple Watch, Garmin eller Whoop (støtte utvides fortløpende).</div>
          </div>
          <div className="card">
            <div className="card-title">Én brief per dag</div>
            <div className="card-body">En kort forklaring på vanlig norsk, hver morgen.</div>
          </div>
          <div className="card">
            <div className="card-title">Ser mønstrene dine</div>
            <div className="card-body">Over tid ser The Munk hvordan stresset ditt bygger seg opp — og hva kroppen din prøver å si.</div>
          </div>
          <div className="card">
            <div className="card-title">Ingen optimalisering</div>
            <div className="card-body">Vi forteller deg ikke hva du skal prestere. Vi hjelper deg å forstå hva som skjer.</div>
          </div>
        </div>

        <div className="brief-wrap">
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

        <div className="price-section" id="signup">
          <div className="price-title">Gratis i testperioden</div>
          <div className="price-note">Begrenset antall plasser. Ingen binding.</div>
          <a href="#signup" className="btn-primary">Bli med i testen</a>
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
