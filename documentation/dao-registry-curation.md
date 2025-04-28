# DAO Registry Curation Process

## Launch requirement

MVP requires **at least 20 active DAOs** in `apps/api/prisma/seeds/registry-daos.json` before production launch. Weekly reviews ensure treasury addresses stay current.

## Adding a DAO

1. Verify treasury and token contract addresses on-chain (Etherscan/Basescan).
2. Add entry to `registry-daos.json` with `slug`, `name`, `chainId`, `treasury`, `tokenAddress`.
3. Open a PR; CI runs worker DAO aggregator fixture tests.
4. Deploy API seed (`pnpm --filter @onchain-reputation/api db:seed`) in staging.

## Review criteria

- DAO has documented governance or grants program.
- Treasury address is official (website, forum, or verified social).
- No duplicate slug; slug matches `^[a-z0-9-]{3,30}$`.

## Removal

Set `active: false` via seed update (soft delete). Re-index affected wallets on next cron or premium refresh.

## Community requests (post-MVP)

Track requests in support tooling; SLA target 5 business days for vetted additions after admin UI ships.
