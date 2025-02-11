import type { DimensionConfig, DimensionScore, ScoringInputs } from "../scoring.types";

export function scorePaymentReliability(
  inputs: ScoringInputs,
  config: DimensionConfig,
): DimensionScore {
  const rules = config.rules;
  const totalPayments = inputs.inboundPayments + inputs.outboundPayments;
  const consistency =
    totalPayments > 0 ? Math.min(1, inputs.inboundPayments / totalPayments) : 0;
  const diversity = Math.min(1, inputs.uniqueCounterparties / 15);
  const washPenalty = Math.max(0, 1 - inputs.washRatio);

  const consistencyScore = consistency * rules.inbound_consistency;
  const diversityScore = diversity * rules.counterparty_diversity;
  const washScore = washPenalty * rules.wash_penalty;

  const score = Math.min(100, Math.round(consistencyScore + diversityScore + washScore));

  return {
    key: "payment_reliability",
    score,
    factors: [
      {
        name: "inbound_consistency",
        value: consistency,
        contribution: consistencyScore,
      },
      {
        name: "counterparty_diversity",
        value: diversity,
        contribution: diversityScore,
      },
      { name: "wash_penalty", value: washPenalty, contribution: washScore },
    ],
  };
}
