export const metadata = {
  title: "Personvernerklæring — The Munk",
  description: "Hvordan The Munk behandler dine personopplysninger og helsedata.",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a1f0d", color: "#f0ebe3", padding: "60px 24px 120px", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", lineHeight: 1.7 }}>
        <a href="/check-in" style={{ fontSize: "13px", color: "rgba(212,175,55,0.70)", textDecoration: "none" }}>← Tilbake til appen</a>
        <div style={{ fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(212,175,55,0.60)", marginTop: "32px", marginBottom: "12px" }}>The Munk</div>
        <h1 style={{ fontFamily: \'"Crimson Pro", ui-serif, Georgia, serif\', fontSize: "42px", fontWeight: 400, marginBottom: "8px", color: "#fff" }}>Personvernerklæring</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", marginBottom: "8px" }}>Sist oppdatert: 17. april 2026</p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", marginBottom: "40px" }}><a href="/privacy/en" style={{ color: "rgba(212,175,55,0.70)" }}>English version →</a></p>

        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", marginBottom: "32px" }}>
          The Munk er en stress-tolkningsapp som hjelper deg å forstå kroppens signaler. Vi behandler personopplysninger og helsedata for å levere denne tjenesten. Denne erklæringen forklarer hvilke data vi samler inn, hvorfor, og hvilke rettigheter du har.
        </p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>1. Behandlingsansvarlig</h2>
        <p>Holms Holding AS, org.nr 989705121, Homansvei 2a, 1365 Blommenholm, Norge.</p>
        <p>Kontakt for personvernspørsmål: <a href="mailto:thomas@themunk.ai" style={{ color: "#D4AF37" }}>thomas@themunk.ai</a></p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>2. Hvilke data vi samler inn</h2>
        <p><strong style={{ color: "#fff" }}>Helsedata fra wearables:</strong> Når du kobler en støttet wearable (Oura Ring, Apple Health, Garmin, Whoop, Samsung Health, Google Health Connect), henter vi hjertefrekvensvariabilitet (HRV), hvilepuls, søvndata, aktivitet og stress-score. Disse dataene er sensitive personopplysninger under GDPR Artikkel 9.</p>
        <p><strong style={{ color: "#fff" }}>Stemmedata:</strong> Når du snakker med Aria (vår stemmebaserte funksjon levert av Hume AI), behandles lyden i sanntid for å gi deg respons. Stemmeopptak lagres ikke permanent verken hos The Munk eller Hume AI.</p>
        <p><strong style={{ color: "#fff" }}>Refleksjoner og notater:</strong> Tekst du skriver inn i appen.</p>
        <p><strong style={{ color: "#fff" }}>Kontoinformasjon:</strong> E-postadresse og brukernavn.</p>
        <p><strong style={{ color: "#fff" }}>Metadata:</strong> Tidspunkt for bruk, enhetstype, operativsystem, IP-adresse (for sikkerhet), og generell bruksstatistikk for å forbedre tjenesten.</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>3. Hvorfor vi behandler dataene (rettslig grunnlag)</h2>
        <p><strong style={{ color: "#fff" }}>Avtale (GDPR Art. 6.1.b):</strong> For å levere selve tjenesten — vise deg dagens stress-status, gi deg innsikt og tilby Aria-samtaler.</p>
        <p><strong style={{ color: "#fff" }}>Eksplisitt samtykke (GDPR Art. 9.2.a):</strong> For behandling av helsedata. Du gir samtykke når du kobler en wearable eller bruker Aria. Du kan trekke samtykket tilbake når som helst.</p>
        <p><strong style={{ color: "#fff" }}>Berettiget interesse (GDPR Art. 6.1.f):</strong> For drift, sikkerhet og produktforbedring (ikke-identifiserbare aggregerte data).</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>4. Hvor lagres dataene</h2>
        <p><strong style={{ color: "#fff" }}>Database (Supabase):</strong> Lagres i EU (Irland, eu-west-1). Dataene forlater ikke EU.</p>
        <p><strong style={{ color: "#fff" }}>Stemme-prosessering (Hume AI):</strong> USA-basert. Data overføres til USA under EU-godkjente Standard Contractual Clauses (SCCs). Hume AI behandler stemmedata utelukkende for å levere sanntidsanalyse og bruker ikke dine data til modelltrening.</p>
        <p><strong style={{ color: "#fff" }}>AI-tolkning (Anthropic Claude):</strong> USA-basert. Brukes for tekstbasert dialog (Spør Munken). Data overføres under SCCs. Anthropic bruker ikke dine data til modelltrening.</p>
        <p><strong style={{ color: "#fff" }}>Hosting (Vercel):</strong> Web-applikasjonen leveres globalt via Vercels CDN. Selve dataene lagres som beskrevet ovenfor.</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>5. Tredjepartsdeling</h2>
        <p>Vi <strong style={{ color: "#fff" }}>selger ikke</strong> dine personopplysninger eller helsedata til noen. Vi deler aldri stemmedata, refleksjoner eller biometriske målinger med annonsører eller datameglere.</p>
        <p>Data deles kun med tjenesteleverandører som er nødvendige for å drive appen (Supabase, Hume AI, Anthropic, Vercel, Apple, Google). Disse opptrer som databehandlere på våre vegne under GDPR-godkjente avtaler.</p>
        <p><strong style={{ color: "#fff" }}>Apple HealthKit-spesifikt:</strong> Data hentet via Apple HealthKit brukes ikke til reklame, markedsføring, salg, eller deling med datameglere, i samsvar med Apples HealthKit-lisensvilkår.</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>6. Dine rettigheter</h2>
        <p>Du har under GDPR rett til:</p>
        <ul style={{ paddingLeft: "20px", marginBottom: "16px" }}>
          <li>Innsyn i hvilke data vi har om deg</li>
          <li>Retting av feilaktige opplysninger</li>
          <li>Sletting av dine data ("retten til å bli glemt")</li>
          <li>Dataportabilitet — få utlevert dine data i et maskinlesbart format</li>
          <li>Begrensning av behandling</li>
          <li>Trekke samtykke tilbake når som helst</li>
          <li>Klage til Datatilsynet (<a href="https://www.datatilsynet.no" style={{ color: "#D4AF37" }}>datatilsynet.no</a>)</li>
        </ul>
        <p>For å utøve disse rettighetene, kontakt <a href="mailto:thomas@themunk.ai" style={{ color: "#D4AF37" }}>thomas@themunk.ai</a>. Vi svarer innen 30 dager.</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>7. Sletting av konto og data</h2>
        <p>Helsedata fra wearables slettes automatisk <strong style={{ color: "#fff" }}>12 måneder</strong> etter siste registrering, med mindre du aktivt fornyer behandlingen ved å fortsette å bruke tjenesten.</p>
        <p>Du kan slette kontoen din når som helst direkte i appen. Når du sletter kontoen, slettes alle personopplysninger og helsedata permanent innen <strong style={{ color: "#fff" }}>30 dager</strong>. Sikkerhetskopier overskrives i samme periode.</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>8. Aldersgrense</h2>
        <p>The Munk er kun for personer som er <strong style={{ color: "#fff" }}>18 år eller eldre</strong>. Vi behandler ikke bevisst data fra mindreårige.</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>9. Sikkerhet</h2>
        <p>Vi bruker kryptering i transport (TLS 1.3) og i hvile (AES-256) for alle data. Tilgang til produksjonsdata er begrenset til nødvendige administratorer.</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>10. The Munk er ikke medisinsk utstyr</h2>
        <p>The Munk gir innsikt om kroppens signaler basert på data fra wearables. Vi gir ikke medisinske diagnoser, behandling eller anbefalinger. Ved alvorlige helseproblemer, kontakt lege eller helsepersonell.</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>11. AI-transparens</h2>
        <p>The Munk benytter AI-systemer (Anthropic Claude og Hume AI) for å generere innhold basert på dine biometriske data og stemmeinput. I tråd med EU AI Act Artikkel 50 informerer vi deg eksplisitt: når du interagerer med Aria eller mottar refleksjoner fra Spør Munken, kommuniserer du med et AI-system. AI-genererte estimater og refleksjoner er ikke psykologiske diagnoser eller medisinske vurderinger.</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>12. Endringer i denne erklæringen</h2>
        <p>Ved vesentlige endringer varsler vi deg via e-post og i appen minst 30 dager før endringen trer i kraft.</p>

        <h2 style={{ fontSize: "22px", fontFamily: \'"Crimson Pro", serif\', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>13. Kontakt</h2>
        <p>Spørsmål om personvern? Kontakt oss på <a href="mailto:thomas@themunk.ai" style={{ color: "#D4AF37" }}>thomas@themunk.ai</a>.</p>

        <div style={{ marginTop: "60px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.10)", fontSize: "12px", color: "rgba(255,255,255,0.40)" }}>
          The Munk er et produkt fra Holms Holding AS. Org.nr 989705121.
        </div>
      </div>
    </div>
  );
}
