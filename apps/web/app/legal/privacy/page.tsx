import { MarketingPage } from "../../../components/layout/marketing-page";
import { PageHeader } from "../../../components/layout/page-header";

export const metadata = {
  title: "Privacy Policy — Onchain Reputation",
};

export default function PrivacyPage() {
  return (
    <MarketingPage>
      <article className="prose prose-slate prose-brand max-w-none">
        <PageHeader title="Privacy Policy" backHref="/" backLabel="← Home" />
        <p className="alert alert-warning not-prose">
          <strong>Draft placeholder.</strong> Requires review by legal counsel before general
          availability. Do not treat as legal advice.
        </p>

        <h2>What we collect</h2>
        <p>
          We analyze public on-chain activity for wallets you connect. We store profile settings,
          reputation scores, and optional billing data when you subscribe via Stripe.
        </p>

        <h2>How we use data</h2>
        <ul>
          <li>Compute and display reputation scores and badges</li>
          <li>Provide shareable public profiles you choose to publish</li>
          <li>Process payments and entitlements for Premium features</li>
        </ul>

        <h2>Your rights (GDPR)</h2>
        <p>
          You may request access, correction, or deletion of personal data we hold. Contact{" "}
          <a href="mailto:privacy@onchain-reputation.example">privacy@onchain-reputation.example</a>
          .
        </p>

        <h2>Data retention</h2>
        <p>
          Profile and indexing data are retained while your account is active. Export artifacts
          expire per your plan settings.
        </p>

        <p className="text-sm text-slate-500">Last updated: May 2026</p>
      </article>
    </MarketingPage>
  );
}
