import type { ProfilePublicDto } from "@onchain-reputation/shared";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export const PUBLIC_PROFILE_REVALIDATE = Number(process.env.PUBLIC_PROFILE_REVALIDATE ?? 300);

export type FetchPublicProfileOptions = {
  cacheVersion?: number;
};

async function fetchE2eFixture(slug: string): Promise<ProfilePublicDto | null> {
  if (process.env.E2E_PUBLIC_PROFILE_FIXTURES !== "true") {
    return null;
  }
  if (slug === "private-demo") {
    return null;
  }
  if (slug !== "demo-builder") {
    return null;
  }
  const mod = await import("../../e2e/fixtures/profile-public.json");
  return mod.default as ProfilePublicDto;
}

export async function fetchPublicProfile(
  slug: string,
  options?: FetchPublicProfileOptions,
): Promise<ProfilePublicDto | null> {
  const fixture = await fetchE2eFixture(slug);
  if (fixture) {
    return fixture;
  }

  const tags = [`profile:public:${slug}`];
  if (options?.cacheVersion != null) {
    tags.push(`profile:public:${slug}:v${options.cacheVersion}`);
  }

  const res = await fetch(`${API_BASE}/v1/profiles/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
    next: {
      revalidate: PUBLIC_PROFILE_REVALIDATE,
      tags,
    },
  });

  if (!res.ok) {
    return null;
  }

  return res.json() as Promise<ProfilePublicDto>;
}
