# MVP launch checklist

Use this list in the launch war room. All items must be checked before tagging `v1.0.0-mvp`.

## Product & QA

- [ ] MVP acceptance criteria (PRD §19) verified on staging
- [ ] Playwright e2e green in PR CI (`NEXT_PUBLIC_TEST_MODE=true`)
- [ ] Nightly testnet indexing passed twice consecutively
- [ ] k6 load test: 500 VU, p95 &lt; 2s, error rate &lt; 1% (artifact attached)
- [ ] Premium gating: Stripe test mode → entitlements → export PDF
- [ ] Export verification URL validated by third party

## Security & legal

- [ ] OWASP scan: no open Critical/High (`documentation/security/scan-results.md`)
- [ ] `pnpm audit --audit-level=high` clean (or allowlisted with expiry)
- [ ] Privacy and Terms pages live (`/legal/privacy`, `/legal/terms`)
- [ ] Footer links verified on landing and checkout

## Infrastructure

- [ ] Terraform prod plan reviewed and signed by ops (`infra/terraform/envs/prod`)
- [ ] DNS: `app` + `api` + ACM validated
- [ ] CloudFront `/u/*` caching rules verified
- [ ] Stripe production webhook URL reachable
- [ ] Secrets Manager production ARNs only (no staging keys in prod tasks)

## Observability & on-call

- [ ] Dashboards imported (`infra/dashboards/*.json`)
- [ ] Alerts routed to PagerDuty/Slack
- [ ] On-call rotation staffed (`documentation/runbooks/on-call.md`)
- [ ] Runbooks: indexer failure, scoring rollback, deploy production

## Deploy

- [ ] Release tag created (`v*`)
- [ ] GitHub `production` environment approval configured
- [ ] Deploy workflow smoke tests passed
- [ ] 48h hypercare monitoring window scheduled

## Sign-off

| Role | Name | Date |
|------|------|------|
| Engineering | | |
| Ops | | |
| Product | | |
