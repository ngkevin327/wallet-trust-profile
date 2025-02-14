import { loadScoringConfig } from "./config.loader";
import { scoreContribution } from "./dimensions/contribution";
import { scoreGovernance } from "./dimensions/governance";
import { scorePaymentReliability } from "./dimensions/payment";
import { scoreProtocolParticipation } from "./dimensions/protocol";
import type { ScoringInputs, ScoringResult } from "./scoring.types";

export class ScoringEngine {
  private readonly config = loadScoringConfig();

  score(inputs: ScoringInputs): ScoringResult {
    const governance = scoreGovernance(inputs, this.config.dimensions.governance);
    const contribution = scoreContribution(
      inputs,
      this.config.dimensions.contribution,
    );
    const payment = scorePaymentReliability(
      inputs,
      this.config.dimensions.payment_reliability,
    );
    const protocol = scoreProtocolParticipation(
      inputs,
      this.config.dimensions.protocol_participation,
    );

    const dimensionDetails = [governance, contribution, payment, protocol];
    const dimensions: Record<string, number> = {
      governance: governance.score,
      contribution: contribution.score,
      payment_reliability: payment.score,
      protocol_participation: protocol.score,
    };

    const weights = this.config.dimensions;
    const weighted =
      governance.score * weights.governance.weight +
      contribution.score * weights.contribution.weight +
      payment.score * weights.payment_reliability.weight +
      protocol.score * weights.protocol_participation.weight;

    const reputationIndex = Math.round(
      Math.max(
        this.config.composite.clamp_min,
        Math.min(this.config.composite.clamp_max, weighted),
      ),
    );

    return {
      scoringVersion: this.config.version,
      reputationIndex,
      dimensions,
      dimensionDetails,
      inputs,
    };
  }
}
