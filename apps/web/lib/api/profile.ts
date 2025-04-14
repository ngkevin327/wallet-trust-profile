import { API_ROUTES } from "@onchain-reputation/shared";
import { apiFetch } from "./client";

export type UpdateProfilePayload = {
  displayName?: string;
  slug?: string;
  visibility?: "public" | "private";
};

export function updateProfile(payload: UpdateProfilePayload) {
  return apiFetch(API_ROUTES.me.profile, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function checkSlugAvailability(slug: string) {
  return apiFetch<{ available: boolean; slug: string }>(API_ROUTES.me.slugCheck(slug));
}
