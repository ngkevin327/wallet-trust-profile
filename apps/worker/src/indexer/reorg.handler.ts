import { PrismaClient } from "@prisma/client";

const REORG_WINDOW_BLOCKS = 12n;

export class ReorgHandler {
  constructor(private readonly prisma: PrismaClient) {}

  async reconcile(walletId: string, chainId: number, fromBlock: bigint): Promise<void> {
    if (fromBlock <= REORG_WINDOW_BLOCKS) {
      return;
    }

    const reorgFrom = fromBlock - REORG_WINDOW_BLOCKS;

    await this.prisma.transactionFact.deleteMany({
      where: {
        walletId,
        chainId,
        blockTime: {
          gte: new Date(Number(reorgFrom) * 12_000),
        },
      },
    });

    console.log(
      JSON.stringify({
        event: "reorg_reconcile",
        walletId,
        chainId,
        reorgFrom: reorgFrom.toString(),
      }),
    );
  }
}
