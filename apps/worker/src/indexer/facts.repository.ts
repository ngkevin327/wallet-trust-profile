import { Prisma, PrismaClient } from "@prisma/client";
import type { ClassifiedFact } from "../classifier/classifier.service";

export class FactsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertBatch(
    walletId: string,
    indexRunId: string,
    facts: ClassifiedFact[],
  ): Promise<number> {
    if (facts.length === 0) {
      return 0;
    }

    let inserted = 0;
    const batchSize = 100;

    for (let i = 0; i < facts.length; i += batchSize) {
      const chunk = facts.slice(i, i + batchSize);
      const results = await Promise.all(
        chunk.map((fact) =>
          this.prisma.transactionFact.upsert({
            where: {
              chainId_txHash_logIndex: {
                chainId: fact.chainId,
                txHash: fact.txHash,
                logIndex: fact.logIndex,
              },
            },
            create: {
              walletId,
              indexRunId,
              chainId: fact.chainId,
              txHash: fact.txHash,
              logIndex: fact.logIndex,
              blockTime: fact.blockTime,
              category: fact.category,
              protocolId: fact.protocolId,
              raw: fact.raw as Prisma.InputJsonValue,
            },
            update: {
              indexRunId,
              category: fact.category,
              protocolId: fact.protocolId,
              raw: fact.raw as Prisma.InputJsonValue,
            },
          }),
        ),
      );
      inserted += results.length;
    }

    return inserted;
  }
}
