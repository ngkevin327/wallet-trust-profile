# Scoring Methodology (MVP)

## Overview

Onchain Reputation computes a **composite reputation index** (0–100) from four weighted dimensions. Each index run produces an **immutable score snapshot** with an **inputs hash** for audit reproducibility.

| Dimension | Weight (v1) | Primary signals |
|-----------|-------------|-----------------|
| Governance | 25% | Vote participation, protocol diversity, tenure |
| Contribution | 30% | DAO payments, grant patterns, wallet tenure |
| Payment reliability | 25% | Inbound consistency, counterparty diversity, wash penalty |
| Protocol participation | 20% | Distinct protocols, recency of interactions |

Configuration lives in `config/scoring/v1.yaml`. The worker loads this file at runtime; API score breakdown reads the same weights for owner-facing explanations.

## Governance participation

MVP governance scores combine:

- **Onchain votes** — interactions with known governance contracts (Snapshot executor, token voting, multisig proposals where detectable).
- **Snapshot offchain votes** — when `SNAPSHOT_ENABLED=true`, votes from configured spaces are merged into governance facts.

### Token balance influence cap

Token holdings may contribute a small boost to the governance dimension, capped at **10% of the dimension score** via `max_balance_weight` in config. This prevents whale balances from dominating reputation.

### Snapshot coverage limitations

Snapshot indexing is **best-effort**, not exhaustive:

| Limitation | Impact |
|------------|--------|
| Space allowlist | Only votes in configured Snapshot spaces are counted |
| Pagination cap | Wallets with >1000 votes may be truncated |
| Hybrid score | Profiles show partial coverage when Snapshot is enabled but onchain governance is incomplete |
| Lag | Snapshot hub data may lag onchain state by minutes to hours |

Supported MVP spaces (initial): `gitcoindao.eth`, `aave.eth`, `ens.eth`, `opcollective.eth`.

Offchain-only voters receive governance credit from Snapshot facts; onchain-only voters are scored from chain data alone.

## Snapshots and audits

After each successful index run the worker:

1. Builds scoring inputs from classified, spam-filtered facts.
2. Runs `ScoringEngine` with version `1.0.0`.
3. Persists a row in `score_snapshots` with dimension JSON and SHA-256 `inputs_hash`.

Profile owners can call `GET /v1/me/profile/score-breakdown` for the latest snapshot metadata and per-dimension weights.

## Badges

Badges are evaluated from the same scoring result using `config/badges/v1.yaml`. Awards are stored in `badge_awards` and revoked when criteria are no longer met after a re-index.
