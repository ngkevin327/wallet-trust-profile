# MVP rollback plan

**Recovery time objective (RTO):** 4 hours  
**Recovery point objective (RPO):** 24 hours (database PITR)

## When to rollback

- Smoke tests fail after production deploy
- Error rate &gt; 1% for 5 minutes or P95 &gt; 2s on public profiles
- Critical security incident on release build
- Stripe webhook or billing regression affecting paid users

## Rollback procedure

### 1. Stop traffic bleed (0–15 min)

- Announce incident in `#incidents`
- If needed, enable maintenance banner via feature flag / static page
- Pause GitHub production deployments

### 2. Revert application (15–45 min)

**ECS (API + worker)**

```bash
aws ecs describe-services --cluster onchain-reputation-prod-cluster --services onchain-reputation-prod-api
# Update service to previous task definition revision
aws ecs update-service --cluster onchain-reputation-prod-cluster \
  --service onchain-reputation-prod-api \
  --task-definition <PREVIOUS_TASK_DEF_ARN>
```

Repeat for worker service. Wait for `services-stable`.

**Web (Vercel / static host)**

- Promote previous production deployment in hosting provider UI

### 3. Database / scoring (if needed)

- Scoring config only: follow `documentation/runbooks/scoring-rollback.md`
- Schema migration failure: restore RDS from latest snapshot (ops-led, &gt; 1h)

### 4. Verify (45–90 min)

```bash
curl -sf https://api.<domain>/health
curl -sf https://api.<domain>/v1/profiles/demo-builder
```

Run abbreviated Playwright smoke against production read-only paths.

### 5. Communicate (ongoing)

- Status page update
- Email affected premium users if billing impacted
- Post-mortem within 5 business days

## What we do not rollback

- Registry data fixes that are forward-only (re-seed if needed)
- Irreversible Stripe charges — handle via support credits

## Prevention

- Deploy only from tags `v*`
- Manual approval on `production` environment
- Automated smoke tests in deploy workflow
- Keep previous ECS task definition revision for 7 days
