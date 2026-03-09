"use client";

import { CHAIN_IDS } from "@onchain-reputation/shared";
import { useState } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { linkWalletWithSiwe } from "../../lib/auth/link-wallet";
import { signInWithEthereum } from "../../lib/auth/siwe";
import { getAccessToken } from "../../lib/auth/token";
import { isValidEthAddress, normalizeEthAddress } from "../../lib/wallet/validate-address";

type Props = {
  mode: "sign-in" | "link";
  onSuccess?: () => void;
  disabled?: boolean;
};

const CHAINS = [
  { id: CHAIN_IDS.ETHEREUM_MAINNET, label: "Ethereum" },
  { id: CHAIN_IDS.BASE, label: "Base" },
] as const;

export function LinkWalletForm({ mode, onSuccess, disabled }: Props) {
  const { address: connectedAddress, chainId: connectedChainId, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { signMessageAsync } = useSignMessage();

  const [addressInput, setAddressInput] = useState("");
  const [chainId, setChainId] = useState<number>(CHAIN_IDS.ETHEREUM_MAINNET);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedAddress = addressInput.trim()
    ? normalizeEthAddress(addressInput)
    : connectedAddress
      ? normalizeEthAddress(connectedAddress)
      : "";

  const useConnected = () => {
    if (connectedAddress) {
      setAddressInput(connectedAddress);
      if (connectedChainId === CHAIN_IDS.BASE || connectedChainId === CHAIN_IDS.ETHEREUM_MAINNET) {
        setChainId(connectedChainId);
      }
    }
  };

  const handleConnectExtension = () => {
    setError(null);
    const connector = connectors[0];
    if (!connector) {
      setError(
        "No wallet detected. Install a browser wallet or set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.",
      );
      return;
    }
    connect({ connector });
  };

  const handleVerify = async () => {
    setError(null);
    if (!resolvedAddress || !isValidEthAddress(resolvedAddress)) {
      setError("Enter a valid public address (0x followed by 40 hex characters).");
      return;
    }
    if (!isConnected || !connectedAddress) {
      setError("Connect a wallet to sign and prove you control this address.");
      return;
    }
    if (normalizeEthAddress(connectedAddress) !== resolvedAddress) {
      setError(
        "Connected wallet must match the address you entered. Switch accounts in your wallet or update the field.",
      );
      return;
    }

    setBusy(true);
    try {
      if (mode === "sign-in" || !getAccessToken()) {
        await signInWithEthereum({
          address: resolvedAddress,
          chainId,
          signMessageAsync,
        });
      } else {
        await linkWalletWithSiwe({
          address: resolvedAddress,
          chainId,
          signMessageAsync,
        });
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="wallet-address" className="label-field">
          Public wallet address
        </label>
        <input
          id="wallet-address"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="0x…"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          disabled={disabled || busy}
          className="input-field font-mono"
        />
        <p className="mt-1 text-xs text-slate-500">
          Paste the address you want indexed. You must sign with that same wallet to prove ownership
          — we never ask for your seed phrase.
        </p>
      </div>

      <div>
        <label htmlFor="wallet-chain" className="label-field">
          Primary chain for sign-in
        </label>
        <select
          id="wallet-chain"
          value={chainId}
          onChange={(e) => setChainId(Number(e.target.value))}
          disabled={disabled || busy}
          className="input-field"
        >
          {CHAINS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {!isConnected ? (
          <button
            type="button"
            onClick={handleConnectExtension}
            disabled={disabled || isConnecting || busy}
            className="ui-btn ui-btn-secondary"
          >
            {isConnecting ? "Connecting…" : "Connect wallet app"}
          </button>
        ) : null}
        {isConnected && connectedAddress && !addressInput ? (
          <button
            type="button"
            onClick={useConnected}
            disabled={disabled || busy}
            className="ui-btn ui-btn-secondary"
          >
            Use connected address
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleVerify}
          disabled={disabled || busy}
          className="ui-btn ui-btn-primary"
        >
          {busy ? "Signing…" : mode === "sign-in" ? "Sign in" : "Verify & link"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
