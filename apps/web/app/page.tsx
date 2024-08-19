import { ConnectWalletButton } from "../components/connect-wallet-button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-brand-700">
        Onchain reputation
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
        Trust built from wallet activity
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Connect your wallet to generate a shareable reputation profile — governance
        participation, DAO contributions, and payment reliability in one place.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <ConnectWalletButton />
        <a
          href="#how-it-works"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
        >
          How it works
        </a>
      </div>
      <section id="how-it-works" className="mt-20 space-y-6 border-t border-slate-200 pt-12">
        <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
        <ol className="list-decimal space-y-3 pl-5 text-slate-600">
          <li>Sign in with your wallet (read-only, no custody).</li>
          <li>We index onchain activity on Ethereum and Base.</li>
          <li>Review scores, badges, and your public profile link.</li>
        </ol>
      </section>
    </main>
  );
}
