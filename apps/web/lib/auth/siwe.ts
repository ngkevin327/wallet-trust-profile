import { API_ROUTES } from "@onchain-reputation/shared";
import { SiweMessage } from "siwe";
import { setAccessToken } from "./token";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function mapWalletError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("User rejected") || message.includes("denied")) {
    return "Signature request was rejected. Approve in your wallet to continue.";
  }
  if (message.includes("Unsupported chain") || message.includes("chain")) {
    return "Switch to Ethereum mainnet or Base in your wallet, then try again.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "Network error — check your connection and try again.";
  }
  if (message.includes("nonce")) {
    return "Sign-in session expired. Refresh the page and connect again.";
  }
  return message || "Something went wrong during sign-in.";
}

export async function buildAndSignSiwe(params: {
  address: string;
  chainId: number;
  statement: string;
  signMessageAsync: (args: { message: string }) => Promise<string>;
}): Promise<{ message: string; signature: string }> {
  const nonceRes = await fetch(`${API_BASE}${API_ROUTES.auth.nonce}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: params.address, chainId: params.chainId }),
  });

  if (!nonceRes.ok) {
    throw new Error("Failed to fetch SIWE nonce");
  }

  const nonceData = await nonceRes.json();

  const siwe = new SiweMessage({
    domain: process.env.NEXT_PUBLIC_SIWE_DOMAIN ?? nonceData.domain,
    address: params.address,
    statement: params.statement,
    uri: nonceData.uri,
    version: "1",
    chainId: params.chainId,
    nonce: nonceData.nonce,
    expirationTime: nonceData.expirationTime,
  });

  const message = siwe.prepareMessage();
  const signature = await params.signMessageAsync({ message });
  return { message, signature };
}

export async function signInWithEthereum(params: {
  address: string;
  chainId: number;
  signMessageAsync: (args: { message: string }) => Promise<string>;
}): Promise<{ userId: string; accessToken: string }> {
  try {
    const { message, signature } = await buildAndSignSiwe({
      ...params,
      statement: "Sign in to Onchain Reputation",
    });

    const verifyRes = await fetch(`${API_BASE}${API_ROUTES.auth.verify}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });

    if (!verifyRes.ok) {
      throw new Error("SIWE verification failed — check wallet network and try again");
    }

    const data = await verifyRes.json();
    setAccessToken(data.accessToken);
    return { userId: data.userId, accessToken: data.accessToken };
  } catch (error) {
    throw new Error(mapWalletError(error));
  }
}
