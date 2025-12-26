export const metadata = {
  title: "Privacy Policy — Onchain Reputation",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <strong>Draft placeholder.</strong> Requires review by legal counsel before general
        availability. Do not treat as legal advice.
      </p>

      <h2>What we collect</h2>
      <p>
        We analyze public on-chain activity for wallets you connect. We store profile settings,
        reputation scores, and optional billing data when you subscribe via Stripe.
      </p>

      <h2>How we use data</h2>
      <ul>
        <li>Compute and display reputation scores and badges</li>
        <li>Provide shareable public profiles you choose to publish</li>
        <li>Process payments and entitlements for Premium features</li>
      </ul>

      <h2>Your rights (GDPR)</h2>
      <p>
        You may request access, correction, or deletion of personal data we hold. Contact{" "}
        <a href="mailto:privacy@onchain-reputation.example">privacy@onchain-reputation.example</a>.
      </p>

      <h2>Data retention</h2>
      <p>
        Profile and indexing data are retained while your account is active. Export artifacts expire
        per your plan settings.
      </p>

      <p className="text-sm text-slate-500">Last updated: May 2026</p>
    </main>
  );
}
