export type ProfileVisibilityDto = "public" | "private";

export type ProfileScoreDimensionsDto = {
  governance: number;
  contribution: number;
  paymentReliability: number;
  protocolParticipation?: number;
};

export type ProfilePublicDto = {
  slug: string;
  displayName: string | null;
  visibility: ProfileVisibilityDto;
  reputationIndex: number | null;
  dimensions: ProfileScoreDimensionsDto | null;
  badges: string[];
  lastUpdated: string | null;
};

export type ProfileOwnerDto = ProfilePublicDto & {
  id: string;
  userId: string;
  publicCacheVersion: number;
  wallets: import("./wallet.dto").WalletDto[];
};

export type UpdateProfileRequestDto = {
  slug?: string;
  displayName?: string;
  visibility?: ProfileVisibilityDto;
};
