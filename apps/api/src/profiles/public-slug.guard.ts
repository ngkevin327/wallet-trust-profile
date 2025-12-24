import { NotFoundException } from "@nestjs/common";

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export function assertValidPublicSlugParam(slug: string): string {
  const normalized = slug.toLowerCase().trim();
  if (normalized.length < 3 || normalized.length > 30 || !SLUG_PATTERN.test(normalized)) {
    throw new NotFoundException("Profile not found");
  }
  return normalized;
}
