import { Injectable } from "@nestjs/common";
import { IndexRunStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { IndexerQueue } from "./indexer.queue";

@Injectable()
export class IndexerOrchestrator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: IndexerQueue,
  ) {}

  async createRun(walletId: string, userId: string, chainId: number) {
    const run = await this.prisma.indexRun.create({
      data: {
        walletId,
        status: IndexRunStatus.pending,
      },
    });

    await this.queue.enqueue({ walletId, userId, chainId, indexRunId: run.id });
    return run;
  }

  async markRunning(runId: string, fromBlock: bigint, toBlock: bigint) {
    return this.prisma.indexRun.update({
      where: { id: runId },
      data: {
        status: IndexRunStatus.running,
        fromBlock,
        toBlock,
        startedAt: new Date(),
      },
    });
  }

  async markCompleted(runId: string) {
    return this.prisma.indexRun.update({
      where: { id: runId },
      data: {
        status: IndexRunStatus.completed,
        completedAt: new Date(),
      },
    });
  }

  async markFailed(runId: string, error: string) {
    return this.prisma.indexRun.update({
      where: { id: runId },
      data: {
        status: IndexRunStatus.failed,
        error,
        completedAt: new Date(),
      },
    });
  }

  async getLatestCompletedRun(walletId: string) {
    return this.prisma.indexRun.findFirst({
      where: { walletId, status: IndexRunStatus.completed },
      orderBy: { completedAt: "desc" },
    });
  }
}
