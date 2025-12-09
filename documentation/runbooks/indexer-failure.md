# Runbook: Indexer failures and RPC outages

## Symptoms

- Profiles stuck in `indexing` status
- Worker logs show RPC errors or `index.run` span failures
- DLQ depth > 0 (alert: `indexer-dlq-depth`)
- Public profiles show stale `lastUpdated`

## Severity

- **P1** if all indexing stopped > 30 minutes
- **P2** if subset of wallets failing or single RPC provider down
- **P3** if retries succeed within 15 minutes

## Diagnosis

1. Check [Alchemy status](https://status.alchemy.com/) and provider dashboards.
2. Inspect worker logs for `index.run` errors and `trust_evaluated` absence.
3. Query pending index runs:
   ```sql
   SELECT status, COUNT(*) FROM index_runs GROUP BY status;
   ```
4. Check Redis stream lengths: `indexer:jobs`, `indexer:dlq`.
5. Review OpenTelemetry trace `index.run` spans in the observability dashboard.

## Mitigation

### RPC outage

1. Set fallback RPC in environment:
   - `RPC_URL_ETHEREUM` — secondary endpoint
   - `RPC_URL_BASE` — secondary Base endpoint
2. Restart worker replicas after env update.
3. Reduce load: lower `MAX_CONCURRENT_INDEX_JOBS` (default 5) to 2 until provider recovers.

### Queue backlog

1. Scale worker ECS tasks (+1 replica) if RPC quota allows.
2. Do **not** exceed Alchemy compute units plan — check concurrent job gauge.
3. Drain DLQ only after fixing root cause (see below).

### Drain and replay DLQ

1. Inspect DLQ messages: `XRANGE indexer:dlq - + COUNT 10`
2. Fix underlying bug or RPC issue.
3. Re-enqueue failed jobs with original payload fields.
4. Confirm `index.run` completes and profile status → `active`.

## User-facing communication

Enable stale-data banner copy on public profiles (web ISR will refresh within 5 minutes after recovery).

Template:

> We're refreshing on-chain data. Scores may be a few hours old. Last successful index: {timestamp}.

## Post-incident

- Document root cause in incident channel.
- Add regression test if classification/scoring bug caused DLQ.
- Tune alerts if false positive.
