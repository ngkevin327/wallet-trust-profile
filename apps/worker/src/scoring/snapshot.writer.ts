import type { PrismaClient } from "@prisma/client";
import { hashScoringInputs } from "./inputs-hash";
import type { ScoringResult } from "./scoring.types";

export class SnapshotWriter {
  constructor(private readonly prisma: PrismaClient) {}

  async persist(
    walletId: string,
    indexRunId: string,
    result: ScoringResult,
  ): Promise<string> {
    const inputsHash = hashScoringInputs(result.inputs);
    const snapshot = await this.prisma.scoreSnapshot.create({
      data: {
        walletId,
        indexRunId,
        scoringVersion: result.scoringVersion,
        reputationIndex: result.reputationIndex,
        dimensions: result.dimensions,
        inputsHash,
      },
    });
    return snapshot.id;
  }

  getLastSnapshotId(walletId: string): Promise<string | null> {
    return this.prisma.scoreSnapshot
      .findFirst({
        where: { walletId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      })
      .then((row) => row?.id ?? null);
  }
}
