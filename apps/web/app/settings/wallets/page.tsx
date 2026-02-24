"use client";

import type { WalletDto } from "@onchain-reputation/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { PageHeader } from "../../../components/layout/page-header";
import { api, ApiError } from "../../../lib/api/client";
import { signInWithEthereum } from "../../../lib/auth/siwe";
import { getAccessToken } from "../../../lib/auth/token";

const FREE_WALLET_LIMIT = 1;

export default function WalletSettingsPage() {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
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

  const handleLinkCurrent = async () => {
    if (!address || !chainId) {
      setError("Connect a wallet first");
      return;
    }
    setError(null);
    try {
      await signInWithEthereum({ address, chainId, signMessageAsync });
      await loadWallets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link wallet");
    }
  };

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

      {!atLimit && address ? (
        <button type="button" onClick={handleLinkCurrent} className="ui-btn ui-btn-primary mt-6">
          Link connected wallet
        </button>
      ) : null}

      {error ? <p className="alert alert-error mt-4">{error}</p> : null}
    </div>
  );
}
