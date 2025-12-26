export const metadata = {
  title: "Terms of Service — Onchain Reputation",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 prose prose-slate">
      <h1>Terms of Service</h1>
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <strong>Draft placeholder.</strong> Requires review by legal counsel before general
        availability.
      </p>

      <h2>Service description</h2>
      <p>
        Onchain Reputation provides software that indexes public blockchain data and presents
        reputation scores. Scores are informational only and not credit decisions or investment
        advice.
      </p>

      <h2>Wallet authentication</h2>
      <p>
        You authenticate with a self-custodial wallet via Sign-In with Ethereum (SIWE). You are
        responsible for securing your wallet and keys.
      </p>

      <h2>Premium billing</h2>
      <p>
        Paid plans are billed through Stripe. Subscriptions renew until canceled in the billing
        portal. Refunds follow Stripe and our published refund policy.
      </p>

      <h2>Acceptable use</h2>
      <p>You may not abuse the API, scrape at rates that impair the service, or misrepresent scores.</p>

      <h2>Limitation of liability</h2>
      <p>
        The service is provided as-is to the maximum extent permitted by law. See counsel-reviewed
        version for full terms.
      </p>

      <p className="text-sm text-slate-500">Last updated: May 2026</p>
    </main>
  );
}
