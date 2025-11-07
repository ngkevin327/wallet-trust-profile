import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { EntitlementFeature } from "@onchain-reputation/shared";
import { EntitlementsGuard } from "../src/billing/entitlements.guard";
import { EntitlementsService } from "../src/billing/entitlements.service";
import { PaymentRequiredException } from "../src/billing/payment-required.exception";

describe("EntitlementsGuard", () => {
  const reflector = new Reflector();
  let entitlements: jest.Mocked<Pick<EntitlementsService, "assertEntitlement">>;
  let guard: EntitlementsGuard;

  const features: EntitlementFeature[] = [
    "multi_wallet",
    "refresh",
    "export_pdf",
    "private_scores",
    "score_history",
  ];

  beforeEach(() => {
    entitlements = {
      assertEntitlement: jest.fn(),
    };
    guard = new EntitlementsGuard(reflector, entitlements as unknown as EntitlementsService);
  });

  function contextFor(feature?: EntitlementFeature, userId = "user-1"): ExecutionContext {
    return {
      getHandler: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: userId ? { sub: userId } : undefined }),
      }),
    } as unknown as ExecutionContext;
  }

  it("allows when no entitlement metadata", async () => {
    jest.spyOn(reflector, "get").mockReturnValue(undefined);
    await expect(guard.canActivate(contextFor())).resolves.toBe(true);
    expect(entitlements.assertEntitlement).not.toHaveBeenCalled();
  });

  it.each(features)("asserts entitlement for %s", async (feature) => {
    jest.spyOn(reflector, "get").mockReturnValue(feature);
    entitlements.assertEntitlement.mockResolvedValue(undefined);
    await expect(guard.canActivate(contextFor(feature))).resolves.toBe(true);
    expect(entitlements.assertEntitlement).toHaveBeenCalledWith("user-1", feature);
  });

  it("propagates 402 when entitlement missing", async () => {
    jest.spyOn(reflector, "get").mockReturnValue("export_pdf" satisfies EntitlementFeature);
    entitlements.assertEntitlement.mockRejectedValue(new PaymentRequiredException("export_pdf"));
    await expect(guard.canActivate(contextFor("export_pdf"))).rejects.toBeInstanceOf(
      PaymentRequiredException,
    );
  });
});

describe("EntitlementsService plan matrix", () => {
  it("free plan excludes premium features", async () => {
    const { planIncludesFeature } = await import("@onchain-reputation/shared");
    for (const feature of features) {
      expect(planIncludesFeature("free", feature)).toBe(false);
    }
  });

  it("premium plan includes all features", async () => {
    const { planIncludesFeature } = await import("@onchain-reputation/shared");
    for (const feature of features) {
      expect(planIncludesFeature("premium", feature)).toBe(true);
    }
  });
});
