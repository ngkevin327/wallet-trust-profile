import { API_ROUTES } from "@onchain-reputation/shared";
import { SiweMessage } from "siwe";
import { setAccessToken } from "./token";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function signInWithEthereum(params: {
  address: string;
  chainId: number;
  signMessageAsync: (args: { message: string }) => Promise<string>;
}): Promise<{ userId: string; accessToken: string }> {
  const nonceRes = await fetch(`${API_BASE}${API_ROUTES.auth.nonce}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: params.address, chainId: params.chainId }),
  });

  if (!nonceRes.ok) {
    throw new Error("Failed to fetch SIWE nonce");
  }

  const nonceData = await nonceRes.json();

  const message = new SiweMessage({
    domain: process.env.NEXT_PUBLIC_SIWE_DOMAIN ?? nonceData.domain,
    address: params.address,
    statement: "Sign in to Onchain Reputation",
    uri: nonceData.uri,
    version: "1",
    chainId: params.chainId,
    nonce: nonceData.nonce,
    expirationTime: nonceData.expirationTime,
  });

  const prepared = message.prepareMessage();
  const signature = await params.signMessageAsync({ message: prepared });

  const verifyRes = await fetch(`${API_BASE}${API_ROUTES.auth.verify}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: prepared, signature }),
  });

  if (!verifyRes.ok) {
    throw new Error("SIWE verification failed");
  }

  const data = await verifyRes.json();
  setAccessToken(data.accessToken);
  return { userId: data.userId, accessToken: data.accessToken };
}
