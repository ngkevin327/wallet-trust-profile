export const CHAIN_IDS = {
  ETHEREUM_MAINNET: 1,
  BASE: 8453,
} as const;

export type SupportedChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

export const SUPPORTED_CHAINS: {
  chainId: SupportedChainId;
  name: string;
  caip2: string;
}[] = [
  { chainId: CHAIN_IDS.ETHEREUM_MAINNET, name: "Ethereum", caip2: "eip155:1" },
  { chainId: CHAIN_IDS.BASE, name: "Base", caip2: "eip155:8453" },
];

export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return Object.values(CHAIN_IDS).includes(chainId as SupportedChainId);
}
