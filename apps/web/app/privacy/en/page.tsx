export const metadata = {
  title: "Privacy Policy — The Munk",
  description: "How The Munk processes your personal data and health information.",
};

export default function PrivacyPageEN() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a1f0d", color: "#f0ebe3", padding: "60px 24px", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", lineHeight: 1.7 }}>
        <a href="/check-in" style={{ fontSize: "13px", color: "rgba(212,175,55,0.70)", textDecoration: "none" }}>← Back to app</a>
        <div style={{ fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(212,175,55,0.60)", marginTop: "32px", marginBottom: "12px" }}>The Munk</div>
        <h1 style={{ fontFamily: '"Crimson Pro", ui-serif, Georgia, serif', fontSize: "42px", fontWeight: 400, marginBottom: "8px", color: "#fff" }}>Privacy Policy</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", marginBottom: "8px" }}>Last updated: April 17, 2026</p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", marginBottom: "40px" }}><a href="/privacy" style={{ color: "rgba(212,175,55,0.70)" }}>Norsk versjon →</a></p>

        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", marginBottom: "32px" }}>
          The Munk is a stress-interpretation app that helps you understand your body&apos;s signals. We process personal data and health information to deliver this service. This policy explains what data we collect, why, and what rights you have.
        </p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>1. Data Controller</h2>
        <p>Holms Holding AS, org. no. 989705121, Homansvei 2a, 1365 Blommenholm, Norway.</p>
        <p>Contact for privacy inquiries: <a href="mailto:thomas@themunk.ai" style={{ color: "#D4AF37" }}>thomas@themunk.ai</a></p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>2. Data We Collect</h2>
        <p><strong style={{ color: "#fff" }}>Health data from wearables:</strong> When you connect Oura Ring or Apple Health, we retrieve heart rate variability (HRV), resting heart rate, sleep data, activity, and stress score. These are sensitive personal data under GDPR Article 9.</p>
        <p><strong style={{ color: "#fff" }}>Voice data:</strong> When you speak with Aria (our voice feature powered by Hume AI), audio is processed in real time to give you a response. Voice recordings are not permanently stored by us. Hume AI may store short session data per their own privacy policy.</p>
        <p><strong style={{ color: "#fff" }}>Reflections and notes:</strong> Text you write in the app.</p>
        <p><strong style={{ color: "#fff" }}>Account information:</strong> Email address and username.</p>
        <p><strong style={{ color: "#fff" }}>Metadata:</strong> Time of use, device type, operating system, IP address (for security), and general usage statistics for product improvement.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>3. Why We Process the Data (Legal Basis)</h2>
        <p><strong style={{ color: "#fff" }}>Contract (GDPR Art. 6.1.b):</strong> To deliver the service itself — show you today&apos;s stress status, give you insight, and offer Aria conversations.</p>
        <p><strong style={{ color: "#fff" }}>Explicit consent (GDPR Art. 9.2.a):</strong> For processing health data. You give consent when you connect a wearable or use Aria. You can withdraw consent at any time.</p>
        <p><strong style={{ color: "#fff" }}>Legitimate interest (GDPR Art. 6.1.f):</strong> For operations, security, and product improvement (anonymized, aggregated data).</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>4. Where Data Is Stored</h2>
        <p><strong style={{ color: "#fff" }}>Database (Supabase):</strong> Stored in the EU (Ireland, eu-west-1). Data does not leave the EU.</p>
        <p><strong style={{ color: "#fff" }}>Voice processing (Hume AI):</strong> US-based. Data is transferred to the US under EU-approved Standard Contractual Clauses (SCCs).</p>
        <p><strong style={{ color: "#fff" }}>AI interpretation (Anthropic Claude):</strong> US-based. Used for text-based dialogue (Ask the Munk). Data transferred under SCCs. Anthropic does not use your data for model training.</p>
        <p><strong style={{ color: "#fff" }}>Hosting (Vercel):</strong> The web application is delivered globally via Vercel&apos;s CDN. The data itself is stored as described above.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>5. Third-Party Sharing</h2>
        <p>We <strong style={{ color: "#fff" }}>do not sell</strong> your personal data or health information to anyone. We never share voice data, reflections, or biometric measurements with advertisers or data brokers.</p>
        <p>Data is only shared with service providers necessary to operate the app (Supabase, Hume AI, Anthropic, Vercel, Apple, Google). They act as data processors on our behalf under GDPR-compliant agreements.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>6. Your Rights</h2>
        <p>Under GDPR you have the right to:</p>
        <ul style={{ paddingLeft: "20px", marginBottom: "16px" }}>
          <li>Access the data we hold about you</li>
          <li>Correct inaccurate information</li>
          <li>Delete your data (the &quot;right to be forgotten&quot;)</li>
          <li>Data portability — receive your data in a machine-readable format</li>
          <li>Restrict processing</li>
          <li>Withdraw consent at any time</li>
          <li>Lodge a complaint with the Norwegian Data Protection Authority (<a href="https://www.datatilsynet.no" style={{ color: "#D4AF37" }}>datatilsynet.no</a>)</li>
        </ul>
        <p>To exercise these rights, contact <a href="mailto:thomas@themunk.ai" style={{ color: "#D4AF37" }}>thomas@themunk.ai</a>. We respond within 30 days.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>7. Account and Data Deletion</h2>
        <p>You can delete your account at any time directly in the app. When you delete your account, all personal data and health information are permanently deleted within <strong style={{ color: "#fff" }}>30 days</strong>. Backups are overwritten in the same period.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>8. Age Limit</h2>
        <p>The Munk is for individuals who are <strong style={{ color: "#fff" }}>18 years or older</strong>. We do not knowingly process data from minors.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>9. Security</h2>
        <p>We use encryption in transit (TLS 1.3) and at rest (AES-256) for all data. Access to production data is limited to necessary administrators.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>10. The Munk Is Not Medical Equipment</h2>
        <p>The Munk provides insight into your body&apos;s signals based on wearable data. We do not provide medical diagnoses, treatment, or recommendations. For serious health concerns, contact a doctor or healthcare professional.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>11. Changes to This Policy</h2>
        <p>For material changes, we notify you via email and in the app at least 30 days before the change takes effect.</p>

        <h2 style={{ fontSize: "22px", fontFamily: '"Crimson Pro", serif', marginTop: "40px", marginBottom: "12px", color: "#D4AF37" }}>12. Contact</h2>
        <p>Privacy questions? Contact us at <a href="mailto:thomas@themunk.ai" style={{ color: "#D4AF37" }}>thomas@themunk.ai</a>.</p>

        <div style={{ marginTop: "60px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.10)", fontSize: "12px", color: "rgba(255,255,255,0.40)" }}>
          The Munk is a product of Holms Holding AS. Org. no. 989705121.
        </div>
      </div>
    </div>
  );
}
