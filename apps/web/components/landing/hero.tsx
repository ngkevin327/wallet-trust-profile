import Link from "next/link";
import { ConnectWalletButton } from "../connect-wallet-button";
import { ScoreDisplay } from "../ui/score-display";

export function LandingHero() {
  return (
    <section className="mesh-hero relative overflow-hidden border-b border-slate-200/60">
      <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24 lg:gap-16">
        <div className="animate-slide-up text-center md:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Verifiable onchain profiles
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            <span className="text-gradient">Professional reputation</span>
            <br />
            <span className="text-slate-900">from wallet activity</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 md:mx-0 mx-auto">
            Turn governance votes, DAO contributions, and payment patterns into a shareable trust
            profile — without custody or manual résumés.
          </p>
          <div
            id="connect"
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:justify-start"
          >
            <ConnectWalletButton />
            <Link href="/how-it-works" className="ui-btn ui-btn-secondary">
              How it works
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Read-only wallet connect · Ethereum + Base · Shareable public URL
          </p>
        </div>

        <div className="animate-fade-in mx-auto w-full max-w-md md:max-w-none">
          <div className="ui-card-elevated relative overflow-hidden shadow-glow">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-600 to-accent" />
            <p className="text-center text-xs font-medium uppercase tracking-wider text-slate-500">
              Example public profile
            </p>
            <div className="mt-4 flex items-center gap-4 border-b border-slate-100 pb-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 font-display text-lg font-bold text-white shadow-md"
                aria-hidden
              >
                DB
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-slate-900">Demo Builder</p>
                <p className="text-sm text-slate-500">@demo-builder</p>
              </div>
            </div>
            <div className="py-6">
              <ScoreDisplay score={72} size="md" />
            </div>
            <div className="flex flex-wrap justify-center gap-2 border-t border-slate-100 pt-4">
              {["Active Voter", "DAO Contributor", "Reliable Payer"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 ring-1 ring-brand-100"
                >
                  {badge}
                </span>
              ))}
            </div>
            <Link
              href="/u/demo-builder"
              className="mt-4 block text-center text-sm font-medium text-brand-700 hover:text-brand-600"
            >
              View live demo profile →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
