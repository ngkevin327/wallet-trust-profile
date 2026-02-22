# MVP Local Validation Report

| Field          | Value                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Date**       | 2026-05-21                                                                                                                          |
| **Repository** | `onchain-reputation` (workspace: `d:\Projects\Fake Git\real 5`)                                                                     |
| **Branch**     | `main`                                                                                                                              |
| **Validator**  | Cursor agent (end-to-end local MVP prep)                                                                                            |
| **References** | PRD §19 (`docs/02-product-requirements-document.md`), `documentation/launch/mvp-checklist.md`, `docs/05-mvp-implementation-plan.md` |

---

## Executive summary

This report documents a full **local MVP validation run**: deterministic setup, service startup, smoke verification, gap analysis against PRD §19, and documentation for new developers.

**Outcome:** The product runs locally with a working demo path (API + Web + Worker + Postgres + Redis). **Local MVP validation is a partial pass** — core public profile and health checks succeed in mock/dev mode. **Production MVP launch is not ready** without staging credentials, green CI e2e, load/security gates, and Stripe/RPC configuration.

| Area                            | Result                  |
| ------------------------------- | ----------------------- |
| Deterministic first-run setup   | Pass                    |
| API + Web + Worker dev stack    | Pass (after fixes)      |
| `pnpm verify:local` (7 checks)  | Pass                    |
| PRD §19 (full acceptance)       | Partial                 |
| Launch checklist (staging/prod) | Not tested / incomplete |

---

## 1. Work performed

### Phase A — Baseline and setup

- Inspected repo state, `README.md`, `CONTRIBUTING.md`, `docker-compose.yml`, `.env.example`, and planning docs in `docs/` (gitignored locally).
- Added **idempotent** first-run automation:
  - `scripts/setup-local.mjs` — tools check, `.env` copy, JWT key generation, Docker up, `pnpm install`, Prisma generate/migrate/seed.
  - `scripts/verify-local.mjs` — smoke checks for infra, API health, demo public profile (API + Web).
  - Root scripts: `pnpm setup:local`, `pnpm verify:local`.
  - `pnpm-lock.yaml` for reproducible installs.
  - Root `eslint.config.mjs` so pre-commit lint passes on `scripts/*.mjs`.
- Updated `README.md` and `.env.example` to point at setup/verify flow.

### Phase B — Run locally

- Started dependencies: `docker compose up -d` (Postgres 15, Redis 7).
- Fixed blockers preventing a runnable stack:
  - **Env loading:** `pnpm dev` did not load root `.env` → added `scripts/dev-local.mjs` + `scripts/lib/load-env.mjs`; Prisma migrate/seed now receive env from setup script.
  - **Worker config paths:** Badge/scoring YAML live at repo `config/` but worker used `process.cwd()` under `apps/worker` → `apps/worker/src/lib/repo-root.ts` + `REPO_ROOT` in dev.
  - **API compile/runtime:** TypeScript fixes (JwtAuthGuard import, Stripe API version, `TooManyRequestsException` → `HttpException`, entitlements `IndexerOrchestrator` injection, `assertPublicReadable` type guard).
  - **Nest module cycles:** `forwardRef` between Auth ↔ Wallets ↔ Profiles ↔ Billing; `AuthModule` imported where `JwtAuthGuard` is used (Billing, Scores, Exports, Profiles).
  - **Billing module:** Registered `StripeWebhookController` and `StripeWebhookService`.
- Confirmed running services and endpoints (see §3).

### Phase C — Working product verification

| Check                               | Result | Evidence                                                               |
| ----------------------------------- | ------ | ---------------------------------------------------------------------- |
| Postgres / Redis containers         | Pass   | Docker health                                                          |
| API `GET /health`                   | Pass   | HTTP 200, `status: ok`                                                 |
| API `GET /ready`                    | Pass   | HTTP 200                                                               |
| API `GET /v1/profiles/demo-builder` | Pass   | `slug=demo-builder`, `reputationIndex=72` (mock mode)                  |
| Web `GET /u/demo-builder`           | Pass   | HTTP 200, page contains demo content                                   |
| Worker unit tests                   | Pass   | 20 passed, 2 skipped (`pnpm --filter @onchain-reputation/worker test`) |
| API unit tests                      | N/A    | No unit specs (`test:unit` passWithNoTests)                            |
| Playwright e2e                      | Fail   | 8/8 failed when run with `CI=true` (webServer/fixtures disabled)       |

