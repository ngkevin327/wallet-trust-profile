import { loadScoringConfig, reloadScoringConfig } from "./config.loader";
import { scoreContribution } from "./dimensions/contribution";
import { scoreGovernance } from "./dimensions/governance";
import { scorePaymentReliability } from "./dimensions/payment";
import { scoreProtocolParticipation } from "./dimensions/protocol";
import type { ScoringInputs, ScoringResult } from "./scoring.types";

export class ScoringEngine {
  reloadConfig(): void {
    reloadScoringConfig();
  }

  score(inputs: ScoringInputs): ScoringResult {
    const config = loadScoringConfig();
    const governance = scoreGovernance(inputs, config.dimensions.governance);
    const contribution = scoreContribution(inputs, config.dimensions.contribution);
    const payment = scorePaymentReliability(inputs, config.dimensions.payment_reliability);
    const protocol = scoreProtocolParticipation(inputs, config.dimensions.protocol_participation);

    const dimensionDetails = [governance, contribution, payment, protocol];
    const dimensions: Record<string, number> = {
      governance: governance.score,
      contribution: contribution.score,
      payment_reliability: payment.score,
      protocol_participation: protocol.score,
    };

    const weights = config.dimensions;
    const weighted =
      governance.score * weights.governance.weight +
      contribution.score * weights.contribution.weight +
      payment.score * weights.payment_reliability.weight +
      protocol.score * weights.protocol_participation.weight;

    const reputationIndex = Math.round(
      Math.max(
        config.composite.clamp_min,
        Math.min(config.composite.clamp_max, weighted),
      ),
    );

    return {
      scoringVersion: config.version,
      reputationIndex,
      dimensions,
      dimensionDetails,
      inputs,
    };
  }
}
