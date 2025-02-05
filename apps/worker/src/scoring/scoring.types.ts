export type ScoringConfig = {
  version: string;
  dimensions: {
    governance: DimensionConfig;
    contribution: DimensionConfig;
    payment_reliability: DimensionConfig;
    protocol_participation: DimensionConfig;
  };
  composite: { clamp_min: number; clamp_max: number };
};

export type DimensionConfig = {
  weight: number;
  max_balance_weight?: number;
  rules: Record<string, number>;
};

export type ScoringInputs = {
  walletAddress: string;
  walletAgeDays: number;
  governanceVotes: number;
  governanceProtocols: number;
  tenureMonths: number;
  tokenBalanceWeight: number;
  daoPayments: number;
  grantPatterns: number;
  inboundPayments: number;
  outboundPayments: number;
  uniqueCounterparties: number;
  washRatio: number;
  distinctProtocols: number;
  recentProtocolInteractions: number;
  totalTransactions: number;
};

export type DimensionScore = {
  key: string;
  score: number;
  factors: { name: string; value: number; contribution: number }[];
};

export type ScoringResult = {
  scoringVersion: string;
  reputationIndex: number;
  dimensions: Record<string, number>;
  dimensionDetails: DimensionScore[];
  inputs: ScoringInputs;
};
