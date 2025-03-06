import type { ScoringResult } from "../scoring/scoring.types";
import { BadgeEvaluator } from "./badge.evaluator";

const baseResult: ScoringResult = {
  scoringVersion: "1.0.0",
  reputationIndex: 75,
  dimensions: {
    governance: 70,
    contribution: 72,
    payment_reliability: 68,
    protocol_participation: 60,
  },
  dimensionDetails: [],
  inputs: {
    walletAddress: "0xabc",
    walletAgeDays: 400,
    governanceVotes: 12,
    governanceProtocols: 3,
    tenureMonths: 18,
    tokenBalanceWeight: 0.05,
    daoPayments: 5,
    grantPatterns: 3,
    inboundPayments: 20,
    outboundPayments: 10,
    uniqueCounterparties: 10,
    washRatio: 0.05,
    distinctProtocols: 7,
    recentProtocolInteractions: 15,
    totalTransactions: 200,
  },
};

describe("BadgeEvaluator", () => {
  it("awards active-voter when governance vote threshold met", () => {
    const evaluator = new BadgeEvaluator({} as never);
    const earned = evaluator.evaluate(baseResult);
    expect(earned).toContain("active-voter");
    expect(earned).toContain("dao-contributor");
  });

  it("does not award reputation-elite below index threshold", () => {
    const evaluator = new BadgeEvaluator({} as never);
    const earned = evaluator.evaluate({ ...baseResult, reputationIndex: 60 });
    expect(earned).not.toContain("reputation-elite");
  });

  it("awards reputation-elite at high index", () => {
    const evaluator = new BadgeEvaluator({} as never);
    const earned = evaluator.evaluate({ ...baseResult, reputationIndex: 90 });
    expect(earned).toContain("reputation-elite");
  });
});
