# On-call rotation

## Rotation

- Primary: platform engineer (week A)
- Secondary: backend engineer (week B)
- Escalation: engineering lead

## Severity levels

| Level | Description | Response target |
|-------|-------------|-----------------|
| P1 | API down, data loss risk, billing broken | 15 minutes |
| P2 | Indexer stalled, elevated 5xx, DLQ growing | 30 minutes |
| P3 | Degraded latency, non-critical feature broken | Next business day |

## Alert routing

- **Production:** PagerDuty + `#oncall-prod` Slack
- **Staging:** `#oncall-staging` Slack only (dry-run alerts weekly)

## First steps on page

1. Acknowledge the alert in PagerDuty.
2. Open the linked runbook from the alarm description.
3. Check dashboards: `infra/dashboards/api-overview.json`, `infra/dashboards/worker-indexer.json`.
4. Post status in `#incidents` with severity and ETA.

## Related runbooks

- [Indexer failures](./indexer-failure.md)
- [Scoring rollback](./scoring-rollback.md)
