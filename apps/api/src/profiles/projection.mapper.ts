import type { ProfileOwnerDto, ProfileProjectionDto, ProfilePublicDto } from "@onchain-reputation/shared";
import type { Profile, Wallet } from "@prisma/client";
import { mapDaoContributionsFromProjection } from "./profile.mapper";

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
    daoContributions: mapDaoContributionsFromProjection(payload),
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
    resumeTimeline: payload.resumeTimeline,
  };
}

export function mapProjectionToOwner(
  payload: ProfileProjectionDto,
  profile: Profile & { user?: { wallets: Wallet[] }; privateMetrics?: unknown },
  options?: { includePrivateMetrics?: boolean },
): ProfileOwnerDto {
  const privateMetrics =
    options?.includePrivateMetrics && profile.privateMetrics
      ? (profile.privateMetrics as import("@onchain-reputation/shared").PrivateMetricsDto)
      : undefined;

  return {
    ...mapProjectionToPublic(payload),
    id: profile.id,
    userId: profile.userId,
    publicCacheVersion: payload.publicCacheVersion,
    privateMetrics,
    wallets: (profile.user?.wallets ?? []).map((w) => ({
      id: w.id,
      address: w.address,
      chainScope: w.chainScope,
      isPrimary: w.isPrimary,
      linkedAt: w.linkedAt.toISOString(),
    })),
  };
}
