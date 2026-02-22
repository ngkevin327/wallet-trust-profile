import { LandingHero } from "../components/landing/hero";
import { Personas } from "../components/landing/personas";
import { ValueProps } from "../components/landing/value-props";
import { SiteFooter } from "../components/layout/footer";
import { SiteHeader } from "../components/layout/site-header";

export default function HomePage() {
  return (
    <div id="main-content" className="min-h-screen">
      <SiteHeader variant="transparent" />
      <LandingHero />
      <ValueProps />
      <Personas />
      <section className="border-t border-slate-200 bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 py-16 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Ready to share your onchain credibility?
          </h2>
          <p className="mt-3 text-brand-100">
            Connect your wallet, index activity, and publish a profile in minutes.
          </p>
          <a
            href="/#connect"
            className="ui-btn mt-8 inline-flex bg-white text-brand-800 hover:bg-brand-50"
          >
            Connect wallet — it&apos;s free to start
          </a>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
