"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortalSession, getSubscriptionStatus } from "../../../lib/api/billing";
import { ApiError } from "../../../lib/api/client";
import { getAccessToken } from "../../../lib/auth/token";

export default function BillingSettingsPage() {
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
  }, []);

  async function openPortal() {
    setError(null);
    setLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not open billing portal");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <p className="mt-2 text-sm text-slate-600">
        Plan: <span className="font-medium capitalize">{plan ?? "…"}</span>
      </p>

      {plan === "premium" ? (
        <p className="mt-4 text-sm text-slate-600">
          Manage payment method, invoices, or cancel at period end in the Stripe customer portal.
        </p>
      ) : (
        <p className="mt-4 text-sm text-slate-600">
          Upgrade to Premium for PDF exports, score history, and manual refresh.
        </p>
      )}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {plan === "premium" ? (
          <button
            type="button"
            onClick={() => void openPortal()}
            disabled={loading}
            className="ui-btn ui-btn-primary"
          >
            {loading ? "Opening…" : "Manage billing"}
          </button>
        ) : (
          <Link href="/pricing" className="ui-btn ui-btn-primary">
            View pricing
          </Link>
        )}
        <Link href="/settings/profile" className="ui-btn ui-btn-secondary">
          Back to settings
        </Link>
      </div>

      {plan === "free" ? (
        <p className="mt-6 text-xs text-slate-500">
          If you recently canceled Premium, your profile keeps public data; premium-only features lock at
          period end.
        </p>
      ) : null}
    </main>
  );
}
