import type { ProfileOwnerDto, ProfileProjectionDto, ProfilePublicDto } from "@onchain-reputation/shared";
import type { Profile, Wallet } from "@prisma/client";

export function mapProjectionToPublic(payload: ProfileProjectionDto): ProfilePublicDto {
  return {
    slug: payload.slug,
    displayName: payload.displayName,
    visibility: payload.visibility,
    status: payload.status,
    reputationIndex: payload.reputationIndex,
    dimensions: payload.dimensions,
    badges: payload.badges,
    trustSignals: payload.trustSignals,
    daoContributions: payload.daoContributions,
    scoringVersion: payload.scoringVersion,
    lastUpdated: payload.lastUpdatedAt,
    lastUpdatedAt: payload.lastUpdatedAt,
    activitySummary: payload.resumeSummary
      ? {
          activitySummarized: false,
          totalTransactions: payload.resumeSummary.totalTransactions,
          topProtocols: payload.resumeSummary.topCategories.map((c) => ({
            category: c.category,
            count: c.count,
          })),
        }
      : null,
  };
}

export function mapProjectionToOwner(
  payload: ProfileProjectionDto,
  profile: Profile & { user?: { wallets: Wallet[] } },
): ProfileOwnerDto {
  return {
    ...mapProjectionToPublic(payload),
    id: profile.id,
    userId: profile.userId,
    publicCacheVersion: payload.publicCacheVersion,
    wallets: (profile.user?.wallets ?? []).map((w) => ({
      id: w.id,
      address: w.address,
      chainScope: w.chainScope,
      isPrimary: w.isPrimary,
      linkedAt: w.linkedAt.toISOString(),
    })),
  };
}
