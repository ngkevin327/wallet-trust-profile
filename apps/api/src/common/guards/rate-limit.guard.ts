import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import Redis from "ioredis";
import { Request } from "express";

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: Redis | null = null;

  private getRedis(): Redis | null {
    if (this.redis) {
      return this.redis;
    }
    const url = process.env.REDIS_URL;
    if (!url) {
      return null;
    }
    this.redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
    return this.redis;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const limit = Number(process.env.RATE_LIMIT_ANONYMOUS_PER_MIN ?? 60);
    const windowSec = 60;

    const ip =
      (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      request.ip ??
      "unknown";

    const redis = this.getRedis();
    if (!redis) {
      return true;
    }

    const key = `ratelimit:anon:${ip}`;
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSec);
      }
      if (count > limit) {
        throw new HttpException("Too many requests", HttpStatus.TOO_MANY_REQUESTS);
      }
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return true;
    }
  }
}
