# Scoring Methodology (MVP)

## Governance participation

MVP governance scores combine:

- **Onchain votes** — interactions with known governance contracts (Snapshot executor, token voting, multisig proposals where detectable).
- **Snapshot offchain votes** — when `SNAPSHOT_ENABLED=true`, votes from configured spaces are merged into governance facts.

### Snapshot coverage limitations

Snapshot indexing is **best-effort**, not exhaustive:

| Limitation | Impact |
|------------|--------|
| Space allowlist | Only votes in configured Snapshot spaces are counted |
| Pagination cap | Wallets with >1000 votes may be truncated |
| Hybrid score | Profiles show `partialCoverage: true` when Snapshot is enabled but onchain governance is incomplete |
| Lag | Snapshot hub data may lag onchain state by minutes to hours |

Supported MVP spaces (initial): `gitcoindao.eth`, `aave.eth`, `ens.eth`, `opcollective.eth`.

Offchain-only voters receive governance credit from Snapshot facts; onchain-only voters are scored from chain data alone.
