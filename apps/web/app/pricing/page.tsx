"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ENTITLEMENT_FEATURES } from "@onchain-reputation/shared";
import { createCheckoutSession, getSubscriptionStatus } from "../../lib/api/billing";
import { ApiError } from "../../lib/api/client";
import { getAccessToken } from "../../lib/auth/token";

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
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-slate-900">Pricing</h1>
      <p className="mt-2 text-slate-600">Free to start. Premium unlocks exports, refresh, and analytics.</p>

      {success ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Payment received — your plan should update within a minute. Current plan:{" "}
          {plan ?? "checking…"}
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="ui-card">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-2 text-3xl font-bold">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>1 linked wallet</li>
            <li>Public profile & JSON export</li>
            <li>Basic reputation index</li>
          </ul>
          <Link href="/dashboard" className="ui-btn ui-btn-secondary mt-6 inline-flex">
            Current plan
          </Link>
        </section>

        <section className="ui-card border-brand-500">
          <h2 className="text-xl font-semibold text-brand-700">Premium</h2>
          <p className="mt-2 text-3xl font-bold">$12/mo</p>
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
        <Link href="/legal/terms" className="text-brand-700 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="text-brand-700 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}
