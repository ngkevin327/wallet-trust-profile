import { Injectable } from "@nestjs/common";
import type { ProfileProjectionDto } from "@onchain-reputation/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProjectionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string) {
    return this.prisma.profile.findUnique({
      where: { slug: slug.toLowerCase() },
      include: { projection: true },
    });
  }

  findProjectionBySlug(slug: string): Promise<ProfileProjectionDto | null> {
    return this.prisma.profile
      .findUnique({
        where: { slug: slug.toLowerCase() },
        include: { projection: true },
      })
      .then((row) => {
        if (!row?.projection) {
          return null;
        }
        return row.projection.payload as ProfileProjectionDto;
      });
  }
}