Automated smoke artifact: `documentation/launch/local-verification-last.json` (2026-05-21T07:50:22Z, 7/7 passed).

### Phase D — MVP gap analysis

- Compared implementation to **PRD §19** acceptance criteria and `documentation/launch/mvp-checklist.md`.
- Produced matrix: `documentation/launch/mvp-gap-report.md`.

### Phase E — Documentation

- **Runbook:** `documentation/runbooks/local-dev.md` — prerequisites, env vars (required vs optional), &lt;30 min quick start, verification checklist, troubleshooting.
- **CONTRIBUTING.md** — link to local runbook.
- **This report** — single consolidated record of the validation run.

---

## 2. Local run status (what runs now)

| Component                 | Port / URL                                     | Status                                  |
| ------------------------- | ---------------------------------------------- | --------------------------------------- |
| PostgreSQL                | `localhost:5432`                               | Running (`onchain-reputation-postgres`) |
| Redis                     | `localhost:6379`                               | Running (`onchain-reputation-redis`)    |
| API                       | http://localhost:3001                          | Running                                 |
| Web                       | http://localhost:3000                          | Running                                 |
| Worker                    | (background)                                   | Running — indexer consumer started      |
| Demo public profile (web) | http://localhost:3000/u/demo-builder           | Available                               |
| Demo public profile (API) | http://localhost:3001/v1/profiles/demo-builder | Available (mock mode)                   |
| API Swagger               | http://localhost:3001/v1/docs                  | Available when API is up                |

**Seed data:** 12 migrations applied; seed includes `demo-builder` profile, 22 DAOs, 20 protocols, denylist, risk labels.

**Dev mode notes:**

- `API_MOCK_MODE=true` in `.env.example` — public profile API returns mock projection in development.
- Worker indexing requires `ALCHEMY_API_KEY` or `RPC_URL_ETHEREUM` / `RPC_URL_BASE` (optional for local smoke).

---

## 3. MVP readiness status

### PRD §19 (Release acceptance) — summary

| Criterion                             | Status                                                             |
| ------------------------------------- | ------------------------------------------------------------------ |
| Connect wallet → profile within SLA   | Partial — code present; not verified with live WalletConnect + RPC |
| Public profile shareable, &lt; 2s P95 | Pass locally; not load-tested                                      |
| Explainable scores + breakdown UI     | Partial — mock data works; dashboard e2e failed                    |
| 10+ badges; 20+ DAOs                  | Pass — 12 badges in `config/badges/v1.yaml`, 22 DAOs in seed       |
| Premium gating                        | Partial — Stripe modules exist; no test keys configured            |
| Export verifiable                     | Partial — verify endpoint documented; not e2e tested               |
| Security review                       | Not tested locally                                                 |
| Observability + runbooks              | Partial — runbooks exist; dashboards/alerts not validated          |

**Verdict:** Suitable for **local demo and engineering onboarding**. **Not** ready for `v1.0.0-mvp` tag without staging validation per `documentation/launch/mvp-checklist.md`.

Detail: `documentation/launch/mvp-gap-report.md`.

---

## 4. What is still missing

### Credentials / external services

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — wallet connect UX
- `ALCHEMY_API_KEY` or `RPC_URL_ETHEREUM` / `RPC_URL_BASE` — onchain indexing
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PREMIUM_PRICE_ID` — premium billing

### QA / CI / staging

- Playwright e2e green in PR CI (8 failures observed locally with `CI=true`)
- Nightly testnet indexing (2× consecutive)
- k6 load test (500 VU, p95 &lt; 2s, error &lt; 1%) on staging
- OWASP / `pnpm audit` gate
- Staging deploy smoke tests

### Infrastructure / launch

- Terraform prod sign-off, DNS, CloudFront, production Stripe webhook
- Launch war-room checklist sign-off (`documentation/launch/mvp-checklist.md`)

---

## 5. Commands to reproduce

```bash
# Prerequisites: Node 20+, pnpm 9+, Docker

cd onchain-reputation   # or: d:\Projects\Fake Git\real 5

# One-time / reset setup
pnpm setup:local

