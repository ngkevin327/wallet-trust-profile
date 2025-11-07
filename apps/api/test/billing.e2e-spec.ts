import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { EntitlementsService } from "../src/billing/entitlements.service";
import { PaymentRequiredException } from "../src/billing/payment-required.exception";

describe("Billing entitlements (e2e)", () => {
  let entitlements: EntitlementsService;

  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ?? "postgresql://reputation:reputation@localhost:5432/reputation";
    process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
    process.env.JWT_ISSUER = "test";
    process.env.JWT_AUDIENCE = "test";
    process.env.NODE_ENV = "test";
    process.env.SKIP_DB_CONNECT = "true";

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    entitlements = moduleRef.get(EntitlementsService);
  });

  it("free plan blocks export_pdf with upgrade path", async () => {
    jest.spyOn(entitlements, "getEffectivePlan").mockResolvedValue("free");
    try {
      await entitlements.assertEntitlement("user-free", "export_pdf");
      fail("expected PaymentRequiredException");
    } catch (err) {
      expect(err).toBeInstanceOf(PaymentRequiredException);
      const response = (err as PaymentRequiredException).getResponse() as {
        feature: string;
        upgradeUrl: string;
      };
      expect(response.feature).toBe("export_pdf");
      expect(response.upgradeUrl).toBe("/pricing");
    }
  });

  it("premium plan allows score_history", async () => {
    jest.spyOn(entitlements, "getEffectivePlan").mockResolvedValue("premium");
    await expect(
      entitlements.assertEntitlement("user-premium", "score_history"),
    ).resolves.toBeUndefined();
  });

  it("expired subscription resolves to free", async () => {
    jest.spyOn(entitlements, "getEffectivePlan").mockResolvedValue("free");
    await expect(entitlements.hasEntitlement("user-expired", "refresh")).resolves.toBe(false);
  });
});
