export const PROFILE_INDEXED_CHANNEL = "profile:indexed";

export type ProfileIndexedEvent = {
  slug: string;
  profileId: string;
  publicCacheVersion: number;
  previousCacheVersion: number;
};
