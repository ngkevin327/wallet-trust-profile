import Redis from "ioredis";

const DLQ_STREAM = "indexer:jobs:dlq";

export class DlqHandler {
  constructor(private readonly redis: Redis) {}

  async moveToDlq(
    originalFields: string[],
    error: string,
  ): Promise<void> {
    const fields = [...originalFields, "error", error, "failedAt", new Date().toISOString()];
    await this.redis.xadd(DLQ_STREAM, "*", ...fields);
    console.error(`[worker] job moved to DLQ: ${error}`);
  }

  async getDlqDepth(): Promise<number> {
    return this.redis.xlen(DLQ_STREAM);
  }
}
