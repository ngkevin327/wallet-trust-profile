import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ProfileStatus } from "@prisma/client";
import type {
  BadgeDto,
  ProfileOwnerDto,
  ProfilePublicDto,
  ProfileScoreDimensionsDto,
} from "@onchain-reputation/shared";
import { IndexerOrchestrator } from "../indexer/indexer.orchestrator";
import { PrismaService } from "../prisma/prisma.service";
import { ScoresRepository } from "../scores/scores.repository";
import { TrustService } from "../trust/trust.service";
import { getBadgeTitle } from "./badge-titles";
import { mapOwnerProfile, mapPublicProfile } from "./profile.mapper";
import { ProfilesRepository } from "./profiles.repository";

const DEMO_USER_ID = "a0000000-0000-4000-8000-000000000001";

type DimensionJson = {
  governance?: number;
  contribution?: number;
  payment_reliability?: number;
  protocol_participation?: number;
};

@Injectable()
export class ProfilesService {
  constructor(
    private readonly profiles: ProfilesRepository,
    private readonly indexerOrchestrator: IndexerOrchestrator,
    private readonly prisma: PrismaService,
    private readonly scores: ScoresRepository,
    private readonly trust: TrustService,
  ) {}

  private async getLastUpdatedAt(walletId: string): Promise<Date | null> {
    const run = await this.prisma.indexRun.findFirst({
      where: { walletId, status: "completed" },
      orderBy: { completedAt: "desc" },
    });
    return run?.completedAt ?? null;
  }

  private mapDimensions(raw: DimensionJson | null): ProfileScoreDimensionsDto | null {
    if (!raw) {
      return null;
    }
    return {
      governance: raw.governance ?? 0,
      contribution: raw.contribution ?? 0,
      paymentReliability: raw.payment_reliability ?? 0,
      protocolParticipation: raw.protocol_participation,
    };
  }

  private async buildScoreContext(
    walletId: string,
    walletAddress: string,
  ): Promise<{
    reputationIndex: number | null;
    dimensions: ProfileScoreDimensionsDto | null;
    badges: BadgeDto[];
    trustSignals: Awaited<ReturnType<TrustService["getSignalsForWallet"]>>;
  }> {
    const [snapshot, badgeRows, trustSignals] = await Promise.all([
      this.scores.findLatestSnapshot(walletId),
      this.scores.findActiveBadges(walletId),
      this.trust.getSignalsForWallet(walletId, walletAddress),
    ]);

    return {
      reputationIndex: snapshot?.reputationIndex ?? null,
      dimensions: this.mapDimensions((snapshot?.dimensions as DimensionJson) ?? null),
      badges: badgeRows.map((b) => ({
        code: b.badgeCode,
        title: getBadgeTitle(b.badgeCode),
        earnedAt: b.earnedAt.toISOString(),
      })),
      trustSignals,
    };
  }

  isMockMode(): boolean {
    return process.env.API_MOCK_MODE === "true" || process.env.NODE_ENV === "development";
  }

  async getOwnerProfile(userId?: string): Promise<ProfileOwnerDto> {
    const targetUserId = userId ?? DEMO_USER_ID;
    const profile = await this.profiles.findByUserId(targetUserId);

    if (!profile) {
      if (this.isMockMode()) {
        return this.mockOwnerProfile();
      }
      throw new NotFoundException("Profile not found");
    }

    const full = await this.profiles.findBySlug(profile.slug);
    if (!full) {
      throw new NotFoundException("Profile not found");
    }

    const primaryWallet = full.user?.wallets.find((w) => w.isPrimary) ?? full.user?.wallets[0];
    const lastUpdated = primaryWallet
      ? await this.getLastUpdatedAt(primaryWallet.id)
      : null;

    const score = primaryWallet
      ? await this.buildScoreContext(primaryWallet.id, primaryWallet.address)
      : {
          reputationIndex: null,
          dimensions: null,
          badges: [],
          trustSignals: [],
        };

    return mapOwnerProfile({ ...full, user: full.user ?? undefined }, lastUpdated, score);
  }

  async getPublicProfile(slug: string): Promise<ProfilePublicDto> {
    const profile = await this.profiles.findBySlug(slug);
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }
    if (profile.visibility === "private") {
      throw new NotFoundException("Profile not found");
    }

    const wallet = await this.prisma.wallet.findFirst({
      where: { userId: profile.userId },
    });
    const lastUpdated = wallet ? await this.getLastUpdatedAt(wallet.id) : null;
    const score = wallet
      ? await this.buildScoreContext(wallet.id, wallet.address)
      : {
          reputationIndex: null,
          dimensions: null,
          badges: [],
          trustSignals: [],
        };

    return mapPublicProfile(profile, lastUpdated, score);
  }

  private mockOwnerProfile(): ProfileOwnerDto {
    const now = new Date().toISOString();
    return {
      id: "c0000000-0000-4000-8000-000000000001",
      userId: DEMO_USER_ID,
      slug: "demo-builder",
      displayName: "Demo Builder",
      visibility: "public",
      status: "indexing",
      publicCacheVersion: 1,
      reputationIndex: 72,
      dimensions: {
        governance: 65,
        contribution: 80,
        paymentReliability: 74,
        protocolParticipation: 58,
      },
      badges: [
        { code: "active-voter", title: "Active Voter", earnedAt: now },
        { code: "dao-contributor", title: "DAO Contributor", earnedAt: now },
      ],
      trustSignals: [
        {
          code: "clean_history",
          label: "No elevated risk signals",
          severity: "low",
          confidence: 0.75,
          reason: "Demo profile — no risk flags",
        },
      ],
      lastUpdated: now,
      lastUpdatedAt: now,
      wallets: [
        {
          id: "b0000000-0000-4000-8000-000000000001",
          address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
          chainScope: ["eip155:1", "eip155:8453"],
          isPrimary: true,
          linkedAt: now,
        },
      ],
    };
  }

  async enqueueIndexForWallet(walletId: string, userId: string, chainId: number) {
    await this.profiles.setStatus(userId, ProfileStatus.indexing);
    await this.indexerOrchestrator.createRun(walletId, userId, chainId);
  }

  async triggerRefresh(userId: string, walletId: string, chainId: number, isPremium: boolean) {
    if (!isPremium) {
      throw new ForbiddenException("Profile refresh requires premium subscription");
    }
    await this.profiles.setStatus(userId, ProfileStatus.indexing);
    return this.indexerOrchestrator.createRun(walletId, userId, chainId);
  }
}
