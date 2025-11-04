export type ProfileVisibilityDto = "public" | "private";

export type ProfileStatusDto = "created" | "indexing" | "active" | "failed";

export type ProfileScoreDimensionsDto = {
  governance: number;
  contribution: number;
  paymentReliability: number;
  protocolParticipation?: number;
};

export type ActivitySummaryDto = {
  activitySummarized: boolean;
  totalTransactions: number;
  topProtocols: { category: string; count: number }[];
};

import type { PrivateMetricsDto } from "./private-metrics.dto";
import type { BadgeDto } from "./badge.dto";
import type { DaoContributionDto } from "./dao-contribution.dto";
import type { TrustSignalDto } from "./trust-signal.dto";

export type ProfilePublicDto = {
  slug: string;
  displayName: string | null;
  visibility: ProfileVisibilityDto;
  status: ProfileStatusDto;
  reputationIndex: number | null;
  dimensions: ProfileScoreDimensionsDto | null;
  badges: BadgeDto[];
  trustSignals?: TrustSignalDto[];
  daoContributions?: DaoContributionDto[];
  scoringVersion?: string | null;
  lastUpdated: string | null;
  lastUpdatedAt?: string | null;
  activitySummary?: ActivitySummaryDto | null;
  resumeTimeline?: import("./resume-event.dto").ResumeEventDto[];
};

export type ProfileOwnerDto = ProfilePublicDto & {
  id: string;
  userId: string;
  publicCacheVersion: number;
  wallets: import("./wallet.dto").WalletDto[];
  privateMetrics?: PrivateMetricsDto | null;
};

export type UpdateProfileRequestDto = {
  slug?: string;
  displayName?: string;
  visibility?: ProfileVisibilityDto;
};
