import type {
  BadgeDto,
  DaoContributionDto,
  ProfileOwnerDto,
  ProfilePublicDto,
  ProfileProjectionDto,
  ProfileScoreDimensionsDto,
  TrustSignalDto,
} from "@onchain-reputation/shared";
import type { Profile, Wallet } from "@prisma/client";
import { getBadgeTitle } from "./badge-titles";

type ProfileWithRelations = Profile & {
  user?: { wallets: Wallet[] };
};

type ScoreContext = {
  reputationIndex: number | null;
  dimensions: ProfileScoreDimensionsDto | null;
  badges: BadgeDto[];
  trustSignals: TrustSignalDto[];
  daoContributions?: DaoContributionDto[];
  scoringVersion?: string | null;
};

export function mapDaoContributionsFromProjection(
  payload: ProfileProjectionDto,
): DaoContributionDto[] | undefined {
  return payload.daoContributions.length > 0 ? payload.daoContributions : undefined;
}

export function mapPublicProfile(
  profile: Profile,
  lastUpdatedAt: Date | null,
  score: ScoreContext = {
    reputationIndex: null,
    dimensions: null,
    badges: [],
    trustSignals: [],
  },
): ProfilePublicDto {
  return {
    slug: profile.slug,
    displayName: profile.displayName,
    visibility: profile.visibility,
    status: profile.status,
    reputationIndex: score.reputationIndex,
    dimensions: score.dimensions,
    badges: score.badges,
    trustSignals: score.trustSignals,
    daoContributions: score.daoContributions,
    scoringVersion: score.scoringVersion ?? null,
    lastUpdated: lastUpdatedAt?.toISOString() ?? null,
    lastUpdatedAt: lastUpdatedAt?.toISOString() ?? null,
  };
}

export function mapOwnerProfile(
  profile: ProfileWithRelations,
  lastUpdatedAt: Date | null,
  score: ScoreContext = {
    reputationIndex: null,
    dimensions: null,
    badges: [],
    trustSignals: [],
  },
): ProfileOwnerDto {
  return {
    ...mapPublicProfile(profile, lastUpdatedAt, score),
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

export function mapProjectionPayloadToOwner(
  payload: ProfileProjectionDto,
  profile: ProfileWithRelations,
): ProfileOwnerDto {
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
