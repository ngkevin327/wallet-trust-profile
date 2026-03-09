import { API_ROUTES } from "@onchain-reputation/shared";
import { apiFetch } from "../api/client";
import { buildAndSignSiwe, mapWalletError } from "./siwe";

export async function linkWalletWithSiwe(params: {
  address: string;
  chainId: number;
  signMessageAsync: (args: { message: string }) => Promise<string>;
  isPrimary?: boolean;
}) {
  try {
    const { message, signature } = await buildAndSignSiwe({
      address: params.address,
      chainId: params.chainId,
      statement: "Link this wallet to your Onchain Reputation profile",
      signMessageAsync: params.signMessageAsync,
    });

    return apiFetch(API_ROUTES.me.wallets, {
      method: "POST",
      body: JSON.stringify({
        address: params.address,
        chainId: params.chainId,
        message,
        signature,
        isPrimary: params.isPrimary,
      }),
    });
  } catch (error) {
    throw new Error(mapWalletError(error));
  }
}
