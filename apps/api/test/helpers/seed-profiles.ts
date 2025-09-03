export const PUBLIC_PROFILE_SLUG = "demo-builder";
export const PRIVATE_PROFILE_SLUG = "private-demo";

export const PUBLIC_USER_ID = "a0000000-0000-4000-8000-000000000001";
export const PRIVATE_USER_ID = "a0000000-0000-4000-8000-000000000002";

export const PUBLIC_WALLET_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
export const PUBLIC_WALLET_LOWERCASE = "0x742d35cc6634c0532925a3b844bc9e7595f0beb0";

export const mockPublicProfileResponse = {
  slug: PUBLIC_PROFILE_SLUG,
  displayName: "Demo Builder",
  visibility: "public",
  status: "active",
  reputationIndex: 72,
  scoringVersion: "1.0.0",
  publicCacheVersion: 1,
  dimensions: {
    governance: 65,
    contribution: 80,
    paymentReliability: 74,
    protocolParticipation: 58,
  },
  badges: [{ code: "active-voter", title: "Active Voter", earnedAt: new Date().toISOString() }],
  daoContributions: [],
  trustSignals: [],
};

export const mockPrivateProfileResponse = {
  slug: PRIVATE_PROFILE_SLUG,
  displayName: "Private User",
  visibility: "private",
  status: "active",
  reputationIndex: 50,
  scoringVersion: "1.0.0",
  publicCacheVersion: 2,
};

export const MOCK_PRIVATE_SLUG = PRIVATE_PROFILE_SLUG;
