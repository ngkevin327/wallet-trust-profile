# Playwright E2E

## PR CI (deterministic)

- Uses `e2e/helpers/mock-api.ts` to stub `/v1/me/*` and public profile routes.
- Set `NEXT_PUBLIC_TEST_MODE=true` for onboarding tests that skip wallet popups.
- Do **not** add assertion retries for business logic — only increase `expect` timeouts for slow renders.

## Stable selectors

| Flow | Selector |
|------|----------|
| Landing hero | `getByRole('heading', { name: /professional reputation/i })` |
| Dashboard index | `getByText('72')` with mocked profile |
| Score drawer | `getByRole('button', { name: /view full score breakdown/i })` |
| Public profile | `getByRole('heading', { name: /demo builder/i })` |

## Nightly / testnet

Live wallet indexing is covered in `apps/worker/test/e2e-indexing.testnet.spec.ts` (nightly workflow only).
