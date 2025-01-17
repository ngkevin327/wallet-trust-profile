import { SpamFilter } from "../src/classifier/spam.filter";
import type { ClassifiedFact } from "../src/classifier/classifier.service";
import { AggregatesService } from "../src/indexer/aggregates.service";

const mockPrisma = {
  tokenDenylist: {
    findMany: jest.fn().mockResolvedValue([
      {
        chainId: 1,
        contract: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        active: true,
      },
    ]),
  },
} as unknown as ConstructorParameters<typeof SpamFilter>[0];

describe("SpamFilter", () => {
  it("filters denylisted token transfers", async () => {
    const filter = new SpamFilter(mockPrisma);
    const facts: ClassifiedFact[] = [
      {
        chainId: 1,
        txHash: "0xspam",
        logIndex: null,
        blockTime: new Date(),
        category: "transfer",
        protocolId: null,
        raw: { tokenContract: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      },
      {
        chainId: 1,
        txHash: "0xgood",
        logIndex: null,
        blockTime: new Date(),
        category: "transfer",
        protocolId: null,
        raw: {},
      },
    ];

    const { kept, filtered } = await filter.filter(facts);
    expect(filtered).toBe(1);
    expect(kept).toHaveLength(1);
    expect(kept[0].txHash).toBe("0xgood");
  });
});

describe("AggregatesService", () => {
  it("summarizes wallets exceeding volume threshold", () => {
    const service = new AggregatesService();
    const facts = Array.from({ length: 600 }, (_, i) => ({
      chainId: 1,
      txHash: `0x${i}`,
      logIndex: null,
      blockTime: new Date(),
      category: i % 2 === 0 ? "defi" : "transfer",
      protocolId: null,
      raw: {},
    }));

    const { facts: trimmed, summary } = service.summarizeIfNeeded(facts);
    expect(summary?.activitySummarized).toBe(true);
    expect(summary?.totalTransactions).toBe(600);
    expect(trimmed.length).toBeLessThanOrEqual(500);
    expect(summary?.topProtocols.length).toBeGreaterThan(0);
  });
});
