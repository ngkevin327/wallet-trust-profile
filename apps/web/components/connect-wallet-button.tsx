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
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
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
      <button
        type="button"
        onClick={handleConnect}
        disabled={isConnecting}
        className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60"
      >
        {isConnecting ? "Connecting…" : "Connect wallet"}
      </button>
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
          className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {isSigningIn ? "Signing…" : "Sign in"}
        </button>
        <button
          type="button"
          onClick={handleDisconnect}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
        >
          Disconnect
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
