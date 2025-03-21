import type Redis from "ioredis";

export const PROFILE_INDEXED_CHANNEL = "profile:indexed";

export type ProfileIndexedEvent = {
  slug: string;
  profileId: string;
  publicCacheVersion: number;
  previousCacheVersion: number;
};

export async function publishProfileIndexed(
  redis: Redis,
  event: ProfileIndexedEvent,
): Promise<void> {
  await redis.publish(PROFILE_INDEXED_CHANNEL, JSON.stringify(event));
}
