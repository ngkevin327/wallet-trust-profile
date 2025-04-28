# Contributing

Thank you for contributing to Onchain Reputation. This guide covers local setup, conventions, and how we work on `main`.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ (use `nvm use` with `.nvmrc`) |
| pnpm | 9+ |
| Docker | Latest stable (for Postgres and Redis) |
| Git | 2.40+ |

Optional for infrastructure work:

- Terraform 1.6+
- AWS CLI configured for staging access

## Getting started

```bash
git clone <repository-url>
cd onchain-reputation
pnpm install
cp .env.example .env
docker compose up -d
pnpm dev
```

Verify the API responds at `http://localhost:3001/health`.

## Branch naming

Use descriptive prefixes:

- `feat/` — new functionality
- `fix/` — bug fixes
- `chore/` — tooling, deps, housekeeping
- `docs/` — documentation only
- `infra/` — Terraform or deployment changes
- `ci/` — pipeline changes

Example: `feat/siwe-nonce-validation`

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

Common types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `ci`, `build`, `infra`.

Keep subjects under 72 characters. Put additional context in the PR description, not the subject line.

## Pull requests

1. Branch from latest `main`.
2. Run `pnpm lint`, `pnpm test`, and `pnpm build` locally.
3. Pre-commit hooks run ESLint and Prettier on staged files.
4. Open a PR with a clear summary, test plan, and linked issue when applicable.
5. Require one approving review before merge (two for infra or auth changes).

## Code style

- TypeScript strict mode is required across packages.
- Prefer explicit types on public APIs and shared DTOs.
- Match existing module layout in `apps/api`, `apps/web`, and `apps/worker`.
- No secrets in source control — use `.env` locally and Secrets Manager in deployed environments.

## Testing

- Unit tests live next to source (`*.spec.ts`).
- Run `pnpm test` from the repository root before pushing.
- API e2e tests (`apps/api/test/*.e2e-spec.ts`) expect Postgres and Redis via `docker compose up -d`.
- Reset local DB between e2e runs: `pnpm --filter @onchain-reputation/api db:migrate && db:seed`.

## DAO registry updates

See [documentation/dao-registry-curation.md](documentation/dao-registry-curation.md) for how to add, review, or remove DAOs in `registry-daos.json`. Registry PRs must keep at least 20 active DAOs for launch and should run worker DAO aggregator tests.

## Questions

Open a discussion or ping the platform team channel for architecture decisions before large refactors.
