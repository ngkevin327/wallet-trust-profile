import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

type CacheMetrics = {
  hits: number;
  misses: number;
  latencyMsTotal: number;
};

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis | null = null;
  private readonly metrics = new Map<string, CacheMetrics>();
  private readonly defaultTtlSeconds: number;

  constructor() {
    this.defaultTtlSeconds = Number(process.env.CACHE_TTL_SECONDS ?? 600);
  }

  private getRedis(): Redis | null {
    if (process.env.SKIP_DB_CONNECT === "true" && process.env.NODE_ENV === "test") {
      return null;
    }
    if (!this.redis && process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2 });
    }
    return this.redis;
  }

  private metricKey(namespace: string): string {
    return namespace;
  }

  recordHit(namespace: string, latencyMs: number): void {
    const key = this.metricKey(namespace);
    const row = this.metrics.get(key) ?? { hits: 0, misses: 0, latencyMsTotal: 0 };
    row.hits += 1;
    row.latencyMsTotal += latencyMs;
    this.metrics.set(key, row);
    this.logger.debug(
      JSON.stringify({ metric: "cache.hit", namespace, hits: row.hits, latencyMs }),
    );
  }

  recordMiss(namespace: string, latencyMs: number): void {
    const key = this.metricKey(namespace);
    const row = this.metrics.get(key) ?? { hits: 0, misses: 0, latencyMsTotal: 0 };
    row.misses += 1;
    row.latencyMsTotal += latencyMs;
    this.metrics.set(key, row);
    this.logger.debug(
      JSON.stringify({ metric: "cache.miss", namespace, misses: row.misses, latencyMs }),
    );
  }

  getMetrics(namespace: string): CacheMetrics & { hitRate: number } {
    const row = this.metrics.get(this.metricKey(namespace)) ?? {
      hits: 0,
      misses: 0,
      latencyMsTotal: 0,
    };
    const total = row.hits + row.misses;
    return {
      ...row,
      hitRate: total > 0 ? row.hits / total : 0,
    };
  }

  async get<T>(key: string, namespace = "default"): Promise<T | null> {
    const started = Date.now();
    const redis = this.getRedis();
    if (!redis) {
      this.recordMiss(namespace, Date.now() - started);
      return null;
    }
    try {
      const raw = await redis.get(key);
      const latency = Date.now() - started;
      if (!raw) {
        this.recordMiss(namespace, latency);
        return null;
      }
      this.recordHit(namespace, latency);
      return JSON.parse(raw) as T;
    } catch {
      this.recordMiss(namespace, Date.now() - started);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = this.defaultTtlSeconds): Promise<void> {
    const redis = this.getRedis();
    if (!redis) {
      return;
    }
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    const redis = this.getRedis();
    if (!redis) {
      return;
    }
    await redis.del(key);
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: { ttlSeconds?: number; namespace?: string },
  ): Promise<T> {
    const namespace = options?.namespace ?? "default";
    const lockKey = `${key}:lock`;
    const cached = await this.get<T>(key, namespace);
    if (cached != null) {
      return cached;
    }

    const redis = this.getRedis();
    if (redis) {
      const acquired = await redis.set(lockKey, "1", "EX", 5, "NX");
      if (!acquired) {
        await new Promise((r) => setTimeout(r, 50));
        const retry = await this.get<T>(key, namespace);
        if (retry != null) {
          return retry;
        }
      }
    }

    const value = await factory();
    await this.set(key, value, options?.ttlSeconds);
    if (redis) {
      await redis.del(lockKey);
    }
    return value;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis?.quit();
  }
}
