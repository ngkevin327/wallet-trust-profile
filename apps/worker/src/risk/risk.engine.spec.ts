import type { ClassifiedFact } from "../classifier/classifier.service";
import { RiskEngine } from "./risk.engine";

const mockPrisma = {
  riskLabel: {
    findMany: jest.fn().mockResolvedValue([
      {
        code: "exploit-drainer-001",
        title: "Known exploit contract",
        severity: "high",
        active: true,
      },
    ]),
  },
};

describe("RiskEngine", () => {
  it("flags registry contract interactions", async () => {
    const engine = new RiskEngine(mockPrisma as never);
    const facts: ClassifiedFact[] = [
      {
        chainId: 1,
        txHash: "0x1",
        logIndex: null,
        blockTime: new Date(),
        category: "transfer",
        protocolId: null,
        raw: { from: "0xabc", to: "exploit-drainer-001", value: "0" },
      },
    ];
    const flags = await engine.evaluate("0xabc", facts);
    expect(flags.some((f) => f.code === "exploit-drainer-001")).toBe(true);
  });

  it("returns clean signal when no risks found", async () => {
    const engine = new RiskEngine({
      riskLabel: { findMany: jest.fn().mockResolvedValue([]) },
    } as never);
    const flags = await engine.evaluate("0xabc", []);
    expect(flags.some((f) => f.code === "clean_history")).toBe(true);
  });
});
