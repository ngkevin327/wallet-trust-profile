import type { PrismaClient } from "@prisma/client";
import type {
  DaoContributionConfidenceDto,
  DaoContributionDto,
} from "@onchain-reputation/shared";

export type { DaoContributionConfidenceDto as DaoAttributionConfidence };
import type { ClassifiedFact } from "../classifier/classifier.service";

type DaoRegistry = {
  id: string;
  slug: string;
  name: string;
  treasury: string | null;
  chainId: number;
  metadata: Record<string, unknown> | null;
};

type AggregateRow = {
  daoSlug: string;
  daoName: string;
  logoUrl: string | null;
  totalInflowWei: bigint;
  paymentCount: number;
  firstSeen: Date;
  lastSeen: Date;
  confidence: DaoContributionConfidenceDto;
};

const ROUTER_CONTRACTS = new Set([
  "0xdef1c0ded9bec7b1bd1747bdcfb48da016cecad", // 0x exchange proxy pattern
]);

export class DaoAggregatorService {
  private daos: DaoRegistry[] = [];
  private treasuryIndex = new Map<string, DaoRegistry>();
  private loaded = false;

  constructor(private readonly prisma: PrismaClient) {}

  async loadRegistry(): Promise<void> {
    if (this.loaded) {
      return;
    }
    this.daos = await this.prisma.dao.findMany({ where: { active: true } });
    for (const dao of this.daos) {
      if (dao.treasury) {
        this.treasuryIndex.set(`${dao.chainId}:${dao.treasury.toLowerCase()}`, dao);
      }
    }
    this.loaded = true;
  }

  async aggregate(
    walletAddress: string,
    facts: ClassifiedFact[],
  ): Promise<DaoContributionDto[]> {
    await this.loadRegistry();
    const wallet = walletAddress.toLowerCase();
    const rows = new Map<string, AggregateRow>();

    for (const fact of facts) {
      const from = String(fact.raw.from ?? "").toLowerCase();
      const to = String(fact.raw.to ?? "").toLowerCase();
      const value = BigInt(String(fact.raw.value ?? "0"));

      if (to !== wallet || value <= 0n) {
        continue;
      }

      let dao: DaoRegistry | undefined;
      let confidence: DaoContributionConfidenceDto = "low_confidence";

      const treasuryKey = `${fact.chainId}:${from}`;
      const direct = this.treasuryIndex.get(treasuryKey);
      if (direct) {
        dao = direct;
        confidence = "direct_treasury";
      } else if (fact.category === "dao_contribution" && fact.protocolId) {
        dao = this.daos.find((d) => d.id === fact.protocolId);
        confidence = dao ? "direct_treasury" : "low_confidence";
      } else if (ROUTER_CONTRACTS.has(from)) {
        dao = this.daos.find((d) => d.chainId === fact.chainId);
        confidence = "router_inferred";
      }

      if (!dao) {
        continue;
      }

      const existing = rows.get(dao.slug);
      if (!existing) {
        const logoUrl =
          typeof dao.metadata?.logoUrl === "string" ? (dao.metadata.logoUrl as string) : null;
        rows.set(dao.slug, {
          daoSlug: dao.slug,
          daoName: dao.name,
          logoUrl,
          totalInflowWei: value,
          paymentCount: 1,
          firstSeen: fact.blockTime,
          lastSeen: fact.blockTime,
          confidence,
        });
      } else {
        existing.totalInflowWei += value;
        existing.paymentCount += 1;
        if (fact.blockTime < existing.firstSeen) {
          existing.firstSeen = fact.blockTime;
        }
        if (fact.blockTime > existing.lastSeen) {
          existing.lastSeen = fact.blockTime;
        }
        if (confidence === "direct_treasury") {
          existing.confidence = "direct_treasury";
        } else if (
          confidence === "router_inferred" &&
          existing.confidence !== "direct_treasury"
        ) {
          existing.confidence = "router_inferred";
        }
      }
    }

    return [...rows.values()]
      .sort((a, b) => (a.totalInflowWei > b.totalInflowWei ? -1 : 1))
      .slice(0, 5)
      .map((row) => ({
        daoSlug: row.daoSlug,
        daoName: row.daoName,
        logoUrl: row.logoUrl,
        totalInflowWei: row.totalInflowWei.toString(),
        paymentCount: row.paymentCount,
        tenureDays: Math.max(
          1,
          Math.ceil((row.lastSeen.getTime() - row.firstSeen.getTime()) / (24 * 60 * 60 * 1000)),
        ),
        confidence: row.confidence,
      }));
  }
}
