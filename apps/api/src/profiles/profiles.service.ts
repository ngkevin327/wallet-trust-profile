import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ProfileStatus } from "@prisma/client";
import type { ProfileOwnerDto, ProfilePublicDto } from "@onchain-reputation/shared";
import { IndexerOrchestrator } from "../indexer/indexer.orchestrator";
import { PrismaService } from "../prisma/prisma.service";
import { mapOwnerProfile, mapPublicProfile } from "./profile.mapper";
import { ProfilesRepository } from "./profiles.repository";

const DEMO_USER_ID = "a0000000-0000-4000-8000-000000000001";

@Injectable()
export class ProfilesService {
  constructor(
    private readonly profiles: ProfilesRepository,
    private readonly indexerOrchestrator: IndexerOrchestrator,
    private readonly prisma: PrismaService,
  ) {}

  private async getLastUpdatedAt(walletId: string): Promise<Date | null> {
    const run = await this.prisma.indexRun.findFirst({
      where: { walletId, status: "completed" },
      orderBy: { completedAt: "desc" },
    });
    return run?.completedAt ?? null;
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

    return mapOwnerProfile(
      { ...full, user: full.user ?? undefined },
      lastUpdated,
    );
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

    return mapPublicProfile(profile, lastUpdated);
  }

  private mockOwnerProfile(): ProfileOwnerDto {
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
      },
      badges: ["active-voter", "dao-contributor"],
      lastUpdated: new Date().toISOString(),
      wallets: [
        {
          id: "b0000000-0000-4000-8000-000000000001",
          address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
          chainScope: ["eip155:1", "eip155:8453"],
          isPrimary: true,
          linkedAt: new Date().toISOString(),
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
