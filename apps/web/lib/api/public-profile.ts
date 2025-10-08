import type { ProfilePublicDto } from "@onchain-reputation/shared";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export const PUBLIC_PROFILE_REVALIDATE = Number(process.env.PUBLIC_PROFILE_REVALIDATE ?? 300);

export async function fetchPublicProfile(slug: string): Promise<ProfilePublicDto | null> {
  const res = await fetch(`${API_BASE}/v1/profiles/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
    next: {
      revalidate: PUBLIC_PROFILE_REVALIDATE,
      tags: [`profile:public:${slug}`],
    },
  });

  if (!res.ok) {
    return null;
  }

  return res.json() as Promise<ProfilePublicDto>;
}
