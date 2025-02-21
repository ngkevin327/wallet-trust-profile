export type ScoreFactorDto = {
  name: string;
  value: number;
  contribution: number;
};

export type ScoreDimensionBreakdownDto = {
  key: string;
  score: number;
  weight: number;
  factors: ScoreFactorDto[];
};

export type ScoreBreakdownDto = {
  scoringVersion: string;
  reputationIndex: number;
  inputsHash: string;
  snapshotId: string;
  createdAt: string;
  dimensions: ScoreDimensionBreakdownDto[];
};
