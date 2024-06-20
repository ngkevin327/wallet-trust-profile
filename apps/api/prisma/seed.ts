import { PrismaClient, ProfileVisibility, SubscriptionTier } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER_ID = "a0000000-0000-4000-8000-000000000001";
const DEMO_WALLET_ID = "b0000000-0000-4000-8000-000000000001";
const DEMO_PROFILE_ID = "c0000000-0000-4000-8000-000000000001";

async function main() {
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: "demo@onchain-reputation.local",
      subscriptionTier: SubscriptionTier.free,
    },
  });

  await prisma.wallet.upsert({
    where: { id: DEMO_WALLET_ID },
    update: {},
    create: {
      id: DEMO_WALLET_ID,
      userId: user.id,
      address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
      chainScope: ["eip155:1", "eip155:8453"],
      isPrimary: true,
    },
  });

  await prisma.profile.upsert({
    where: { id: DEMO_PROFILE_ID },
    update: {},
    create: {
      id: DEMO_PROFILE_ID,
      userId: user.id,
      slug: "demo-builder",
      displayName: "Demo Builder",
      visibility: ProfileVisibility.public,
      publicCacheVersion: 1,
    },
  });

  console.log("Seed complete: demo user, wallet, and profile created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
