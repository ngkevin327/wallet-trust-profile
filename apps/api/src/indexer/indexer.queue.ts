import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

const STREAM_KEY = "indexer:jobs";

export type IndexJobPayload = {
  walletId: string;
  userId: string;
  chainId: number;
  indexRunId?: string;
  attempt?: number;
};

@Injectable()
export class IndexerQueue {
  private redis: Redis | null = null;

  private getRedis(): Redis {
    if (!this.redis) {
      const url = process.env.REDIS_URL;
      if (!url) {
        throw new Error("REDIS_URL is required for indexer queue");
      }
      this.redis = new Redis(url, { maxRetriesPerRequest: 2 });
    }
    return this.redis;
  }

  async enqueue(payload: IndexJobPayload): Promise<string> {
    const fields: string[] = [
      "walletId",
      payload.walletId,
      "userId",
      payload.userId,
      "chainId",
      String(payload.chainId),
    ];
    if (payload.indexRunId) {
      fields.push("indexRunId", payload.indexRunId);
    }
    if (payload.attempt != null) {
      fields.push("attempt", String(payload.attempt));
    }

    const id = await this.getRedis().xadd(STREAM_KEY, "*", ...fields);
    return id ?? "";
  }
}
