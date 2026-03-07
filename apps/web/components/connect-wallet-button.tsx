"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { signInWithEthereum } from "../lib/auth/siwe";
import { clearAccessToken } from "../lib/auth/token";

export function ConnectWalletButton() {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = () => {
    setError(null);
    const connector = connectors[0];
    if (!connector) {
      setError(
        "No wallet detected. Install a browser wallet (e.g. MetaMask) or set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for mobile QR connect.",
      );
      return;
    }
    connect({ connector });
  };

  const handleSignIn = async () => {
    if (!address || !chainId) {
      return;
    }
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithEthereum({ address, chainId, signMessageAsync });
      router.push("/onboarding/indexing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      console.error("[siwe]", err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDisconnect = () => {
    clearAccessToken();
    disconnect();
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleConnect}
          disabled={isConnecting}
          className="ui-btn ui-btn-primary"
          aria-label="Connect wallet"
        >
          {isConnecting ? "Connecting…" : "Connect wallet"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-slate-600">
        Connected: {address.slice(0, 6)}…{address.slice(-4)}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="ui-btn ui-btn-primary disabled:opacity-60"
        >
          {isSigningIn ? "Signing…" : "Sign in"}
        </button>
        <button type="button" onClick={handleDisconnect} className="ui-btn ui-btn-secondary">
          Disconnect
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
