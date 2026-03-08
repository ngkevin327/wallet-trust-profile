import { DataAccessSection } from "../../components/marketing/data-access-section";
import { MarketingPage } from "../../components/layout/marketing-page";
import { PageHeader } from "../../components/layout/page-header";

export default function HowItWorksPage() {
  return (
    <MarketingPage>
      <PageHeader
        title="How it works"
        lead="From wallet connect to a shareable reputation profile in four steps."
        backHref="/"
        backLabel="← Home"
      />
      <ol className="mt-2 list-decimal space-y-4 pl-5 text-slate-600">
        <li>
          <strong className="text-slate-900">Add your public address</strong> — paste a{" "}
          <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-sm text-brand-800">0x…</code>{" "}
          address or use a connected wallet, then sign once with SIWE. We never custody funds or
          request transaction signatures for indexing.
        </li>
        <li>
          <strong className="text-slate-900">Index activity</strong> — we scan Ethereum and Base for
          governance, DAO treasury inflows, protocol usage, and transfers.
        </li>
        <li>
          <strong className="text-slate-900">Compute scores</strong> — four dimensions combine into
          a 0–100 reputation index with immutable snapshots for auditability.
        </li>
        <li>
          <strong className="text-slate-900">Share your profile</strong> — publish at{" "}
          <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-sm text-brand-800">
            /u/your-slug
          </code>{" "}
          or keep the profile private.
        </li>
      </ol>
      <div className="mt-10">
        <DataAccessSection />
      </div>
      <section className="ui-card mt-10">
        <h2 className="section-title">Privacy</h2>
        <p className="mt-2 text-slate-600">
          Private profiles return 404 on public routes. Premium features (exports, refresh) are
          optional upgrades described in our FAQ.
        </p>
      </section>
    </MarketingPage>
  );
}
