import { ConnectWalletButton } from "../connect-wallet-button";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center md:text-left">
      <p className="text-sm font-medium uppercase tracking-wide text-brand-700">Onchain Reputation</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
        Professional reputation from wallet activity
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Turn governance votes, DAO contributions, and payment patterns into a shareable trust
        profile — without custody or manual résumés.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
        <div id="connect">
          <ConnectWalletButton />
        </div>
        <a
          href="/how-it-works"
          className="ui-btn ui-btn-secondary"
        >
          How it works
        </a>
      </div>
    </section>
  );
}
