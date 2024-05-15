export class WorkerModule {
  async start(): Promise<void> {
    const nodeEnv = process.env.NODE_ENV ?? "development";
    console.log(`[worker] starting indexer worker (env=${nodeEnv})`);
    console.log("[worker] queue consumer not yet configured — skeleton ready");
  }
}
