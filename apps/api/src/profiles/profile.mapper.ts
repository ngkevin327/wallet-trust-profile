import type { ProfileOwnerDto, ProfilePublicDto } from "@onchain-reputation/shared";
import type { Profile, Wallet } from "@prisma/client";

type ProfileWithRelations = Profile & {
  user?: { wallets: Wallet[] };
};

export function mapPublicProfile(
  profile: Profile,
  lastUpdatedAt: Date | null,
): ProfilePublicDto {
  return {
    slug: profile.slug,
    displayName: profile.displayName,
    visibility: profile.visibility,
    status: profile.status,
    reputationIndex: null,
    dimensions: null,
    badges: [],
    lastUpdated: lastUpdatedAt?.toISOString() ?? null,
    lastUpdatedAt: lastUpdatedAt?.toISOString() ?? null,
  };
}

export function mapOwnerProfile(
  profile: ProfileWithRelations,
  lastUpdatedAt: Date | null,
): ProfileOwnerDto {
  return {
    ...mapPublicProfile(profile, lastUpdatedAt),
    id: profile.id,
    userId: profile.userId,
    publicCacheVersion: profile.publicCacheVersion,
    wallets: (profile.user?.wallets ?? []).map((w) => ({
      id: w.id,
      address: w.address,
      chainScope: w.chainScope,
      isPrimary: w.isPrimary,
      linkedAt: w.linkedAt.toISOString(),
    })),
  };
}
