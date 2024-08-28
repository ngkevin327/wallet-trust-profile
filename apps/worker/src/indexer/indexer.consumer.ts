import Redis from "ioredis";
import { PrismaClient, IndexRunStatus, ProfileStatus } from "@prisma/client";

const STREAM_KEY = "indexer:jobs";
const GROUP = "indexer-workers";
const CONSUMER = `worker-${process.pid}`;

export class IndexerConsumer {
  private redis: Redis;
  private prisma: PrismaClient;
  private running = false;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, { maxRetriesPerRequest: 2 });
    this.prisma = new PrismaClient();
  }

  async start(): Promise<void> {
    this.running = true;
    try {
      await this.redis.xgroup("CREATE", STREAM_KEY, GROUP, "0", "MKSTREAM");
    } catch {
      // group already exists
    }

    console.log("[worker] indexer consumer started");

    while (this.running) {
      const results = await this.redis.xreadgroup(
        "GROUP",
        GROUP,
        CONSUMER,
        "COUNT",
        1,
        "BLOCK",
        5000,
        "STREAMS",
        STREAM_KEY,
        ">",
      );

      if (!results) {
        continue;
      }

      for (const [, messages] of results) {
        for (const [id, fields] of messages) {
          await this.processJob(fields);
          await this.redis.xack(STREAM_KEY, GROUP, id);
        }
      }
    }
  }

  stop(): void {
    this.running = false;
  }

  private parseFields(fields: string[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      const key = fields[i];
      const value = fields[i + 1];
      if (key !== undefined && value !== undefined) {
        map[key] = value;
      }
    }
    return map;
  }

  private async processJob(fields: string[]) {
    const data = this.parseFields(fields);
    const walletId = data.walletId;
    const userId = data.userId;

    if (!walletId || !userId) {
      console.warn("[worker] skipping job with missing fields");
      return;
    }

    console.log(`[worker] processing index job walletId=${walletId}`);

    const indexRun = await this.prisma.indexRun.create({
      data: {
        walletId,
        status: IndexRunStatus.running,
        startedAt: new Date(),
      },
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await this.prisma.indexRun.update({
        where: { id: indexRun.id },
        data: {
          status: IndexRunStatus.completed,
          completedAt: new Date(),
        },
      });

      await this.prisma.profile.update({
        where: { userId },
        data: { status: ProfileStatus.active },
      });

      console.log(`[worker] completed index run ${indexRun.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await this.prisma.indexRun.update({
        where: { id: indexRun.id },
        data: {
          status: IndexRunStatus.failed,
          error: message,
          completedAt: new Date(),
        },
      });

      await this.prisma.profile.update({
        where: { userId },
        data: { status: ProfileStatus.failed },
      });

      console.error(`[worker] index job failed: ${message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    this.redis.disconnect();
  }
}
