import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

const STREAM_KEY = "indexer:jobs";
const MIN_REINDEX_INTERVAL_MS = 12 * 60 * 60 * 1000;

export class CronService {
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis,
  ) {}

  start(): void {
    const hours = Number(process.env.CRON_REINDEX_INTERVAL_HOURS ?? 24);
    const intervalMs = hours * 60 * 60 * 1000;

    this.interval = setInterval(() => {
      void this.runScheduledReindex();
    }, intervalMs);

    console.log(`[worker] cron scheduled reindex every ${hours}h`);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async runScheduledReindex(): Promise<void> {
    const cutoff = new Date(Date.now() - MIN_REINDEX_INTERVAL_MS);
    const wallets = await this.prisma.wallet.findMany({
      include: {
        user: { include: { profile: true } },
        indexRuns: {
          where: { status: "completed" },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
      },
    });

    let enqueued = 0;
    for (const wallet of wallets) {
      const lastRun = wallet.indexRuns[0];
      if (lastRun?.completedAt && lastRun.completedAt > cutoff) {
        continue;
      }

      const chainId = wallet.chainScope[0]?.includes("8453") ? 8453 : 1;
      await this.redis.xadd(
        STREAM_KEY,
        "*",
        "walletId",
        wallet.id,
        "userId",
        wallet.userId,
        "chainId",
        String(chainId),
        "scheduled",
        "true",
      );
      enqueued++;
    }

    console.log(JSON.stringify({ event: "cron_reindex", enqueued }));
  }
}
