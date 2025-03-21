# Support Playbook (MVP)

## Trust signal disputes

1. Confirm the user owns the profile (SIWE session or wallet proof).
2. Look up the signal `code` in `risk_labels` or heuristic documentation (`documentation/trust-signals.md`).
3. Query `transaction_facts` for the wallet around the reported date.
4. If the match is a false positive, deactivate or correct the registry entry and enqueue a re-index.
5. Reply with outcome: upheld, removed after re-index, or insufficient evidence.

## Score breakdown questions

- Point owners to `GET /v1/me/profile/score-breakdown`.
- Compare `inputs_hash` across snapshots if the user claims a score changed without on-chain activity.
- Reference `documentation/scoring-methodology.md` for dimension weights and badge thresholds.

## Badge missing or stale

- Badges sync on each completed index run; revoked badges have `revoked_at` set.
- Ask the user to wait for indexing to complete (`profile.status === active`).
- Premium refresh: `POST /v1/me/profile/refresh`.
