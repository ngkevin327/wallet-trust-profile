import type {
  BadgeDto,
  ProfileOwnerDto,
  ProfilePublicDto,
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
};

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
