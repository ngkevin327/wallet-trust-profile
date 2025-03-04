import { Injectable } from "@nestjs/common";
import type { TrustSignalDto } from "@onchain-reputation/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TrustService {
  constructor(private readonly prisma: PrismaService) {}

  async getSignalsForWallet(walletId: string, walletAddress: string): Promise<TrustSignalDto[]> {
    const [labels, facts] = await Promise.all([
      this.prisma.riskLabel.findMany({ where: { active: true } }),
      this.prisma.transactionFact.findMany({
        where: { walletId },
        orderBy: { blockTime: "desc" },
        take: 500,
      }),
    ]);

    const flags: TrustSignalDto[] = [];
    const wallet = walletAddress.toLowerCase();

    for (const label of labels) {
      const hit = facts.some((fact) => {
        const raw = fact.raw as Record<string, unknown>;
        const to = String(raw.to ?? "").toLowerCase();
        const from = String(raw.from ?? "").toLowerCase();
        const token = String(raw.tokenContract ?? "").toLowerCase();
        return to.includes(label.code) || from.includes(label.code) || token.includes(label.code);
      });

      if (hit) {
        flags.push({
          code: label.code,
          label: label.title,
          severity: label.severity,
          confidence: 0.85,
          reason: `Interaction matched risk registry entry: ${label.code}`,
        });
      }
    }

    if (flags.length === 0) {
      flags.push({
        code: "clean_history",
        label: "No elevated risk signals",
        severity: "low",
        confidence: 0.75,
        reason: "No registry matches in recent indexed activity",
      });
    }

    return flags;
  }
}
