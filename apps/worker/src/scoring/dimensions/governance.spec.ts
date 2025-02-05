import { loadScoringConfig } from "../config.loader";
import { scoreGovernance } from "./governance";

const baseInputs = {
  walletAddress: "0xabc",
  walletAgeDays: 400,
  governanceVotes: 12,
  governanceProtocols: 3,
  tenureMonths: 18,
  tokenBalanceWeight: 0.05,
  daoPayments: 0,
  grantPatterns: 0,
  inboundPayments: 0,
  outboundPayments: 0,
  uniqueCounterparties: 0,
  washRatio: 0,
  distinctProtocols: 0,
  recentProtocolInteractions: 0,
  totalTransactions: 200,
};

describe("scoreGovernance", () => {
  it("returns higher score for active voters", () => {
    const config = loadScoringConfig().dimensions.governance;
    const active = scoreGovernance(baseInputs, config);
    const inactive = scoreGovernance(
      { ...baseInputs, governanceVotes: 0, governanceProtocols: 0 },
      config,
    );
    expect(active.score).toBeGreaterThan(inactive.score);
  });

  it("caps token balance influence", () => {
    const config = loadScoringConfig().dimensions.governance;
    const capped = scoreGovernance(
      { ...baseInputs, tokenBalanceWeight: 0.5 },
      config,
    );
    const uncapped = scoreGovernance(
      { ...baseInputs, tokenBalanceWeight: 0.05 },
      config,
    );
    expect(capped.score - uncapped.score).toBeLessThanOrEqual(10);
  });
});
