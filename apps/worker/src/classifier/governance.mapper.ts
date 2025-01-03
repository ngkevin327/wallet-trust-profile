import type { ClassifiedFact } from "./classifier.service";
import type { SnapshotVote } from "../integrations/snapshot.client";

export type GovernanceFactInput = {
  onchain: ClassifiedFact[];
  snapshotVotes: SnapshotVote[];
  partialCoverage: boolean;
};

export function mergeGovernanceFacts(input: GovernanceFactInput): ClassifiedFact[] {
  const facts = [...input.onchain];

  for (const vote of input.snapshotVotes) {
    facts.push({
      chainId: 0,
      txHash: `snapshot:${vote.id}`,
      logIndex: null,
      blockTime: new Date(vote.created * 1000),
      category: "governance",
      protocolId: null,
      raw: {
        source: "snapshot",
        space: vote.space.id,
        proposal: vote.proposal.id,
        partialCoverage: input.partialCoverage,
      },
    });
  }

  return facts;
}
