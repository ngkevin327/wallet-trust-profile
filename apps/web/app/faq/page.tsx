import Link from "next/link";
import { MarketingPage } from "../../components/layout/marketing-page";
import { PageHeader } from "../../components/layout/page-header";

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
    <MarketingPage>
      <PageHeader
        title="FAQ"
        lead="Wallet safety, scoring transparency, and privacy controls for Onchain Reputation."
        backHref="/"
        backLabel="← Home"
      />

      <div className="space-y-6">
        {faqs.map((item) => (
          <section key={item.q} className="ui-card">
            <h2 className="section-title">{item.q}</h2>
            <p className="mt-2 text-slate-600">{item.a}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-slate-500">
        Full methodology:{" "}
        <Link href="/documentation/scoring-methodology" className="link-brand">
          scoring methodology
        </Link>
        {" · "}
        <Link href="/documentation/trust-signals" className="link-brand">
          trust signals
        </Link>
      </p>
    </MarketingPage>
  );
}
