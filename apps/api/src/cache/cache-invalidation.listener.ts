import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";
import { PROFILE_INDEXED_CHANNEL, type ProfileIndexedEvent } from "./profile-events";
import { CacheService } from "./cache.service";

@Injectable()
export class CacheInvalidationListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheInvalidationListener.name);
  private subscriber: Redis | null = null;

  constructor(private readonly cache: CacheService) {}

  onModuleInit(): void {
    if (process.env.SKIP_DB_CONNECT === "true" && process.env.NODE_ENV === "test") {
      return;
    }
    const url = process.env.REDIS_URL;
    if (!url) {
      return;
    }

    this.subscriber = new Redis(url, { maxRetriesPerRequest: 2 });
    this.subscriber.subscribe(PROFILE_INDEXED_CHANNEL);
    this.subscriber.on("message", (_channel, message) => {
      void this.handleMessage(message);
    });
    this.logger.log("Subscribed to profile.indexed events for cache invalidation");
  }

  private async handleMessage(message: string): Promise<void> {
    try {
      const event = JSON.parse(message) as ProfileIndexedEvent;
      const previousKey = `profile:public:${event.slug}:v${event.previousCacheVersion}`;
      await this.cache.del(previousKey);
      this.logger.log(
        JSON.stringify({
          event: "cache_invalidated",
          slug: event.slug,
          previousVersion: event.previousCacheVersion,
        }),
      );
    } catch (error) {
      this.logger.warn(`Failed to process cache invalidation: ${String(error)}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber?.quit();
  }
}
