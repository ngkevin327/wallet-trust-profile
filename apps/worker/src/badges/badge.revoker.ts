import type { PrismaClient } from "@prisma/client";

export async function revokeStaleBadges(
  prisma: PrismaClient,
  walletId: string,
  earnedCodes: Set<string>,
): Promise<number> {
  const active = await prisma.badgeAward.findMany({
    where: { walletId, revokedAt: null },
  });

  let revoked = 0;
  for (const award of active) {
    if (!earnedCodes.has(award.badgeCode)) {
      await prisma.badgeAward.update({
        where: { id: award.id },
        data: { revokedAt: new Date() },
      });
      revoked += 1;
    }
  }

  return revoked;
}
