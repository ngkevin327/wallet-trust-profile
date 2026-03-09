"use client";

import type { WalletDto } from "@onchain-reputation/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../../../components/layout/page-header";
import { LinkWalletForm } from "../../../components/wallets/link-wallet-form";
import { api, ApiError } from "../../../lib/api/client";
import { getAccessToken } from "../../../lib/auth/token";

const FREE_WALLET_LIMIT = 1;

export default function WalletSettingsPage() {
  const [wallets, setWallets] = useState<WalletDto[]>([]);
  const [tier] = useState<"free" | "premium">("free");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWallets = useCallback(async () => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    try {
      const data = (await api.getMyWallets()) as WalletDto[];
      setWallets(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWallets();
  }, [loadWallets]);

  const limit = tier === "premium" ? 3 : FREE_WALLET_LIMIT;
  const atLimit = wallets.length >= limit;

  return (
    <div className="page-content">
      <PageHeader
        title="Linked wallets"
        lead={`Free accounts can link ${FREE_WALLET_LIMIT} wallet. Premium supports up to 3.`}
        backHref="/dashboard"
        backLabel="← Dashboard"
      />

      {atLimit ? (
        <p className="alert alert-warning mb-6">
          You have reached your wallet limit ({limit}).{" "}
          <Link href="/pricing" className="link-brand">
            Upgrade to premium
          </Link>{" "}
          to link more.
        </p>
      ) : null}

      {loading ? (
        <p className="text-slate-500">Loading wallets…</p>
      ) : (
        <ul className="space-y-3">
          {wallets.map((w) => (
            <li key={w.id} className="list-row">
              <div>
                <p className="font-mono text-sm text-slate-900">{w.address}</p>
                <p className="text-xs text-slate-500">
                  {w.chainScope.join(", ")}
                  {w.isPrimary ? " · primary" : ""}
                </p>
              </div>
            </li>
          ))}
          {wallets.length === 0 ? (
            <li className="ui-card text-sm text-slate-500">No wallets linked yet.</li>
          ) : null}
        </ul>
      )}

      {!atLimit ? (
        <section className="ui-card mt-8">
          <h2 className="section-title">Add a public address</h2>
          <p className="mt-1 text-sm text-slate-600">
            Enter any Ethereum address you control, then sign once to link it. Read-only indexing
            only — no custody.
          </p>
          <div className="mt-4">
            <LinkWalletForm mode="link" disabled={atLimit} onSuccess={() => void loadWallets()} />
          </div>
        </section>
      ) : null}

      {error ? <p className="alert alert-error mt-4">{error}</p> : null}
    </div>
  );
}
