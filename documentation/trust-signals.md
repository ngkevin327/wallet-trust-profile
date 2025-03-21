# Trust Signal Semantics

Trust signals are **explainable risk and trust indicators** shown on public and owner profiles. They are computed from indexed transaction facts against the **risk label registry** plus lightweight heuristics.

## Signal fields

| Field | Meaning |
|-------|---------|
| `code` | Stable machine identifier (registry code or heuristic id) |
| `label` | Human-readable title |
| `severity` | `low`, `medium`, or `high` — UI emphasis only, not a legal determination |
| `confidence` | 0–1 score indicating match strength (registry hits ≈ 0.85, heuristics lower) |
| `reason` | Plain-language explanation shown to the user |

## Registry matches

When a wallet interacts with an address or token matching an active `risk_labels` row, a signal is emitted with high confidence. Registry entries are seeded from `apps/api/prisma/seeds/risk-labels.json` and maintained by operators.

## Heuristic signals

| Code | Trigger |
|------|---------|
| `high_self_transfer` | More than five self-directed transfers in the indexed window |
| `wash_pattern` | Transfer-heavy activity (>80% transfers) with limited protocol diversity |
| `clean_history` | Default when no registry or heuristic flags apply |

## Dispute process

Users who believe a trust signal is incorrect should:

1. Open a support ticket referencing the signal `code` and profile slug.
2. Provide the wallet address and approximate transaction date.
3. Support verifies against chain data and registry provenance (see `documentation/support-playbook.md`).

Signals update on the next successful profile re-index; premium users may trigger `POST /v1/me/profile/refresh`.
