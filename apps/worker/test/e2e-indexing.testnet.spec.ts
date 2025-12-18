/**
 * Live testnet indexing — runs only when TESTNET_E2E=true (nightly CI).
 * Uses Sepolia/Base test wallet with expected activity ranges.
 */
import { afterAll, describe, expect, it } from "@jest/globals";
import { PrismaClient, IndexRunStatus, ProfileStatus } from "@prisma/client";

const RUN_LIVE = process.env.TESTNET_E2E === "true";

const TEST_WALLET_ADDRESS = process.env.TESTNET_WALLET_ADDRESS ?? "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
const TEST_USER_ID = process.env.TESTNET_USER_ID ?? "a0000000-0000-4000-8000-000000000001";

describe("testnet indexing e2e", () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  (RUN_LIVE ? it : it.skip)(
    "completes index_run and materializes non-empty projection",
    async () => {
      const wallet = await prisma.wallet.findFirst({
        where: { address: { equals: TEST_WALLET_ADDRESS, mode: "insensitive" } },
      });
      expect(wallet).toBeTruthy();

      const latestRun = await prisma.indexRun.findFirst({
        where: { walletId: wallet!.id, status: IndexRunStatus.completed },
        orderBy: { completedAt: "desc" },
      });
      expect(latestRun).toBeTruthy();

      const profile = await prisma.profile.findUnique({
        where: { userId: wallet!.userId },
        include: { projection: true },
      });

      expect(profile?.status).toBe(ProfileStatus.active);
      expect(profile?.projection).toBeTruthy();

      const payload = profile!.projection!.payload as {
        reputationIndex?: number | null;
        badges?: unknown[];
      };

      expect(payload.reputationIndex).not.toBeNull();
      if (payload.reputationIndex != null) {
        expect(payload.reputationIndex).toBeGreaterThanOrEqual(0);
        expect(payload.reputationIndex).toBeLessThanOrEqual(100);
      }
      expect(Array.isArray(payload.badges)).toBe(true);
    },
    120_000,
  );

  (RUN_LIVE ? it : it.skip)("profile belongs to configured test user when set", async () => {
    const profile = await prisma.profile.findUnique({ where: { userId: TEST_USER_ID } });
    expect(profile).toBeTruthy();
  });
});
