export const metadata = {
  title: "Vilk\u00e5r for bruk \u2014 The Munk",
  description: "Vilk\u00e5r og betingelser for bruk av The Munk-appen.",
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a1f0d", color: "#f0ebe3", padding: "60px 24px 120px", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", lineHeight: 1.7 }}>
        <a href="/check-in" style={{ fontSize: "13px", color: "rgba(212,175,55,0.70)", textDecoration: "none" }}>{`\u2190 Tilbake til appen`}</a>
        <div style={{ fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(212,175,55,0.60)", marginTop: "32px", marginBottom: "12px" }}>The Munk</div>
        <h1 style={{ fontFamily: '"Crimson Pro", ui-serif, Georgia, serif', fontSize: "42px", fontWeight: 400, marginBottom: "8px", color: "#fff" }}>{`Vilk\u00e5r for bruk`}</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", marginBottom: "8px" }}>Sist oppdatert: 17. april 2026</p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", marginBottom: "40px" }}><a href="/terms/en" style={{ color: "rgba(212,175,55,0.70)" }}>English version \u2192</a></p>

        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", marginBottom: "32px" }}>
          Velkommen til The Munk. Ved \u00e5 bruke appen samtykker du til disse vilk\u00e5rene. Les dem n\u00f8ye.
        </p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>1. Hvem vi er</h2>
        <p>The Munk leveres av Holms Holding AS, org.nr 989705121, Homansvei 2a, 1365 Blommenholm, Norge. Kontakt: <a href="mailto:thomas@themunk.ai" style={{ color: "#D4AF37" }}>thomas@themunk.ai</a>.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>2. Hva tjenesten er</h2>
        <p>The Munk er en stress-tolkningsapp som leser data fra wearables (Oura Ring, Apple Health, Garmin, Whoop, Samsung Health, Google Health Connect) og hjelper deg \u00e5 forst\u00e5 kroppens signaler gjennom innsikt og samtaler med Aria, v\u00e5r stemmebaserte assistent.</p>
        <p><strong style={{ color: "#fff" }}>The Munk er en wellness-app, ikke medisinsk utstyr.</strong> Vi gir ikke medisinske diagnoser, behandlingsr\u00e5d eller terapi. Innholdet i appen er kun informativt og skal ikke erstatte profesjonell medisinsk hjelp. Ved alvorlige helseproblemer, kontakt lege eller helsepersonell umiddelbart.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>3. Aldersgrense</h2>
        <p>Du m\u00e5 v\u00e6re minst <strong style={{ color: "#fff" }}>18 \u00e5r</strong> for \u00e5 bruke The Munk. Ved registrering bekrefter du at du oppfyller dette kravet.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>4. Konto</h2>
        <p>Du er ansvarlig for \u00e5 holde p\u00e5loggingsinformasjonen din konfidensiell og for all aktivitet under kontoen din. Varsle oss umiddelbart ved mistanke om uautorisert tilgang.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>5. Tillatt bruk</h2>
        <p>Du forplikter deg til \u00e5 bruke The Munk kun til personlig, ikke-kommersielt form\u00e5l, og til \u00e5 ikke:</p>
        <ul style={{ paddingLeft: "20px", marginBottom: "16px" }}>
          <li>Fors\u00f8ke \u00e5 reverse-engineere eller hacke appen</li>
          <li>Bruke appen for ulovlige form\u00e5l</li>
          <li>Overf\u00f8re skadelig kode eller virus</li>
          <li>Skrape data eller automatisere tilgang uten skriftlig samtykke</li>
          <li>Dele kontoen med andre</li>
        </ul>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>6. Wearables og tredjepartsdata</h2>
        <p>N\u00e5r du kobler en wearable (Oura, Apple Health, Garmin, Whoop, Samsung Health, Google Health Connect), gir du samtykke til at vi henter relevante helsedata fra leverand\u00f8ren. Du er ansvarlig for vilk\u00e5rene mellom deg og wearable-leverand\u00f8ren.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>7. Aria, AI-transparens og AI-funksjoner</h2>
        <p>Aria er en stemmebasert assistent levert av Hume AI. Sp\u00f8r Munken bruker Anthropic Claude. I tr\u00e5d med EU AI Act Artikkel 50 informerer vi deg eksplisitt om at du kommuniserer med et AI-system n\u00e5r du bruker disse funksjonene. Disse KI-systemene kan gi feilaktige eller upresise svar. Bruk svarene som inspirasjon, ikke som fasit. AI-genererte refleksjoner er ikke psykologiske diagnoser eller medisinske vurderinger.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>8. Pris</h2>
        <p>The Munk er gratis i testperioden (Phase 1). Eventuelle fremtidige abonnementsmodeller vil bli kommunisert med minst 30 dagers varsel.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>9. Immaterielle rettigheter</h2>
        <p>All kode, design, tekst, logo og innhold i The Munk eies av Holms Holding AS. Innhold du selv genererer (refleksjoner, notater) eier du, men du gir oss en lisens til \u00e5 lagre og prosessere disse for \u00e5 levere tjenesten.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>10. Begrenset ansvar</h2>
        <p>The Munk leveres &quot;som den er&quot;. Vi gir ingen garantier for at tjenesten alltid er tilgjengelig, feilfri eller passer dine spesifikke behov. I den grad loven tillater det, er v\u00e5rt ansvar begrenset til det bel\u00f8pet du har betalt for tjenesten de siste 12 m\u00e5nedene (for gratis bruk: NOK 0).</p>
        <p>Vi er ikke ansvarlige for indirekte tap, tapt fortjeneste, eller skader som f\u00f8lge av at du har tatt beslutninger basert p\u00e5 informasjon fra appen.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>11. Oppsigelse</h2>
        <p>Du kan slette kontoen din n\u00e5r som helst. Vi kan suspendere eller avslutte tilgangen din ved brudd p\u00e5 vilk\u00e5rene, etter rimelig varsel der det er mulig.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>12. Endringer i tjenesten og vilk\u00e5rene</h2>
        <p>Vi kan endre tjenesten og disse vilk\u00e5rene. Vesentlige endringer varsles minst 30 dager f\u00f8r de trer i kraft. Fortsatt bruk etter endringer regnes som aksept.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>13. Lovvalg og verneting</h2>
        <p>Disse vilk\u00e5rene reguleres av norsk rett. Eventuelle tvister skal l\u00f8ses ved Oslo tingrett.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>14. Kontakt</h2>
        <p>Sp\u00f8rsm\u00e5l om vilk\u00e5rene? Kontakt <a href="mailto:thomas@themunk.ai" style={{ color: "#D4AF37" }}>thomas@themunk.ai</a>.</p>

        <div style={{ marginTop: "60px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.10)", fontSize: "12px", color: "rgba(255,255,255,0.40)" }}>
          The Munk er et produkt fra Holms Holding AS. Org.nr 989705121.
        </div>
      </div>
    </div>
  );
}
