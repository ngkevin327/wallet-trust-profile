import { BaseIndexerAdapter, type RpcClient } from "../base-indexer.adapter";
import type { NormalizedTransaction } from "../chain-indexer.interface";
import { withRetry } from "../retry.util";

let rateLimitPauseUntil = 0;

type AlchemyAssetTransfer = {
  hash: string;
  blockNum: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  metadata?: { blockTimestamp?: string };
};

export class EthereumIndexerAdapter extends BaseIndexerAdapter {
  readonly chainId = 1;

  constructor(rpc: RpcClient) {
    super(rpc);
  }

  async fetchTransactions(
    walletAddress: string,
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<NormalizedTransaction[]> {
    const address = walletAddress.toLowerCase();
    const results: NormalizedTransaction[] = [];

    const outgoing = await this.fetchAssetTransfers(address, fromBlock, toBlock, "fromAddress");
    const incoming = await this.fetchAssetTransfers(address, fromBlock, toBlock, "toAddress");

    for (const transfer of [...outgoing, ...incoming]) {
      const normalized = this.normalizeTransfer(transfer);
      if (normalized) {
        results.push(normalized);
      }
    }

    const seen = new Set<string>();
    return results.filter((tx) => {
      const key = `${tx.txHash}:${tx.logIndex ?? "null"}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async fetchAssetTransfers(
    address: string,
    fromBlock: bigint,
    toBlock: bigint,
    direction: "fromAddress" | "toAddress",
  ): Promise<AlchemyAssetTransfer[]> {
    const params: Record<string, unknown> = {
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: `0x${toBlock.toString(16)}`,
      category: ["external", "internal", "erc20", "erc721", "erc1155"],
      withMetadata: true,
      maxCount: "0x3e8",
      [direction]: address,
    };

    if (Date.now() < rateLimitPauseUntil) {
      const waitMs = rateLimitPauseUntil - Date.now();
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const response = await withRetry(
      () =>
        this.rpc.request({
          method: "alchemy_getAssetTransfers",
          params: [params],
        }),
      {
        isRetryable: (error) => {
          if (EthereumIndexerAdapter.isRateLimitError(error)) {
            rateLimitPauseUntil = Date.now() + 5000;
            console.warn(JSON.stringify({ event: "rpc_rate_limit", chainId: this.chainId }));
            return true;
          }
          return (
            error instanceof Error &&
            (error.message.includes("ECONNRESET") || error.message.includes("timeout"))
          );
        },
      },
    );

    const transfers = (response as { transfers?: AlchemyAssetTransfer[] }).transfers ?? [];
    return transfers;
  }

  private normalizeTransfer(transfer: AlchemyAssetTransfer): NormalizedTransaction | null {
    if (!transfer.hash || !transfer.blockNum) {
      return null;
    }

    const blockNumber = BigInt(transfer.blockNum);
    const blockTime = transfer.metadata?.blockTimestamp
      ? new Date(transfer.metadata.blockTimestamp)
      : new Date();

    return {
      chainId: this.chainId,
      txHash: transfer.hash,
      logIndex: null,
      blockNumber,
      blockTime,
      from: transfer.from.toLowerCase(),
      to: transfer.to ? transfer.to.toLowerCase() : null,
      value: transfer.value != null ? String(transfer.value) : "0",
      input: "0x",
      contractAddress: null,
      isContractCreation: false,
    };
  }

  static isRateLimitError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes("429") || message.toLowerCase().includes("rate limit");
  }
}
