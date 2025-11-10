import { API_ROUTES } from "@onchain-reputation/shared";
import { apiFetch } from "./client";

export type SubscriptionStatusResponse = {
  plan: "free" | "premium";
  upgradeUrl: string;
};

export async function createCheckoutSession(): Promise<{ url: string; sessionId: string }> {
  return apiFetch(API_ROUTES.billing.checkout, { method: "POST" });
}

export async function createPortalSession(): Promise<{ url: string }> {
  return apiFetch(API_ROUTES.billing.portal, { method: "POST" });
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  return apiFetch(API_ROUTES.billing.subscription);
}
