import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BadRequestException } from "@nestjs/common";

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

let reservedSlugs: Set<string> | null = null;

function loadReservedSlugs(): Set<string> {
  if (!reservedSlugs) {
    const path = join(process.cwd(), "config", "reserved-slugs.txt");
    const lines = readFileSync(path, "utf8")
      .split("\n")
      .map((line) => line.trim().toLowerCase())
      .filter(Boolean);
    reservedSlugs = new Set(lines);
  }
  return reservedSlugs;
}

export function validateSlug(slug: string): string {
  const normalized = slug.toLowerCase().trim();

  if (normalized.length < 3 || normalized.length > 30) {
    throw new BadRequestException("Slug must be between 3 and 30 characters");
  }

  if (!SLUG_PATTERN.test(normalized)) {
    throw new BadRequestException(
      "Slug must match ^[a-z0-9-]{3,30}$ (lowercase alphanumeric and hyphens)",
    );
  }

  if (loadReservedSlugs().has(normalized)) {
    throw new BadRequestException("Slug is reserved");
  }

  return normalized;
}

export function isSlugAvailable(slug: string, currentProfileId?: string): boolean {
  try {
    validateSlug(slug);
    return true;
  } catch {
    return false;
  }
}