# Start all apps (loads .env from repo root)
pnpm dev

# In a second terminal — smoke verification
pnpm verify:local

# Optional: worker tests
pnpm --filter @onchain-reputation/worker test

# Optional: Playwright (do not set CI=1 locally)
cd apps/web
pnpm exec playwright install chromium
pnpm test:e2e
```

### Manual curls

```bash
curl -s http://localhost:3001/health
curl -s http://localhost:3001/v1/profiles/demo-builder
```

### Reset database

```bash
docker compose down -v
pnpm setup:local
```

---

## 6. Commits (validation run)

| Hash      | Message                                                   | Purpose                                         | Verified                                 |
| --------- | --------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- |
| `5b84892` | `chore: add deterministic local setup and verify scripts` | `setup:local`, `verify:local`, lockfile, README | Setup completes; migrate + seed          |
| `45541d3` | `fix: load root env in dev and repair Nest module wiring` | `dev-local.mjs`, Nest/worker fixes              | API health + demo profile; worker starts |
| `c730589` | `docs: add local smoke verification evidence`             | `local-verification-last.json`                  | 7/7 verify checks                        |
| `991015c` | `docs: add MVP gap analysis from local validation`        | Gap matrix + `local-dev.md` runbook             | Documentation review                     |

**Not pushed** to remote (per instructions).

---

## 7. Issues found and fixed during the run

| Issue                                                      | Resolution                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Prisma `DATABASE_URL` missing during `setup:local` migrate | Load `.env` into child process env in `setup-local.mjs`                 |
| `pnpm dev` did not load `.env`                             | `scripts/dev-local.mjs` spreads root env to all workspace dev processes |
| Worker ENOENT for `config/badges/v1.yaml`                  | `resolveRepoRoot()` + `REPO_ROOT`                                       |
| API TS compile errors (Jwt, Stripe, exports, profiles)     | Targeted code fixes in `apps/api`                                       |
| Nest circular modules (Auth/Wallets/Profiles/Billing)      | `forwardRef()` + `AuthModule` imports on guarded modules                |
| `JwtAuthGuard` not in BillingModule context                | Import `AuthModule` in Billing, Scores, Exports, Profiles               |
| Port 3000/3001 conflicts                                   | Kill stale Node processes before restart                                |
| Playwright 8/8 fail with `CI=true`                         | Documented; run locally without `CI` for fixture webServer              |

---

## 8. Related artifacts

| File                                                | Description                                 |
| --------------------------------------------------- | ------------------------------------------- |
| `documentation/launch/local-verification-last.json` | Machine-readable last smoke run             |
| `documentation/launch/mvp-gap-report.md`            | PRD §19 + checklist gap matrix              |
| `documentation/runbooks/local-dev.md`               | Ongoing local dev / verify guide            |
| `documentation/launch/mvp-checklist.md`             | Production launch checklist                 |
| `docs/02-product-requirements-document.md`          | PRD (local, gitignored)                     |
| `docs/05-mvp-implementation-plan.md`                | MVP implementation plan (local, gitignored) |

---

## 10. UI assessment (2026-05-21 update)

| Question                     | Answer                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does the product contain UI? | **Yes** — Next.js 14 app (`apps/web`): landing, public profiles (`/u/[slug]`), dashboard, settings, pricing, legal pages.                                           |
| Was it attractive before?    | **Functional only** — generic blue/slate Tailwind, system fonts, minimal layout.                                                                                    |
| MVP UI upgrade               | **Yes** — indigo/cyan brand system, Plus Jakarta Sans + Inter, mesh hero, demo profile preview, score ring component, polished public profile and dashboard chrome. |

See commits with `feat(web):` prefix for the visual refresh.

---

## 9. Recommended next steps

1. Add WalletConnect + RPC secrets to `.env` and verify connect → index → profile (non-mock).
2. Fix or document Playwright CI vs local (`CI` flag and `E2E_PUBLIC_PROFILE_FIXTURES`).
3. Run full `pnpm test` + `pnpm build` at repo root; address any remaining API unit/e2e gaps.
4. Execute staging checklist: k6, Stripe test mode, OWASP, deploy smoke.
5. Track launch checklist in `documentation/launch/mvp-checklist.md` with owners and dates.

---

_End of report_
