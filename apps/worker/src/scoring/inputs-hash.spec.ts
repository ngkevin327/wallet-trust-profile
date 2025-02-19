import { hashScoringInputs } from "./inputs-hash";
import type { ScoringInputs } from "./scoring.types";

const sample: ScoringInputs = {
  walletAddress: "0xabc",
  walletAgeDays: 100,
  governanceVotes: 5,
  governanceProtocols: 2,
  tenureMonths: 3,
  tokenBalanceWeight: 0.05,
  daoPayments: 1,
  grantPatterns: 0,
  inboundPayments: 10,
  outboundPayments: 5,
  uniqueCounterparties: 4,
  washRatio: 0.1,
  distinctProtocols: 3,
  recentProtocolInteractions: 2,
  totalTransactions: 50,
};

describe("hashScoringInputs", () => {
  it("returns stable sha256 hex", () => {
    const a = hashScoringInputs(sample);
    const b = hashScoringInputs({ ...sample });
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it("changes when inputs change", () => {
    const a = hashScoringInputs(sample);
    const b = hashScoringInputs({ ...sample, governanceVotes: 6 });
    expect(a).not.toBe(b);
  });
});
