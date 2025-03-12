import type { PrismaClient } from "@prisma/client";
import type { ClassifiedFact } from "../classifier/classifier.service";

export type TrustFlag = {
  code: string;
  label: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  reason: string;
};

type RiskLabelRow = {
  code: string;
  title: string;
  severity: string;
  active: boolean;
};

export class RiskEngine {
  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(walletAddress: string, facts: ClassifiedFact[]): Promise<TrustFlag[]> {
    const labels = await this.prisma.riskLabel.findMany({ where: { active: true } });
    const flags: TrustFlag[] = [];
    const wallet = walletAddress.toLowerCase();

    for (const label of labels as RiskLabelRow[]) {
      const hit = facts.some((fact) => {
        const to = String(fact.raw.to ?? "").toLowerCase();
        const from = String(fact.raw.from ?? "").toLowerCase();
        const token = String(fact.raw.tokenContract ?? "").toLowerCase();
        return (
          to.includes(label.code) ||
          from.includes(label.code) ||
          token.includes(label.code)
        );
      });

      if (hit) {
        flags.push({
          code: label.code,
          label: label.title,
          severity: label.severity as TrustFlag["severity"],
          confidence: 0.85,
          reason: `Interaction matched risk registry entry: ${label.code}`,
        });
      }
    }

    const selfTransfers = facts.filter((f) => {
      const from = String(f.raw.from ?? "").toLowerCase();
      const to = String(f.raw.to ?? "").toLowerCase();
      return from === to && from === wallet;
    }).length;

    if (selfTransfers > 5) {
      flags.push({
        code: "high_self_transfer",
        label: "Elevated self-transfers",
        severity: "low",
        confidence: 0.6,
        reason: `${selfTransfers} self-directed transfers detected`,
      });
    }

    const washRatio =
      facts.length > 0
        ? facts.filter((f) => f.category === "transfer").length / facts.length
        : 0;

    if (washRatio > 0.8 && facts.length > 20) {
      flags.push({
        code: "wash_pattern",
        label: "Wash trading pattern",
        severity: "medium",
        confidence: 0.7,
        reason: "Transfer-heavy activity with limited protocol diversity",
      });
    }

    if (flags.length === 0) {
      flags.push({
        code: "clean_history",
        label: "No elevated risk signals",
        severity: "low",
        confidence: 0.75,
        reason: "No registry matches or heuristic flags in indexed window",
      });
    }

    return flags;
  }
}
