# Secrets Setup

Secrets are never committed to the repository. Configure values per environment in AWS Secrets Manager and GitHub Actions.

## Required secrets

| Secret name | Service | Description |
|-------------|---------|-------------|
| `onchain-reputation-staging/database-url` | API, Worker | PostgreSQL connection string |
| `onchain-reputation-staging/redis-url` | API, Worker | Redis connection string |
| `onchain-reputation-staging/jwt-private-key` | API | RS256 private key (PEM) |
| `onchain-reputation-staging/jwt-public-key` | API | RS256 public key (PEM) |
| `onchain-reputation-staging/alchemy-api-key` | Worker | Alchemy RPC for Ethereum + Base |

## Alchemy API keys

1. Create separate Alchemy apps for **Ethereum mainnet** and **Base** (or use multichain key).
2. Store the API key in Secrets Manager at `onchain-reputation-{env}/alchemy-api-key`.
3. Map to worker environment variables:
   - `ALCHEMY_API_KEY` — used to build RPC URLs when `RPC_URL_ETHEREUM` / `RPC_URL_BASE` are unset.
4. Rotate keys quarterly; update Secrets Manager and redeploy worker without code changes.

## Local development

Copy `.env.example` to `.env` and set:

```
ALCHEMY_API_KEY=your_key_here
RPC_URL_ETHEREUM=https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
RPC_URL_BASE=https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}
```

Generate JWT keys: `node apps/api/scripts/generate-dev-jwt-keys.mjs`

## Terraform references

Secret ARNs are output from `infra/terraform/secrets.tf`. Values are populated manually after first `terraform apply`.
