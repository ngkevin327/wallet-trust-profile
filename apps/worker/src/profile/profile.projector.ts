import type { PrismaClient } from "@prisma/client";
import type { ProfileProjectionDto } from "@onchain-reputation/shared";
import type Redis from "ioredis";
import { getBadgeTitle } from "../badges/badge-titles";
import type { ClassifiedFact } from "../classifier/classifier.service";
import type { TrustFlag } from "../risk/risk.engine";
import type { ScoringResult } from "../scoring/scoring.types";
import { publishProfileIndexed } from "./profile.events";

type DimensionJson = {
  governance?: number;
  contribution?: number;
  payment_reliability?: number;
  protocol_participation?: number;
};

export class ProfileProjector {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis?: Redis,
  ) {}

  async project(params: {
    userId: string;
    walletId: string;
    walletAddress: string;
    scoringResult: ScoringResult;
    scoringVersion: string;
    trustFlags: TrustFlag[];
    facts: ClassifiedFact[];
    lastUpdatedAt: Date;
  }): Promise<ProfileProjectionDto> {
    const profile = await this.prisma.profile.findUnique({ where: { userId: params.userId } });
    if (!profile) {
      throw new Error(`Profile not found for user ${params.userId}`);
    }

    const previousVersion = profile.publicCacheVersion;
    const badgeRows = await this.prisma.badgeAward.findMany({
      where: { walletId: params.walletId, revokedAt: null },
      orderBy: { earnedAt: "desc" },
    });

    const dimensions = params.scoringResult.dimensions as DimensionJson;
    const categoryCounts = new Map<string, number>();
    for (const fact of params.facts) {
      categoryCounts.set(fact.category, (categoryCounts.get(fact.category) ?? 0) + 1);
    }

    const payload: ProfileProjectionDto = {
      slug: profile.slug,
      displayName: profile.displayName,
      visibility: profile.visibility,
      status: profile.status,
      reputationIndex: params.scoringResult.reputationIndex,
      dimensions: {
        governance: dimensions.governance ?? 0,
        contribution: dimensions.contribution ?? 0,
        paymentReliability: dimensions.payment_reliability ?? 0,
        protocolParticipation: dimensions.protocol_participation,
      },
      badges: badgeRows.map((b) => ({
        code: b.badgeCode,
        title: getBadgeTitle(b.badgeCode),
        earnedAt: b.earnedAt.toISOString(),
      })),
      trustSignals: params.trustFlags.map((f) => ({
        code: f.code,
        label: f.label,
        severity: f.severity,
        confidence: f.confidence,
        reason: f.reason,
      })),
      daoContributions: [],
      resumeSummary: {
        totalTransactions: params.facts.length,
        topCategories: [...categoryCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([category, count]) => ({ category, count })),
      },
      scoringVersion: params.scoringVersion,
      lastUpdatedAt: params.lastUpdatedAt.toISOString(),
      publicCacheVersion: previousVersion + 1,
    };

    const updated = await this.prisma.profile.update({
      where: { id: profile.id },
      data: { publicCacheVersion: { increment: 1 } },
    });

    payload.publicCacheVersion = updated.publicCacheVersion;

    await this.prisma.profileProjection.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        payload,
        scoringVersion: params.scoringVersion,
        lastUpdatedAt: params.lastUpdatedAt,
      },
      update: {
        payload,
        scoringVersion: params.scoringVersion,
        lastUpdatedAt: params.lastUpdatedAt,
      },
    });

    if (this.redis && profile.visibility === "public") {
      const cacheKey = `profile:public:${profile.slug}:v${payload.publicCacheVersion}`;
      await this.redis.setex(cacheKey, 600, JSON.stringify(payload));
      await publishProfileIndexed(this.redis, {
        slug: profile.slug,
        profileId: profile.id,
        publicCacheVersion: payload.publicCacheVersion,
        previousCacheVersion: previousVersion,
      });
    }

    return payload;
  }
}
