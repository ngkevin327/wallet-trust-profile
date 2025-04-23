import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ClassifiedFact } from "../src/classifier/classifier.service";
import { DaoAggregatorService } from "../src/dao/dao-aggregator.service";

type Fixture = {
  name: string;
  wallet: string;
  chainId: number;
  from: string;
  to: string;
  value: string;
  expectedDao: string;
  expectedConfidence: string;
};

const mockDaos = [
  {
    id: "dao-1",
    slug: "gitcoin",
    name: "Gitcoin",
    treasury: "0xde0b295669a9fd93d5f285d675a15f04fdc1afda",
    chainId: 1,
    metadata: { logoUrl: "https://example.com/gitcoin.png" },
  },
  {
    id: "dao-2",
    slug: "optimism-collective",
    name: "Optimism Collective",
    treasury: "0x0bE471f6cA7Cbf49dD061450d9CF0D4A2F99aBE9",
    chainId: 1,
    metadata: null,
  },
];

const mockPrisma = {
  dao: {
    findMany: jest.fn().mockResolvedValue(mockDaos),
  },
};

function factFromFixture(f: Fixture): ClassifiedFact {
  return {
    chainId: f.chainId,
    txHash: `0x${f.name}`,
    logIndex: null,
    blockTime: new Date("2024-01-01"),
    category: "transfer",
    protocolId: null,
    raw: { from: f.from, to: f.to, value: f.value },
  };
}

describe("DaoAggregatorService", () => {
  const fixtures = JSON.parse(
    readFileSync(join(__dirname, "fixtures", "dao-treasury-inflow.json"), "utf8"),
  ) as Fixture[];

  it("maps treasury inflows to DAO slugs with confidence", async () => {
    const aggregator = new DaoAggregatorService(mockPrisma as never);
    const facts = fixtures.map(factFromFixture);
    const result = await aggregator.aggregate(fixtures[0].wallet, facts);

    expect(result.find((r) => r.daoSlug === "gitcoin")?.confidence).toBe("direct_treasury");
    expect(result.find((r) => r.daoSlug === "optimism-collective")?.confidence).toBe(
      "direct_treasury",
    );
  });

  it("returns stable ordering by inflow amount", async () => {
    const aggregator = new DaoAggregatorService(mockPrisma as never);
    const facts = fixtures.map(factFromFixture);
    const a = await aggregator.aggregate(fixtures[0].wallet, facts);
    const b = await aggregator.aggregate(fixtures[0].wallet, facts);
    expect(a.map((r) => r.daoSlug)).toEqual(b.map((r) => r.daoSlug));
  });
});
