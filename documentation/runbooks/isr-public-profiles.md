# ISR for public profiles (`/u/[slug]`)

## Configuration

- Next.js route: `export const revalidate = 300` on `apps/web/app/u/[slug]/page.tsx`
- Fetch helper: `apps/web/lib/api/public-profile.ts` uses `next.revalidate` and cache tags `profile:public:{slug}`
- API Redis TTL: `CACHE_TTL_SECONDS=600` (default)
- CDN: see `documentation/cloudfront-cache.md`

## Version bumps

When `public_cache_version` increments on the API, ISR pages refresh within the revalidate window. Optional on-demand revalidation can target tags `profile:public:{slug}:v{n}`.

## Staging

Set `PUBLIC_PROFILE_REVALIDATE=60` for faster refresh during demos.
