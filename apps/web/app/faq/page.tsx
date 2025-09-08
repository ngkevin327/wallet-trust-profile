import Link from "next/link";
import { SiteFooter } from "../../components/layout/footer";

const faqs = [
  {
    q: "Do you custody funds?",
    a: "No. Sign-in uses SIWE (Sign-In With Ethereum) for authentication only. Indexing is read-only via public RPC data.",
  },
  {
    q: "Can I hide my profile?",
    a: "Yes. Set visibility to private in Settings. Public API and CDN routes return 404 — we do not leak whether a slug exists.",
  },
  {
    q: "How is governance scored?",
    a: "On-chain governance plus optional Snapshot votes (when enabled). See scoring methodology for weights and coverage limits.",
  },
  {
    q: "What are trust signals?",
    a: "Explainable risk flags from a registry of known exploit contracts plus heuristics. Each signal includes confidence and a reason string.",
  },
  {
    q: "What are premium features?",
    a: "MVP includes a subscription placeholder: manual re-index, exports, and analytics. Billing is not required to create a public profile.",
  },
  {
    q: "Why is my profile empty?",
    a: "New wallets may have no indexed activity yet. Failed indexing shows a retry CTA on the dashboard. See How it works for the flow.",
  },
];

export default function FaqPage() {
  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="text-sm text-brand-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">FAQ</h1>
        <p className="mt-2 text-slate-600">
          Wallet safety, scoring transparency, and privacy controls for Onchain Reputation.
        </p>

        <div className="mt-10 space-y-8">
          {faqs.map((item) => (
            <section key={item.q} className="space-y-2">
              <h2 className="text-lg font-medium text-slate-900">{item.q}</h2>
              <p className="text-slate-600">{item.a}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-slate-500">
          Full methodology:{" "}
          <Link href="/documentation/scoring-methodology" className="text-brand-700 hover:underline">
            scoring methodology
          </Link>
          {" · "}
          <Link href="/documentation/trust-signals" className="text-brand-700 hover:underline">
            trust signals
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
