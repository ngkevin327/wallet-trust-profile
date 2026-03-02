# Local development runbook

Target: a new engineer can install, run, and verify the product locally in **under 30 minutes**.

## Prerequisites

| Tool                | Version        | Required               |
| ------------------- | -------------- | ---------------------- |
| Node.js             | 20+ (`.nvmrc`) | Yes                    |
| pnpm                | 9+             | Yes                    |
| Docker Desktop      | Latest stable  | Yes (Postgres + Redis) |
| Git                 | 2.40+          | Yes                    |
| k6                  | Latest         | No (load tests only)   |
| Playwright browsers | Chromium       | No (e2e only)          |

## Quick start (< 15 min)

```bash
git clone <repository-url>
cd onchain-reputation
pnpm setup:local    # .env, JWT keys, Docker, migrate, seed
pnpm dev            # API :3001, Web :3000, Worker (loads root .env)
pnpm verify:local   # smoke checks (run in a second terminal while dev is up)
```

### Expected URLs

| Service               | URL                                                            |
| --------------------- | -------------------------------------------------------------- |
| Web (marketing + app) | http://localhost:3000                                          |
| Public demo profile   | http://localhost:3000/u/demo-builder                           |
| API health            | http://localhost:3001/health                                   |
| API ready             | http://localhost:3001/ready                                    |
| API Swagger           | http://localhost:3001/v1/docs                                  |
| Demo public API       | http://localhost:3001/v1/profiles/demo-builder                 |
| Adminer (optional)    | http://localhost:8080 (`docker compose --profile tools up -d`) |

## Environment variables

### Required (local)

| Variable          | Example                                                        | Purpose                |
| ----------------- | -------------------------------------------------------------- | ---------------------- |
| `DATABASE_URL`    | `postgresql://reputation:reputation@localhost:5432/reputation` | Prisma / API / worker  |
| `REDIS_URL`       | `redis://localhost:6379`                                       | Queues and cache       |
| `JWT_ISSUER`      | `onchain-reputation`                                           | Access token issuer    |
| `JWT_AUDIENCE`    | `onchain-reputation-api`                                       | Access token audience  |
| `JWT_PRIVATE_KEY` | (PEM, auto-generated)                                          | Sign SIWE session JWTs |
| `JWT_PUBLIC_KEY`  | (PEM, auto-generated)                                          | Verify JWTs            |

`pnpm setup:local` copies `.env.example` → `.env` and generates JWT keys if missing.

### Required for realistic indexing (optional locally)

| Variable                                | Purpose                 |
| --------------------------------------- | ----------------------- |
| `ALCHEMY_API_KEY` or `RPC_URL_ETHEREUM` | Mainnet RPC for indexer |
| `RPC_URL_BASE`                          | Base L2 RPC for indexer |

Without RPC keys the **worker starts** but onchain indexing jobs will not fetch chain data.

### Optional (features / integrations)

| Variable                               | Default (local)           | Purpose                             |
| -------------------------------------- | ------------------------- | ----------------------------------- |
| `API_MOCK_MODE`                        | `true` in `.env.example`  | Mock public profile payloads in dev |
| `PORT`                                 | `3001`                    | API listen port                     |
| `NEXT_PUBLIC_API_URL`                  | `http://localhost:3001`   | Web → API                           |
| `NEXT_PUBLIC_TEST_MODE`                | unset                     | Skip wallet UI in Playwright        |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | empty                     | WalletConnect (connect flow)        |
| `STRIPE_SECRET_KEY`                    | empty                     | Premium checkout                    |
| `STRIPE_WEBHOOK_SECRET`                | empty                     | Billing webhooks                    |
| `STRIPE_PREMIUM_PRICE_ID`              | empty                     | Premium SKU                         |
| `EXPORT_SIGNING_SECRET`                | dev default in code       | Export HMAC verification            |
| `ADMIN_API_KEY`                        | `dev-admin-key-change-me` | Admin API routes                    |
| `RATE_LIMIT_ANONYMOUS_PER_MIN`         | `60`                      | Anonymous rate limit                |
| `REPO_ROOT`                            | set by `pnpm dev`         | Worker config path resolution       |

## How to verify working local product

Use this checklist after `pnpm dev` is running:

- [ ] `pnpm verify:local` exits 0 (all seven checks pass)
- [ ] Open http://localhost:3000 — landing page loads
- [ ] Open http://localhost:3000/u/demo-builder — heading “Demo Builder”, reputation index visible
- [ ] `curl -s http://localhost:3001/health` returns `"status":"ok"`
- [ ] `curl -s http://localhost:3001/v1/profiles/demo-builder` returns JSON with `"slug":"demo-builder"`
- [ ] Docker: `onchain-reputation-postgres` and `onchain-reputation-redis` containers healthy
- [ ] Worker log shows `indexer consumer started` (no badge/scoring config ENOENT)

### Automated tests (optional, +10 min)

```bash
# Worker unit tests (no RPC required)
pnpm --filter @onchain-reputation/worker test

# Playwright e2e (start dev first; do not set CI=1 locally)
cd apps/web
pnpm exec playwright install chromium
pnpm test:e2e
```

Playwright uses `E2E_PUBLIC_PROFILE_FIXTURES=true` via `playwright.config.ts` when not in CI.

### Reset database

```bash
docker compose down -v
pnpm setup:local
```

## Troubleshooting

| Symptom                                      | Fix                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| `DATABASE_URL` not found during migrate      | Re-run `pnpm setup:local` (loads `.env` for Prisma)                               |
| Port 3000/3001 in use                        | Stop other Node processes; `Get-NetTCPConnection -LocalPort 3000,3001` on Windows |
| API Nest module / circular dependency errors | Pull latest; ensure `pnpm dev` uses `scripts/dev-local.mjs`                       |
| Worker `config/badges/v1.yaml` ENOENT        | Run `pnpm dev` from repo root (sets `REPO_ROOT`)                                  |
| Public profile 404 on web                    | Confirm API is up and `API_MOCK_MODE=true`                                        |
| Worker indexing idle                         | Expected without `ALCHEMY_API_KEY` / RPC URLs                                     |

## Related docs

- Product PRD acceptance criteria: `temp/docs/02-product-requirements-document.md` §19 (local copy, not in repo)
- MVP launch checklist: `documentation/launch/mvp-checklist.md`
- MVP gap report and local validation notes: `temp/launch/mvp-gap-report.md`, `temp/launch/mvp-local-validation-report.md` (local, not in repo)
