const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export function normalizePublicSlug(slug: string): string {
  return slug.toLowerCase().trim();
}

export function isValidPublicSlug(slug: string): boolean {
  const normalized = slug.toLowerCase().trim();
  if (normalized.length < 3 || normalized.length > 30) {
    return false;
  }
  return SLUG_PATTERN.test(normalized);
}
