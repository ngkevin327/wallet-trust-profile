import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Profile, ProfileStatus, ProfileVisibility } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "health",
  "login",
  "logout",
  "me",
  "profiles",
  "settings",
  "support",
  "verify",
  "wallet",
  "wallets",
]);

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/;

@Injectable()
export class ProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  validateSlug(slug: string): void {
    const normalized = slug.toLowerCase().trim();
    if (!SLUG_PATTERN.test(normalized)) {
      throw new BadRequestException(
        "Slug must be 3-63 characters, lowercase alphanumeric with hyphens",
      );
    }
    if (RESERVED_SLUGS.has(normalized)) {
      throw new BadRequestException("Slug is reserved");
    }
  }

  findById(id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({
      where: { slug: slug.toLowerCase() },
      include: { user: { include: { wallets: true } } },
    });
  }

  findByUserId(userId: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { userId } });
  }

  async create(data: {
    userId: string;
    slug: string;
    displayName?: string;
    visibility?: ProfileVisibility;
  }): Promise<Profile> {
    this.validateSlug(data.slug);
    const slug = data.slug.toLowerCase();

    const existing = await this.prisma.profile.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException("Slug is already taken");
    }

    return this.prisma.profile.create({
      data: {
        userId: data.userId,
        slug,
        displayName: data.displayName,
        visibility: data.visibility ?? ProfileVisibility.public,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ProfileUpdateInput,
  ): Promise<Profile> {
    const profile = await this.findById(id);
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    if (typeof data.slug === "string") {
      this.validateSlug(data.slug);
      data.slug = data.slug.toLowerCase();
    }

    return this.prisma.profile.update({ where: { id }, data });
  }

  bumpCacheVersion(id: string): Promise<Profile> {
    return this.prisma.profile.update({
      where: { id },
      data: { publicCacheVersion: { increment: 1 } },
    });
  }

  setStatus(userId: string, status: ProfileStatus): Promise<Profile> {
    return this.prisma.profile.update({
      where: { userId },
      data: { status },
    });
  }
}
