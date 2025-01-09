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
          for details.
        </p>
      </section>
    </main>
  );
}
