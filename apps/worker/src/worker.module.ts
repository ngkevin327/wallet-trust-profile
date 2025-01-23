import { loadWorkerEnv } from "./config/env.schema";
import { IndexerConsumer } from "./indexer/indexer.consumer";
import { CronService } from "./scheduler/cron.service";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";

export class WorkerModule {
  private consumer: IndexerConsumer | null = null;
  private cron: CronService | null = null;
  private prisma: PrismaClient | null = null;

  async start(): Promise<void> {
    const env = loadWorkerEnv();
    console.log(`[worker] starting indexer worker (env=${env.nodeEnv})`);

    this.prisma = new PrismaClient();
    const redis = new Redis(env.redisUrl);

    this.consumer = new IndexerConsumer(env.redisUrl, env);
    void this.consumer.start();

    this.cron = new CronService(this.prisma, redis);
    this.cron.start();
  }

  async stop(): Promise<void> {
    this.cron?.stop();
    this.consumer?.stop();
    await this.consumer?.disconnect();
    await this.prisma?.$disconnect();
  }
}
