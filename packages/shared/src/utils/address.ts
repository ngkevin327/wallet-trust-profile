import { getAddress, isAddress } from "viem";

export function normalizeAddress(input: string): string {
  if (!isAddress(input)) {
    throw new Error("Invalid Ethereum address");
  }
  return getAddress(input);
}

export function normalizeAddressOrThrow(input: string): string {
  try {
    return normalizeAddress(input);
  } catch {
    throw new Error(`Invalid address: ${input}`);
  }
}
