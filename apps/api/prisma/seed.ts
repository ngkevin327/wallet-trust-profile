import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient, ProfileVisibility, SubscriptionTier } from "@prisma/client";

const prisma = new PrismaClient();

type DaoSeed = {
  slug: string;
  name: string;
  chainId: number;
  treasury: string | null;
  tokenAddress: string | null;
};

type ProtocolSeed = {
  slug: string;
  name: string;
  chainId: number;
  contract: string;
  category: string;
};

async function seedRegistry() {
  const seedsDir = join(__dirname, "seeds");
  const daos = JSON.parse(readFileSync(join(seedsDir, "registry-daos.json"), "utf8")) as DaoSeed[];
  const protocols = JSON.parse(
    readFileSync(join(seedsDir, "registry-protocols.json"), "utf8"),
  ) as ProtocolSeed[];

  for (const dao of daos) {
    await prisma.dao.upsert({
      where: { slug: dao.slug },
      update: { name: dao.name, treasury: dao.treasury, tokenAddress: dao.tokenAddress, active: true },
      create: {
        slug: dao.slug,
        name: dao.name,
        chainId: dao.chainId,
        treasury: dao.treasury,
        tokenAddress: dao.tokenAddress,
        active: true,
      },
    });
  }

  for (const protocol of protocols) {
    await prisma.protocol.upsert({
      where: { slug: protocol.slug },
      update: {
        name: protocol.name,
        contract: protocol.contract,
        category: protocol.category,
        active: true,
      },
      create: {
        slug: protocol.slug,
        name: protocol.name,
        chainId: protocol.chainId,
        contract: protocol.contract,
        category: protocol.category,
        active: true,
      },
    });
  }

  console.log(`Seeded ${daos.length} DAOs and ${protocols.length} protocols`);
}

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

  await seedRegistry();

  console.log("Seed complete: demo user, wallet, profile, and registry created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
