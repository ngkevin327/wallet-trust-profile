const ACCESSES = [
  "Public on-chain transfers and contract interactions (Ethereum + Base) for wallets you link",
  "Governance and DAO activity matched to our curated registry",
  "Profile settings you choose (display name, slug, public vs private)",
  "Billing metadata if you subscribe to Premium (via Stripe)",
];

const NO_ACCESS = [
  "Seed phrases, private keys, or ability to move your funds",
  "Email inboxes, social accounts, browser history, or device files",
  "Off-chain bank or card data",
  "Signing transactions on your behalf — SIWE is authentication only",
];

export function DataAccessSection({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "" : "ui-card"}>
      <h2 className={compact ? "section-title" : "page-title text-2xl"}>
        What we access — and what we don&apos;t
      </h2>
      <p className="mt-2 text-slate-600">
        We analyze <strong className="font-medium text-slate-800">public blockchain data</strong>{" "}
        for addresses you link and control. We do not scrape private off-chain accounts or take
        custody of assets.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-700">We use</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            {ACCESSES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            We never access
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            {NO_ACCESS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        You can paste a public address and prove ownership with a one-time wallet signature — we
        never store your keys. Private profiles stay off public URLs.
      </p>
    </section>
  );
}
