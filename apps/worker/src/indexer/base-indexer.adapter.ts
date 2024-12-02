import type { ChainIndexer, NormalizedTransaction } from "./chain-indexer.interface";
import { withRetry } from "./retry.util";

export type RpcClient = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export abstract class BaseIndexerAdapter implements ChainIndexer {
  abstract readonly chainId: number;

  constructor(protected readonly rpc: RpcClient) {}

  async getLatestBlock(): Promise<bigint> {
    const result = await withRetry(() =>
      this.rpc.request({ method: "eth_blockNumber", params: [] }),
    );
    return BigInt(result as string);
  }

  abstract fetchTransactions(
    walletAddress: string,
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<NormalizedTransaction[]>;

  protected normalizeTx(raw: {
    hash: string;
    blockNumber: string;
    timeStamp: string;
    from: string;
    to: string | null;
    value: string;
    input?: string;
    contractAddress?: string;
    logIndex?: string;
    isError?: string;
  }): NormalizedTransaction | null {
    if (raw.isError === "1") {
      return null;
    }

    const blockNumber = BigInt(raw.blockNumber);
    const blockTime = new Date(Number(raw.timeStamp) * 1000);
    const input = raw.input ?? "0x";
    const isContractCreation = !raw.to && input !== "0x";

    return {
      chainId: this.chainId,
      txHash: raw.hash,
      logIndex: raw.logIndex != null ? Number(raw.logIndex) : null,
      blockNumber,
      blockTime,
      from: raw.from.toLowerCase(),
      to: raw.to ? raw.to.toLowerCase() : null,
      value: raw.value,
      input,
      contractAddress: raw.contractAddress?.toLowerCase() ?? null,
      isContractCreation,
    };
  }
}
