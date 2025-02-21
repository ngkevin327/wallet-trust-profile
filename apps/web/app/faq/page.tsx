import Link from "next/link";

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-brand-700 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-6 text-2xl font-semibold">FAQ</h1>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-medium">How is governance scored?</h2>
        <p className="text-slate-600">
          We combine onchain governance interactions with Snapshot offchain votes where enabled.
          Snapshot coverage is best-effort — not every DAO space is indexed in MVP. See our{" "}
          <a href="/documentation/scoring-methodology" className="text-brand-700 hover:underline">
            scoring methodology
          </a>{" "}
          for dimension weights, snapshot audits, and badge rules.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">How are dimension weights applied?</h2>
        <p className="text-slate-600">
          Governance (25%), contribution (30%), payment reliability (25%), and protocol participation
          (20%) combine into a 0–100 reputation index. Each index run stores an immutable snapshot
          with an inputs hash for reproducibility.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">What are trust signals?</h2>
        <p className="text-slate-600">
          Trust signals highlight registry matches and heuristic risk patterns with confidence
          scores and plain-language reasons. See{" "}
          <a href="/documentation/trust-signals" className="text-brand-700 hover:underline">
            trust signal semantics
          </a>{" "}
          to dispute a flag.
        </p>
      </section>
    </main>
  );
}
