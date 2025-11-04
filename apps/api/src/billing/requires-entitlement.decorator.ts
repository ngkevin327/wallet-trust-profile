import { SetMetadata } from "@nestjs/common";
import type { EntitlementFeature } from "@onchain-reputation/shared";

export const ENTITLEMENT_KEY = "entitlement";

export const RequiresEntitlement = (feature: EntitlementFeature) =>
  SetMetadata(ENTITLEMENT_KEY, feature);
