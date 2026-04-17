export const metadata = {
  title: "Vilkår for bruk — The Munk",
  description: "Vilkår og betingelser for bruk av The Munk-appen.",
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a1f0d", color: "#f0ebe3", padding: "60px 24px", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", lineHeight: 1.7 }}>
        <a href="/check-in" style={{ fontSize: "13px", color: "rgba(212,175,55,0.70)", textDecoration: "none" }}>← Tilbake til appen</a>
        <div style={{ fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(212,175,55,0.60)", marginTop: "32px", marginBottom: "12px" }}>The Munk</div>
        <h1 style={{ fontFamily: '"Crimson Pro", ui-serif, Georgia, serif', fontSize: "42px", fontWeight: 400, marginBottom: "8px", color: "#fff" }}>Vilkår for bruk</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", marginBottom: "8px" }}>Sist oppdatert: 17. april 2026</p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", marginBottom: "40px" }}><a href="/terms/en" style={{ color: "rgba(212,175,55,0.70)" }}>English version →</a></p>

        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", marginBottom: "32px" }}>
          Velkommen til The Munk. Ved å bruke appen samtykker du til disse vilkårene. Les dem nøye.
        </p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>1. Hvem vi er</h2>
        <p>The Munk leveres av Holms Holding AS, org.nr 989705121, Homansvei 2a, 1365 Blommenholm, Norge. Kontakt: <a href="mailto:thomas@themunk.ai" style={{ color: "#D4AF37" }}>thomas@themunk.ai</a>.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>2. Hva tjenesten er</h2>
        <p>The Munk er en stress-tolkningsapp som leser data fra wearables (Oura Ring, Apple Health, m.fl.) og hjelper deg å forstå kroppens signaler gjennom innsikt og samtaler med Aria, vår stemmebaserte assistent.</p>
        <p><strong style={{ color: "#fff" }}>The Munk er en wellness-app, ikke medisinsk utstyr.</strong> Vi gir ikke medisinske diagnoser, behandlingsråd eller terapi. Innholdet i appen er kun informativt og skal ikke erstatte profesjonell medisinsk hjelp. Ved alvorlige helseproblemer, kontakt lege eller helsepersonell umiddelbart.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>3. Aldersgrense</h2>
        <p>Du må være minst <strong style={{ color: "#fff" }}>18 år</strong> for å bruke The Munk. Ved registrering bekrefter du at du oppfyller dette kravet.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>4. Konto</h2>
        <p>Du er ansvarlig for å holde påloggingsinformasjonen din konfidensiell og for all aktivitet under kontoen din. Varsle oss umiddelbart ved mistanke om uautorisert tilgang.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>5. Tillatt bruk</h2>
        <p>Du forplikter deg til å bruke The Munk kun til personlig, ikke-kommersielt formål, og til å ikke:</p>
        <ul style={{ paddingLeft: "20px", marginBottom: "16px" }}>
          <li>Forsøke å reverse-engineere eller hacke appen</li>
          <li>Bruke appen for ulovlige formål</li>
          <li>Overføre skadelig kode eller virus</li>
          <li>Skrape data eller automatisere tilgang uten skriftlig samtykke</li>
          <li>Dele kontoen med andre</li>
        </ul>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>6. Wearables og tredjepartsdata</h2>
        <p>Når du kobler en wearable (Oura, Apple Health), gir du samtykke til at vi henter relevante helsedata fra leverandøren. Du er ansvarlig for vilkårene mellom deg og wearable-leverandøren.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>7. Aria og AI-funksjoner</h2>
        <p>Aria er en stemmebasert assistent levert av Hume AI. Spør Munken bruker Anthropic Claude. Disse er KI-systemer og kan gi feilaktige eller upresise svar. Bruk svarene som inspirasjon, ikke som fasit.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>8. Pris</h2>
        <p>The Munk er gratis i testperioden (Phase 1). Eventuelle fremtidige abonnementsmodeller vil bli kommunisert med minst 30 dagers varsel.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>9. Immaterielle rettigheter</h2>
        <p>All kode, design, tekst, logo og innhold i The Munk eies av Holms Holding AS. Innhold du selv genererer (refleksjoner, notater) eier du, men du gir oss en lisens til å lagre og prosessere disse for å levere tjenesten.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>10. Begrenset ansvar</h2>
        <p>The Munk leveres "som den er". Vi gir ingen garantier for at tjenesten alltid er tilgjengelig, feilfri eller passer dine spesifikke behov. I den grad loven tillater det, er vårt ansvar begrenset til det beløpet du har betalt for tjenesten de siste 12 månedene (for gratis bruk: NOK 0).</p>
        <p>Vi er ikke ansvarlige for indirekte tap, tapt fortjeneste, eller skader som følge av at du har tatt beslutninger basert på informasjon fra appen.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>11. Oppsigelse</h2>
        <p>Du kan slette kontoen din når som helst. Vi kan suspendere eller avslutte tilgangen din ved brudd på vilkårene, etter rimelig varsel der det er mulig.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>12. Endringer i tjenesten og vilkårene</h2>
        <p>Vi kan endre tjenesten og disse vilkårene. Vesentlige endringer varsles minst 30 dager før de trer i kraft. Fortsatt bruk etter endringer regnes som aksept.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>13. Lovvalg og verneting</h2>
        <p>Disse vilkårene reguleres av norsk rett. Eventuelle tvister skal løses ved Oslo tingrett.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>14. Kontakt</h2>
        <p>Spørsmål om vilkårene? Kontakt <a href="mailto:thomas@themunk.ai" style={{ color: "#D4AF37" }}>thomas@themunk.ai</a>.</p>

        <div style={{ marginTop: "60px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.10)", fontSize: "12px", color: "rgba(255,255,255,0.40)" }}>
          The Munk er et produkt fra Holms Holding AS. Org.nr 989705121.
        </div>
      </div>
    </div>
  );
}
