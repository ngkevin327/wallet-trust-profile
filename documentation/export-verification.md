# Export verification

Reputation exports include an HMAC-SHA256 signature so third parties can confirm a JSON snapshot was issued by Onchain Reputation and not tampered with.

## Signing

- Secret: `EXPORT_SIGNING_SECRET` (store in Secrets Manager in production; rotate quarterly).
- Message: `{exportId}:{canonicalJsonPayload}` where payload excludes `verificationUrl` and `signature` fields.
- Algorithm: HMAC-SHA256 hex digest.

## Verification API

```
GET /v1/verify/:exportId
```

Returns:

```json
{
  "exportId": "…",
  "valid": true,
  "reason": "signature_match",
  "exportedAt": "2024-06-01T12:00:00.000Z",
  "scoringVersion": "1.0.0"
}
```

No authentication required. Export files embed `verificationUrl` pointing to this endpoint.

## Key rotation

1. Deploy new secret as `EXPORT_SIGNING_SECRET_NEXT`.
2. Sign new exports with the next key; verify endpoint accepts both during overlap window.
3. Retire previous secret after max export TTL (default 90 days).
