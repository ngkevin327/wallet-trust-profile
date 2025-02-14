import type { DimensionConfig, DimensionScore, ScoringInputs } from "../scoring.types";

export function scoreProtocolParticipation(
  inputs: ScoringInputs,
  config: DimensionConfig,
): DimensionScore {
  const rules = config.rules;
  const protocolNorm = Math.min(1, inputs.distinctProtocols / 8);
  const recencyNorm = Math.min(1, inputs.recentProtocolInteractions / 30);

  const protocolScore = protocolNorm * rules.distinct_protocols;
  const recencyScore = recencyNorm * rules.recency_decay;

  const score = Math.min(100, Math.round(protocolScore + recencyScore));

  return {
    key: "protocol_participation",
    score,
    factors: [
      {
        name: "distinct_protocols",
        value: protocolNorm,
        contribution: protocolScore,
      },
      {
        name: "recency_decay",
        value: recencyNorm,
        contribution: recencyScore,
      },
    ],
  };
}
