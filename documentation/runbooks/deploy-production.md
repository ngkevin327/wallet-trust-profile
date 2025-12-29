# Production deployment runbook

Deployments use GitHub Actions with **manual approval** on the `production` environment. Only tagged releases `v*` may deploy.

## Prerequisites

- Terraform prod workspace applied (`infra/terraform/envs/prod`)
- DNS and CloudFront configured (`infra/terraform/dns.tf`, `cloudfront.tf`)
- Secrets in AWS Secrets Manager (production ARNs only)
- k6 load test passed on staging
- Launch checklist signed off (`documentation/launch/mvp-checklist.md`)

## Deploy (GitHub Actions)

1. Create release tag: `git tag v1.0.0 && git push origin v1.0.0`
2. Run workflow **Deploy Production** (`.github/workflows/deploy-production.yml`)
3. Approve deployment in GitHub Environment `production`
4. Workflow builds images, updates ECS task definitions, waits for stability

## Post-deploy smoke tests

```bash
curl -sf https://api.${DOMAIN}/health
curl -sf https://api.${DOMAIN}/v1/profiles/demo-builder
curl -sfI https://app.${DOMAIN}/u/demo-builder
```

Verify Stripe webhook delivery to `https://api.${DOMAIN}/v1/billing/webhooks/stripe`.

## Rollback

On smoke failure, workflow triggers rollback to previous ECS task definition revision. See `documentation/launch/rollback-plan.md` (RTO 4h).

## DNS / CDN notes

- Apex `app.example.com` → CloudFront → Next.js origin
- `api.example.com` → API ALB (Route53 alias to ALB)
- `/u/*` ISR paths: CloudFront `ordered_cache_behavior` max TTL 86400 (`infra/terraform/cloudfront.tf`)
- `www` → apex via CloudFront alias
- ACM certificates must be **Issued** in us-east-1 (CloudFront) and regional (ALB)
- TTL: Route53 alias records use AWS default; lower TTL before cutover if migrating DNS

### Terraform apply order

1. `infra/terraform/envs/prod` — VPC, RDS multi-AZ, Redis
2. `infra/terraform` root with `domain_name`, `api_alb_*`, `web_certificate_arn` set
3. Validate Stripe webhook: `https://api.<domain>/v1/billing/webhooks/stripe`
