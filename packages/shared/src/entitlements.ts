export type SubscriptionPlanId = "free" | "premium";

export type SubscriptionStatusId =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing";

export type EntitlementFeature =
  | "multi_wallet"
  | "refresh"
  | "export_pdf"
  | "private_scores"
  | "score_history";

export const ENTITLEMENT_FEATURES: EntitlementFeature[] = [
  "multi_wallet",
  "refresh",
  "export_pdf",
  "private_scores",
  "score_history",
];

const PREMIUM_FEATURES: EntitlementFeature[] = [
  "multi_wallet",
  "refresh",
  "export_pdf",
  "private_scores",
  "score_history",
];

export function planIncludesFeature(
  plan: SubscriptionPlanId,
  feature: EntitlementFeature,
): boolean {
  if (plan === "premium") {
    return PREMIUM_FEATURES.includes(feature);
  }
  return false;
}

export const UPGRADE_PATH = "/pricing";
