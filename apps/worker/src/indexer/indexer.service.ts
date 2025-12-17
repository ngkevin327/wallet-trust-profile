import { PrismaClient } from "@prisma/client";
import { withSpan } from "../telemetry/otel";
import type { ChainIndexer } from "./chain-indexer.interface";

const DEFAULT_LOOKBACK_BLOCKS = 50_000n;

export class IndexerService {
  constructor(private readonly prisma: PrismaClient) {}

  async getLastIndexedBlock(walletId: string, chainId: number): Promise<bigint | null> {
    const state = await this.prisma.walletChainIndex.findUnique({
      where: { walletId_chainId: { walletId, chainId } },
    });
    return state?.lastIndexedBlock ?? null;
  }

  async resolveBlockRange(
    walletId: string,
    indexer: ChainIndexer,
    isFullScan = false,
  ): Promise<{ fromBlock: bigint; toBlock: bigint }> {
    return withSpan(
      "index.run.resolve_range",
      { wallet_id: walletId, chain_id: indexer.chainId },
      async () => {
        const toBlock = await indexer.getLatestBlock();
        const last = await this.getLastIndexedBlock(walletId, indexer.chainId);

        if (last == null || isFullScan) {
          const fromBlock =
            toBlock > DEFAULT_LOOKBACK_BLOCKS ? toBlock - DEFAULT_LOOKBACK_BLOCKS : 0n;
          return { fromBlock, toBlock };
        }

        return { fromBlock: last + 1n, toBlock };
      },
    );
  }

  async updateLastIndexedBlock(
    walletId: string,
    chainId: number,
    lastIndexedBlock: bigint,
  ): Promise<void> {
    await this.prisma.walletChainIndex.upsert({
      where: { walletId_chainId: { walletId, chainId } },
      create: { walletId, chainId, lastIndexedBlock },
      update: { lastIndexedBlock },
    });
  }

  async getBlockRangeForReconcile(
    walletId: string,
    chainId: number,
    fromBlock: bigint,
  ): Promise<{ walletId: string; chainId: number; fromBlock: bigint }> {
    return { walletId, chainId, fromBlock };
  }
}
