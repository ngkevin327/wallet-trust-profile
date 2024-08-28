import { loadWorkerEnv } from "./config/env.schema";
import { IndexerConsumer } from "./indexer/indexer.consumer";

export class WorkerModule {
  private consumer: IndexerConsumer | null = null;

  async start(): Promise<void> {
    const env = loadWorkerEnv();
    console.log(`[worker] starting indexer worker (env=${env.nodeEnv})`);

    this.consumer = new IndexerConsumer(env.redisUrl);
    await this.consumer.start();
  }

  async stop(): Promise<void> {
    this.consumer?.stop();
    await this.consumer?.disconnect();
  }
}
