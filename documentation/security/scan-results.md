# OWASP / DAST scan results (MVP)

Last scan: _pending counsel review before GA_

Tooling: OWASP ZAP baseline (API), manual Burp spot checks (staging).

## Summary

| Severity | Open | Remediated in 11.2.1 |
|----------|------|----------------------|
| Critical | 0 | — |
| High | 0 | JWT malformed token bypass, missing public slug validation |
| Medium | 1 | Rate limit bypass when Redis unavailable (accepted risk with monitoring) |
| Low | 2 | Swagger UI exposed on staging only |

## Remediations (11.2.1)

1. **JWT auth** — Reject non-JWT-shaped Bearer tokens before verify; block JWT-only access to `/v1/admin/*`.
2. **Public profiles** — Validate slug path param; return 404 for malformed slugs; validate wallet address format on by-wallet route.
3. **Headers** — HSTS preload, CORP, strip `X-Powered-By`, tighten CSP on JSON API.
4. **Rate limits** — `RateLimitGuard` on all public profile routes (existing); document Redis-down fail-open.

## Accepted risks

| ID | Finding | Expiry | Owner |
|----|---------|--------|-------|
| AR-001 | Rate limit skipped if Redis unreachable | 2026-09-01 | Platform |

## Re-scan gate

- [ ] Re-run ZAP against staging after merge
- [ ] No Critical/High open before production deploy
