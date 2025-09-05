# CloudFront cache rules (public profiles)

## Origin

- API: `GET /v1/profiles/{slug}` — materialized projection JSON
- Web: `GET /u/{slug}` — SSR/ISR public profile page (Stage 8)

## Cache key versioning

Include `public_cache_version` in cache keys so CDN invalidates when owners PATCH profile or worker reindexes:

- **API Redis:** `profile:public:{slug}:v{version}`
- **CloudFront:** custom cache policy query/header `X-Profile-Cache-Version` or path suffix `/v{version}` on BFF routes

## Recommended behaviors

| Route | TTL | Invalidate on |
|-------|-----|----------------|
| `/v1/profiles/:slug` | 600s | `profile.indexed` event, owner PATCH |
| `/u/:slug` (web) | 300s ISR | Same version bump |

## Private profiles

Do not cache `404` responses for private slugs at CDN edge (short TTL 0s or bypass cache). API never writes Redis keys for `visibility=private`.

## Staging vs production

Set `CACHE_TTL_SECONDS=600` on API ECS tasks. Tune CloudFront `minTTL` / `maxTTL` to match in `infra/terraform` distribution module when enabled.
