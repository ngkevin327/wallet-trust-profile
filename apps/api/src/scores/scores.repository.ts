import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ScoresRepository {
  constructor(private readonly prisma: PrismaService) {}

  findLatestSnapshot(walletId: string) {
    return this.prisma.scoreSnapshot.findFirst({
      where: { walletId },
      orderBy: { createdAt: "desc" },
    });
  }

  findActiveBadges(walletId: string) {
    return this.prisma.badgeAward.findMany({
      where: { walletId, revokedAt: null },
      orderBy: { earnedAt: "desc" },
    });
  }
}
