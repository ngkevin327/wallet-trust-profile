import type { DimensionConfig, DimensionScore, ScoringInputs } from "../scoring.types";

export function scoreGovernance(
  inputs: ScoringInputs,
  config: DimensionConfig,
): DimensionScore {
  const rules = config.rules;
  const participationRate =
    inputs.totalTransactions > 0
      ? Math.min(1, inputs.governanceVotes / Math.max(1, inputs.totalTransactions * 0.05))
      : 0;
  const protocolDiversity = Math.min(1, inputs.governanceProtocols / 5);
  const tenure = Math.min(1, inputs.tenureMonths / 24);

  const cappedBalance = Math.min(
    inputs.tokenBalanceWeight,
    config.max_balance_weight ?? 0.1,
  );

  const voteScore = participationRate * rules.vote_participation_rate;
  const diversityScore = protocolDiversity * rules.protocol_diversity;
  const tenureScore = tenure * rules.tenure_months;
  const balanceBoost = cappedBalance * 100 * (config.max_balance_weight ?? 0.1);

  const raw = voteScore + diversityScore + tenureScore + balanceBoost;
  const score = Math.min(100, Math.round(raw));

  return {
    key: "governance",
    score,
    factors: [
      {
        name: "vote_participation_rate",
        value: participationRate,
        contribution: voteScore,
      },
      {
        name: "protocol_diversity",
        value: protocolDiversity,
        contribution: diversityScore,
      },
      { name: "tenure_months", value: tenure, contribution: tenureScore },
      { name: "token_balance_weight", value: cappedBalance, contribution: balanceBoost },
    ],
  };
}
