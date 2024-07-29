import { Injectable } from "@nestjs/common";
import { generateNonce } from "siwe";
import Redis from "ioredis";

const NONCE_TTL_SEC = 300;
const NONCE_PREFIX = "siwe:nonce:";

export type StoredNonce = {
  address: string;
  chainId: number;
};

@Injectable()
export class SiweService {
  private redis: Redis | null = null;

  private getRedis(): Redis {
    if (!this.redis) {
      const url = process.env.REDIS_URL;
      if (!url) {
        throw new Error("REDIS_URL is required for SIWE nonce storage");
      }
      this.redis = new Redis(url, { maxRetriesPerRequest: 2 });
    }
    return this.redis;
  }

  getDomain(): string {
    return process.env.SIWE_DOMAIN ?? "localhost";
  }

  getUri(): string {
    return process.env.SIWE_URI ?? "http://localhost:3000";
  }

  async issueNonce(address: string, chainId: number): Promise<{
    nonce: string;
    domain: string;
    uri: string;
    chainId: number;
    expirationTime: string;
  }> {
    const nonce = generateNonce();
    const normalized = address.toLowerCase();
    const expirationTime = new Date(Date.now() + NONCE_TTL_SEC * 1000).toISOString();

    const payload: StoredNonce = { address: normalized, chainId };
    await this.getRedis().setex(`${NONCE_PREFIX}${nonce}`, NONCE_TTL_SEC, JSON.stringify(payload));

    return {
      nonce,
      domain: this.getDomain(),
      uri: this.getUri(),
      chainId,
      expirationTime,
    };
  }

  async consumeNonce(nonce: string): Promise<StoredNonce | null> {
    const key = `${NONCE_PREFIX}${nonce}`;
    const raw = await this.getRedis().get(key);
    if (!raw) {
      return null;
    }
    await this.getRedis().del(key);
    return JSON.parse(raw) as StoredNonce;
  }
}
