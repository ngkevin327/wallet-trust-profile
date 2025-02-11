import type { DimensionConfig, DimensionScore, ScoringInputs } from "../scoring.types";

export function scoreContribution(
  inputs: ScoringInputs,
  config: DimensionConfig,
): DimensionScore {
  const rules = config.rules;
  const daoNorm = Math.min(1, inputs.daoPayments / 20);
  const grantNorm = Math.min(1, inputs.grantPatterns / 10);
  const tenureNorm = Math.min(1, inputs.tenureMonths / 36);

  const daoScore = daoNorm * rules.dao_payments;
  const grantScore = grantNorm * rules.grant_patterns;
  const tenureScore = tenureNorm * rules.tenure;

  const score = Math.min(100, Math.round(daoScore + grantScore + tenureScore));

  return {
    key: "contribution",
    score,
    factors: [
      { name: "dao_payments", value: daoNorm, contribution: daoScore },
      { name: "grant_patterns", value: grantNorm, contribution: grantScore },
      { name: "tenure", value: tenureNorm, contribution: tenureScore },
    ],
  };
}
