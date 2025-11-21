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

  findSnapshotsForWallet(walletId: string, since: Date, limit = 100) {
    return this.prisma.scoreSnapshot.findMany({
      where: { walletId, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        reputationIndex: true,
        scoringVersion: true,
      },
    });
  }
}
