import type { BadgeDto } from "./badge.dto";
import type { DaoContributionDto } from "./dao-contribution.dto";
import type {
  ProfileScoreDimensionsDto,
  ProfileStatusDto,
  ProfileVisibilityDto,
} from "./profile.dto";
import type { TrustSignalDto } from "./trust-signal.dto";

export type ResumeSummaryDto = {
  totalTransactions: number;
  topCategories: { category: string; count: number }[];
};

export type ProfileProjectionDto = {
  slug: string;
  displayName: string | null;
  visibility: ProfileVisibilityDto;
  status: ProfileStatusDto;
  reputationIndex: number | null;
  dimensions: ProfileScoreDimensionsDto | null;
  badges: BadgeDto[];
  trustSignals: TrustSignalDto[];
  daoContributions: DaoContributionDto[];
  resumeSummary: ResumeSummaryDto | null;
  scoringVersion: string;
  lastUpdatedAt: string;
  publicCacheVersion: number;
};
