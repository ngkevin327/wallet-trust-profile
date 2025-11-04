export type PrivateDimensionMetricsDto = {
  key: string;
  score: number;
  factors: { code: string; label: string; weight: number }[];
};

export type PrivateMetricsDto = {
  dimensions: PrivateDimensionMetricsDto[];
  computedAt: string;
};
