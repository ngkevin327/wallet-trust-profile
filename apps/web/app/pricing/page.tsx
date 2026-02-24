"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ENTITLEMENT_FEATURES } from "@onchain-reputation/shared";
import { createCheckoutSession, getSubscriptionStatus } from "../../lib/api/billing";
import { ApiError } from "../../lib/api/client";
import { getAccessToken } from "../../lib/auth/token";
import { MarketingPage } from "../../components/layout/marketing-page";
import { PageHeader } from "../../components/layout/page-header";

const FEATURE_LABELS: Record<string, string> = {
  multi_wallet: "Multiple linked wallets",
  refresh: "Manual profile refresh",
  export_pdf: "PDF reputation export",
  private_scores: "Private sub-score analytics",
  score_history: "90-day score history",
};

export default function PricingPage() {
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<"free" | "premium" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }
    void getSubscriptionStatus()
      .then((s) => setPlan(s.plan))
      .catch(() => setPlan("free"));
  }, [searchParams.get("success")]);

  async function upgrade() {
    setError(null);
    setLoading(true);
    try {
      const { url } = await createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  const success = searchParams.get("success") === "1";

  return (
    <MarketingPage width="content">
      <PageHeader
        title="Pricing"
        lead="Free to start. Premium unlocks exports, refresh, and analytics."
        backHref="/"
        backLabel="← Home"
      />

      {success ? (
        <p className="alert alert-success mb-6">
          Payment received — your plan should update within a minute. Current plan:{" "}
          {plan ?? "checking…"}
        </p>
      ) : null}

      {error ? <p className="alert alert-error mb-6">{error}</p> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="ui-card">
          <h2 className="font-display text-xl font-semibold text-slate-900">Free</h2>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>1 linked wallet</li>
            <li>Public profile & JSON export</li>
            <li>Basic reputation index</li>
          </ul>
          <Link href="/dashboard" className="ui-btn ui-btn-secondary mt-6 inline-flex">
            Go to dashboard
          </Link>
        </section>

        <section className="ui-card-highlight">
          <h2 className="font-display text-xl font-semibold text-brand-800">Premium</h2>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">$12/mo</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {ENTITLEMENT_FEATURES.map((f) => (
              <li key={f}>{FEATURE_LABELS[f] ?? f}</li>
            ))}
          </ul>
          <button
            type="button"
            disabled={loading || plan === "premium"}
            onClick={() => void upgrade()}
            className="ui-btn ui-btn-primary mt-6 w-full"
          >
            {plan === "premium" ? "Premium active" : loading ? "Redirecting…" : "Upgrade"}
          </button>
        </section>
      </div>

      <p className="mt-10 text-center text-xs text-slate-500">
        By upgrading you agree to our{" "}
        <Link href="/legal/terms" className="link-brand">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="link-brand">
          Privacy Policy
        </Link>
        .
      </p>
    </MarketingPage>
  );
}
