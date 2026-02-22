# MVP gap report (local validation)

**Date:** 2026-05-21  
**Branch:** `main` (post local-dev commits)  
**References:** PRD §19 (`docs/02-product-requirements-document.md`), `documentation/launch/mvp-checklist.md`, `docs/05-mvp-implementation-plan.md`

## Summary

| Area                            | Status                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------ |
| Deterministic local setup       | **Pass** — `pnpm setup:local`                                                  |
| API + Web + Worker dev stack    | **Pass** — after env/module fixes                                              |
| Smoke verification              | **Pass** — `pnpm verify:local` (7/7)                                           |
| PRD §19 acceptance (local)      | **Partial** — mock profile works; live wallet/indexing/stripe need credentials |
| Launch checklist (staging/prod) | **Fail / not tested** — infra, load, legal sign-off                            |

## PRD §19 acceptance matrix

| Criterion                                          | Status                 | Evidence                                                                                             | Missing pieces                                                                         | Recommended next action                                                                           |
| -------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| User can connect wallet and see profile within SLA | **partial**            | SIWE + auth modules present; `pnpm dev` does not validate wallet UI without WalletConnect project id | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, live RPC indexing, profile projection pipeline | Configure WalletConnect; run testnet wallet e2e (`apps/worker/test/e2e-indexing.testnet.spec.ts`) |
| Public profile shareable, loads &lt; 2s P95        | **pass** (local)       | `pnpm verify:local` — API + `/u/demo-builder` HTTP 200; mock index 72                                | CDN/CloudFront, staging load test                                                      | Run k6 against staging (`tests/load/public-profile.k6.js`)                                        |
| Scores explainable with breakdown UI               | **partial**            | Mock profile includes dimensions; dashboard e2e failed locally (8/8) without CI webServer fixtures   | Stable Playwright + API mock routes                                                    | Fix e2e: run without `CI=true`, ensure `E2E_PUBLIC_PROFILE_FIXTURES`                              |
| 10+ badges live; 20+ DAOs in registry              | **pass**               | `config/badges/v1.yaml` has 12 badges; seed has 22 DAOs                                              | Production registry curation process                                                   | Ops: weekly registry review per `documentation/dao-registry-curation.md`                          |
| Premium gating functional                          | **partial**            | Stripe modules, entitlements guard, billing routes exist                                             | `STRIPE_*` secrets, webhook tunnel, e2e checkout                                       | Stripe test mode keys + webhook smoke on staging                                                  |
| Export verifiable per spec                         | **partial**            | `GET /v1/verify/:exportId`, `EXPORT_SIGNING_SECRET`, docs in `documentation/export-verification.md`  | End-to-end export + third-party verify test                                            | Manual export flow with premium test user                                                         |
| Security review; no critical vulns                 | **not-tested** (local) | `documentation/security/scan-results.md` template exists                                             | OWASP/DAST on staging, `pnpm audit` clean                                              | Run audit workflow; attach scan to checklist                                                      |
| Observability and runbooks in place                | **partial**            | Runbooks under `documentation/runbooks/`; OTel deps in API/worker                                    | Dashboards imported, alerts routed                                                     | Import `infra/dashboards/*.json`; wire PagerDuty                                                  |

## Launch checklist highlights

| Checklist item                    | Status                  | Notes                                               |
| --------------------------------- | ----------------------- | --------------------------------------------------- |
| Playwright e2e green in PR CI     | **fail** (local run)    | 8 failed with `CI=true` (no webServer env fixtures) |
| Nightly testnet indexing ×2       | **not-tested**          | Requires RPC secrets in CI                          |
| k6 500 VU gate                    | **not-tested**          | Staging-only workflow                               |
| Premium Stripe → PDF export       | **not-tested**          | Needs Stripe test keys                              |
| Terraform prod / DNS / CloudFront | **not-tested**          | Infra code present                                  |
| Legal pages live                  | **pass** (routes exist) | `/legal/privacy`, `/legal/terms` placeholders       |

## What works locally now

- Docker Postgres + Redis
- DB migrations (12) + seed (`demo-builder` profile)
- API: `/health`, `/ready`, `/v1/profiles/demo-builder` (mock mode)
- Web: landing + public profile page for demo slug
- Worker: starts, loads repo-root scoring/badge YAML, indexer consumer running
- Worker unit tests: 20 passed, 2 skipped

## Blockers for full MVP (need external input)

1. **WalletConnect project ID** — public connect UX
2. **Alchemy / RPC URLs** — real indexing on Ethereum + Base
3. **Stripe test/prod keys** — premium checkout and webhooks
4. **Staging environment** — PRD §19 and checklist items marked “on staging”

## Reproduce verification

```bash
pnpm setup:local
pnpm dev
# separate terminal:
pnpm verify:local
pnpm --filter @onchain-reputation/worker test
```

Last smoke output: `documentation/launch/local-verification-last.json`
