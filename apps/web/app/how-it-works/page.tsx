import Link from "next/link";
import { SiteFooter } from "../../components/layout/footer";

export default function HowItWorksPage() {
  return (
    <>
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="text-sm text-brand-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">How it works</h1>
        <ol className="mt-8 list-decimal space-y-4 pl-5 text-slate-600">
          <li>
            <strong className="text-slate-900">Connect your wallet</strong> — read-only SIWE sign-in.
            We never custody funds or request transaction signatures for indexing.
          </li>
          <li>
            <strong className="text-slate-900">Index activity</strong> — we scan Ethereum and Base for
            governance, DAO treasury inflows, protocol usage, and transfers.
          </li>
          <li>
            <strong className="text-slate-900">Compute scores</strong> — four dimensions combine into a
            0–100 reputation index with immutable snapshots for auditability.
          </li>
          <li>
            <strong className="text-slate-900">Share your profile</strong> — publish at{" "}
            <code className="text-sm">/u/your-slug</code> or keep the profile private.
          </li>
        </ol>
        <section className="mt-10 rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-medium">Privacy</h2>
          <p className="mt-2 text-slate-600">
            Private profiles return 404 on public routes. Premium features (exports, refresh) are optional
            upgrades described in our FAQ.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
