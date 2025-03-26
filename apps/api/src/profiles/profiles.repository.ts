import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProfileStatus, ProfileVisibility } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { validateSlug } from "./slug.validator";

@Injectable()
export class ProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.profile.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        user: { include: { wallets: true } },
        projection: true,
      },
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
    const slug = validateSlug(data.slug);

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
      data.slug = validateSlug(data.slug);
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
