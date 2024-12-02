export type NormalizedTransaction = {
  chainId: number;
  txHash: string;
  logIndex: number | null;
  blockNumber: bigint;
  blockTime: Date;
  from: string;
  to: string | null;
  value: string;
  input: string;
  contractAddress: string | null;
  isContractCreation: boolean;
};

export type ChainIndexer = {
  chainId: number;
  getLatestBlock(): Promise<bigint>;
  fetchTransactions(
    walletAddress: string,
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<NormalizedTransaction[]>;
};
