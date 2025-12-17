# Load tests (k6)

Public profile read path load validation before production launch.

## Prerequisites

- [k6](https://k6.io/docs/get-started/installation/) installed locally
- Staging API reachable with seeded public slug `demo-builder` (or set `PUBLIC_PROFILE_SLUG`)

## Run locally

```bash
k6 run tests/load/public-profile.k6.js \
  -e API_BASE_URL=https://api.staging.example/v1 \
  -e PUBLIC_PROFILE_SLUG=demo-builder
```

## Scenarios

1. **cache_warm** — 10 VUs for 30s to populate CDN/API cache
2. **ramp_load** — ramp to 500 VUs over 7 minutes

## Pass criteria (MVP gate)

- `http_req_failed` rate < 1%
- `http_req_duration` p95 < 2000ms

Results are written to `summary.json` for attachment to the launch checklist.

## CI

See `.github/workflows/load-staging.yml` (manual `workflow_dispatch` against staging).
