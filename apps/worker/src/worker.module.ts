import { loadWorkerEnv } from "./config/env.schema";

export class WorkerModule {
  async start(): Promise<void> {
    const env = loadWorkerEnv();
    console.log(`[worker] starting indexer worker (env=${env.nodeEnv})`);
    console.log("[worker] queue consumer not yet configured — skeleton ready");
  }
}
