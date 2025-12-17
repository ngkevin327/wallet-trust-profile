import { ScoringEngine } from "./scoring.engine";
import type { ScoringInputs } from "./scoring.types";

const richInputs: ScoringInputs = {
  walletAddress: "0xabc",
  walletAgeDays: 500,
  governanceVotes: 25,
  governanceProtocols: 4,
  tenureMonths: 24,
  tokenBalanceWeight: 0.05,
  daoPayments: 15,
  grantPatterns: 8,
  inboundPayments: 40,
  outboundPayments: 20,
  uniqueCounterparties: 12,
  washRatio: 0.05,
  distinctProtocols: 6,
  recentProtocolInteractions: 20,
  totalTransactions: 300,
};

describe("ScoringEngine", () => {
  it("computes composite index within bounds", async () => {
    const engine = new ScoringEngine();
    const result = await engine.score(richInputs);
    expect(result.reputationIndex).toBeGreaterThanOrEqual(0);
    expect(result.reputationIndex).toBeLessThanOrEqual(100);
    expect(result.scoringVersion).toBe("1.0.0");
    expect(Object.keys(result.dimensions)).toHaveLength(4);
  });

  it("scores higher for richer on-chain activity", async () => {
    const engine = new ScoringEngine();
    const rich = await engine.score(richInputs);
    const sparse = await engine.score({
      ...richInputs,
      governanceVotes: 0,
      daoPayments: 0,
      distinctProtocols: 0,
      inboundPayments: 0,
    });
    expect(rich.reputationIndex).toBeGreaterThan(sparse.reputationIndex);
  });
});
