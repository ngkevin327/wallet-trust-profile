"use client";

import type { WalletDto } from "@onchain-reputation/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { api, ApiError } from "../../../lib/api/client";
import { signInWithEthereum } from "../../../lib/auth/siwe";
import { getAccessToken } from "../../../lib/auth/token";

const FREE_WALLET_LIMIT = 1;

export default function WalletSettingsPage() {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [wallets, setWallets] = useState<WalletDto[]>([]);
  const [tier, setTier] = useState<"free" | "premium">("free");
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
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-brand-700 hover:underline">
        ← Back
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-slate-900">Linked wallets</h1>
      <p className="mt-2 text-slate-600">
        Free accounts can link {FREE_WALLET_LIMIT} wallet. Premium supports up to 3.
      </p>

      {atLimit ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You have reached your wallet limit ({limit}). Upgrade to premium to link more.
        </p>
      ) : null}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading wallets…</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {wallets.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-mono text-sm">{w.address}</p>
                <p className="text-xs text-slate-500">
                  {w.chainScope.join(", ")}
                  {w.isPrimary ? " · primary" : ""}
                </p>
              </div>
            </li>
          ))}
          {wallets.length === 0 ? (
            <li className="text-sm text-slate-500">No wallets linked yet.</li>
          ) : null}
        </ul>
      )}

      {!atLimit && address ? (
        <button
          type="button"
          onClick={handleLinkCurrent}
          className="mt-6 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
        >
          Link connected wallet
        </button>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </main>
  );
}
