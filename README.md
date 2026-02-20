# Onchain Reputation

Professional reputation profiles built from verifiable wallet activity — contribution history, governance participation, payment reliability, and shareable trust signals for DAO contributors, freelancers, and Web3 builders.

## Target users

- **Contributors & freelancers** who need portable, provable onchain credibility
- **DAO operators & recruiters** who evaluate wallets without manual explorer digging
- **Integrators** (post-MVP) consuming reputation via API

## Architecture overview

Monorepo with three deployable applications and shared libraries:

| Component | Path              | Role                                                 |
| --------- | ----------------- | ---------------------------------------------------- |
| Web       | `apps/web`        | Next.js App Router — marketing, onboarding, profiles |
| API       | `apps/api`        | NestJS REST API — auth, profiles, exports            |
| Worker    | `apps/worker`     | Background indexer and scoring jobs                  |
| Shared    | `packages/shared` | Types, constants, API route definitions              |

Async indexing uses Redis queues; PostgreSQL is the system of record. Staging and production run on AWS (ECS, RDS, ElastiCache) with infrastructure defined in `infra/terraform`.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Web App    │────▶│  API Service │────▶│   PostgreSQL    │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                    ┌──────▼───────┐     ┌─────────────────┐
                    │ Redis Queue  │────▶│ Indexer Workers │
                    └──────────────┘     └─────────────────┘
```

## Requirements

- **Node.js** 20+ (see `.nvmrc`)
- **pnpm** 9+
- **Docker** (optional, for local Postgres and Redis)

## Local development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit conventions, and PR expectations.

```bash
# One-command first-time setup (deps, .env, JWT keys, Docker, migrate, seed)
pnpm setup:local

# Run all apps in development mode
pnpm dev

# Smoke-check health endpoints and demo profile (API must be running for full pass)
pnpm verify:local
```

See [documentation/runbooks/local-dev.md](./documentation/runbooks/local-dev.md) for the full runbook, env var reference, and verification checklist.

API health: `http://localhost:3001/health`  
Web: `http://localhost:3000`

## Build and test

```bash
pnpm lint
pnpm test
pnpm build
```

## Deployment

- **Staging:** merges to `main` trigger GitHub Actions — lint, test, build, deploy API/worker to ECS and web to staging hosting.
- **Production:** tagged releases with manual approval (see runbooks in ops docs).

Secrets (RPC keys, JWT signing keys) live in AWS Secrets Manager; never commit `.env` files.

## Repository layout

```
apps/
  api/          NestJS API
  web/          Next.js frontend
  worker/       Indexer worker
packages/
  config/       Shared TS, ESLint, Prettier
  shared/       Cross-app types and constants
infra/
  terraform/    AWS infrastructure
```

## License

Proprietary — all rights reserved.
