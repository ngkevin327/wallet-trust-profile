import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { ProfileProjectionDto } from "@onchain-reputation/shared";
import { CacheService } from "../cache/cache.service";
import { ProfileStatus, ProfileVisibility } from "@prisma/client";
import {
  normalizeAddress,
  type ProfileOwnerDto,
  type ProfilePublicDto,
} from "@onchain-reputation/shared";
import { IndexerOrchestrator } from "../indexer/indexer.orchestrator";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { mapProjectionToOwner, mapProjectionToPublic } from "./projection.mapper";
import { ProjectionsRepository } from "./projections.repository";
import { ProfilesRepository } from "./profiles.repository";
import { assertPublicReadable } from "./public-profile.policy";
import { validateSlug } from "./slug.validator";

const DEMO_USER_ID = "a0000000-0000-4000-8000-000000000001";
const MOCK_PUBLIC_SLUG = "demo-builder";
const MOCK_PRIVATE_SLUG = "private-demo";
const PUBLIC_PROFILE_SLUG = MOCK_PUBLIC_SLUG;

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    private readonly profiles: ProfilesRepository,
    private readonly projections: ProjectionsRepository,
    private readonly indexerOrchestrator: IndexerOrchestrator,
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  isMockMode(): boolean {
    return process.env.API_MOCK_MODE === "true" || process.env.NODE_ENV === "development";
  }

  async getPublicProfileFromProjection(
    slug: string,
  ): Promise<{ profile: ProfilePublicDto; cacheVersion: number | null }> {
    if (this.isMockMode()) {
      return this.getMockPublicProfile(slug);
    }

    const row = await this.projections.findBySlug(slug);
    assertPublicReadable(row);

    if (!row.projection) {
      throw new NotFoundException("Profile not found");
    }

    const cacheKey = `profile:public:${row.slug}:v${row.publicCacheVersion}`;
    const payload = await this.cache.getOrSet<ProfileProjectionDto>(
      cacheKey,
      async () => row.projection!.payload as ProfileProjectionDto,
      { namespace: "profiles:slug", ttlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 600) },
    );

    return {
      profile: mapProjectionToPublic(payload),
      cacheVersion: row.publicCacheVersion,
    };
  }

  async getPublicProfileByWallet(
    address: string,
  ): Promise<{ profile: ProfilePublicDto; cacheVersion: number | null; canonicalSlug: string }> {
    if (this.isMockMode()) {
      try {
        normalizeAddress(address);
      } catch {
        throw new NotFoundException("Profile not found");
      }
      const { profile, cacheVersion } = await this.getMockPublicProfile(PUBLIC_PROFILE_SLUG);
      return { profile, cacheVersion, canonicalSlug: PUBLIC_PROFILE_SLUG };
    }

    const checksum = normalizeAddress(address);
    const wallet = await this.prisma.wallet.findFirst({
      where: { address: checksum },
      include: { user: { include: { profile: { include: { projection: true } } } } },
    });

    if (!wallet?.user?.profile) {
      throw new NotFoundException("Profile not found");
    }

    const { profile, cacheVersion } = await this.getPublicProfileFromProjection(
      wallet.user.profile.slug,
    );
    return { profile, cacheVersion, canonicalSlug: wallet.user.profile.slug };
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

    if (full.projection) {
      const payload = full.projection.payload as Parameters<typeof mapProjectionToOwner>[0];
      return mapProjectionToOwner(payload, { ...full, user: full.user ?? undefined });
    }

    if (this.isMockMode()) {
      return this.mockOwnerProfile();
    }

    throw new NotFoundException("Profile projection not available");
  }

  async checkSlugAvailability(slug: string): Promise<{ available: boolean; slug: string }> {
    try {
      const normalized = validateSlug(slug);
      if (this.isMockMode() && normalized === MOCK_PRIVATE_SLUG) {
        return { available: false, slug: normalized };
      }
      const existing = await this.profiles.findBySlug(normalized);
      return { available: !existing, slug: normalized };
    } catch {
      return { available: false, slug: slug.toLowerCase() };
    }
  }

  async updateOwnerProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileOwnerDto & { publicCacheVersion: number }> {
    const profile = await this.profiles.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    const data: {
      displayName?: string;
      slug?: string;
      visibility?: ProfileVisibility;
    } = {};

    if (dto.displayName !== undefined) {
      data.displayName = dto.displayName;
    }
    if (dto.slug !== undefined) {
      data.slug = dto.slug;
    }
    if (dto.visibility !== undefined) {
      const previous = profile.visibility;
      data.visibility = dto.visibility as ProfileVisibility;
      if (previous !== data.visibility) {
        this.logger.log(
          JSON.stringify({
            event: "profile_visibility_changed",
            userId,
            profileId: profile.id,
            from: previous,
            to: data.visibility,
          }),
        );
      }
    }

    let updated = await this.profiles.update(profile.id, data);
    const previousSlug = profile.slug;
    updated = await this.profiles.bumpCacheVersion(profile.id);
    await this.cache.del(`profile:public:${previousSlug}:v${profile.publicCacheVersion}`);
    if (updated.slug !== previousSlug) {
      await this.cache.del(`profile:public:${updated.slug}:v${updated.publicCacheVersion}`);
    }

    const full = await this.profiles.findBySlug(updated.slug);
    if (!full?.projection) {
      return { ...(await this.getOwnerProfile(userId)), publicCacheVersion: updated.publicCacheVersion };
    }

    const payload = full.projection.payload as Parameters<typeof mapProjectionToOwner>[0];
    payload.visibility = updated.visibility;
    payload.displayName = updated.displayName;
    payload.publicCacheVersion = updated.publicCacheVersion;

    await this.prisma.profileProjection.update({
      where: { profileId: updated.id },
      data: { payload },
    });

    return {
      ...mapProjectionToOwner(payload, { ...full, user: full.user ?? undefined }),
      publicCacheVersion: updated.publicCacheVersion,
    };
  }

  private getMockPublicProfile(slug: string): {
    profile: ProfilePublicDto;
    cacheVersion: number | null;
  } {
    if (slug === MOCK_PRIVATE_SLUG) {
      throw new NotFoundException("Profile not found");
    }
    if (slug !== MOCK_PUBLIC_SLUG) {
      throw new NotFoundException("Profile not found");
    }
    const now = new Date().toISOString();
    return {
      profile: {
        slug: MOCK_PUBLIC_SLUG,
        displayName: "Demo Builder",
        visibility: "public",
        status: "active",
        reputationIndex: 72,
        dimensions: {
          governance: 65,
          contribution: 80,
          paymentReliability: 74,
          protocolParticipation: 58,
        },
        badges: [
          { code: "active-voter", title: "Active Voter", earnedAt: now },
        ],
        trustSignals: [],
        daoContributions: [],
        scoringVersion: "1.0.0",
        lastUpdated: now,
        lastUpdatedAt: now,
      },
      cacheVersion: 1,
    };
  }

  private mockOwnerProfile(): ProfileOwnerDto {
    const now = new Date().toISOString();
    return {
      id: "c0000000-0000-4000-8000-000000000001",
      userId: DEMO_USER_ID,
      slug: MOCK_PUBLIC_SLUG,
      displayName: "Demo Builder",
      visibility: "public",
      status: "active",
      publicCacheVersion: 1,
      reputationIndex: 72,
      dimensions: {
        governance: 65,
        contribution: 80,
        paymentReliability: 74,
        protocolParticipation: 58,
      },
      badges: [{ code: "active-voter", title: "Active Voter", earnedAt: now }],
      trustSignals: [],
      daoContributions: [],
      scoringVersion: "1.0.0",
      lastUpdated: now,
      lastUpdatedAt: now,
      wallets: [
        {
          id: "b0000000-0000-4000-8000-000000000001",
          address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
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
