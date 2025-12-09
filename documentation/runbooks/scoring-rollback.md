# Runbook: Scoring config rollback

Use when a scoring YAML deploy causes controversial or incorrect reputation indexes.

## Prerequisites

- Admin API key (`ADMIN_API_KEY`) with IP allowlist access
- Access to `config/scoring/` in the API deployment artifact or volume

## Rollback procedure

1. Identify last known-good semver (e.g. `1.0.0`) from git history or S3 backup.
2. Confirm current production version:
   ```bash
   ls config/scoring/*.yaml
   ```
3. Upload previous YAML via admin endpoint (must be **greater** than current file version name — for rollback, temporarily remove higher version files or rename):
   - Preferred: redeploy prior `config/scoring/{version}.yaml` from git tag.
   - Set `SCORING_CONFIG_VERSION` to the rolled-back file stem (e.g. `v1` or `1.0.0`).
4. Publish worker reload:
   ```bash
   redis-cli PUBLISH scoring:config:reload <version>
   ```
5. Restart worker pods to clear in-memory cache if reload hook missed.
6. Trigger selective recompute for affected wallets (premium refresh or batch job) — full recompute is **not** automatic on upload.

## Selective recompute

- Premium users: `POST /v1/me/profile/refresh` (rate-limited).
- Batch: enqueue indexer jobs for wallet IDs from support ticket list.

## Communication template

> We reverted a scoring model update on {date}. Your reputation index may change over the next 24h as profiles refresh. Scoring version: {version}.

## Prevention

- Always upload to **staging** first; validate on test wallets.
- Use admin `POST /v1/admin/scoring-config/preview` before production upload.
- See [export verification](../export-verification.md) for third-party audit trails.
