import { SnapshotClient } from "../src/integrations/snapshot.client";
import snapshotFixture from "./fixtures/snapshot-votes.json";
import { mergeGovernanceFacts } from "../src/classifier/governance.mapper";

describe("SnapshotClient", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.SNAPSHOT_ENABLED;
  });

  it("returns empty when feature flag disabled", async () => {
    process.env.SNAPSHOT_ENABLED = "false";
    const client = new SnapshotClient();
    const votes = await client.fetchVotesByVoter("0x742d35cc6634c0532925a3b844bc9e7595f0beb0");
    expect(votes).toEqual([]);
  });

  it("parses votes from fixture response", async () => {
    process.env.SNAPSHOT_ENABLED = "true";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => snapshotFixture,
    }) as typeof fetch;

    const client = new SnapshotClient();
    const votes = await client.fetchVotesByVoter("0x742d35cc6634c0532925a3b844bc9e7595f0beb0", [
      "gitcoindao.eth",
    ]);

    expect(votes).toHaveLength(1);
    expect(votes[0].space.id).toBe("gitcoindao.eth");
  });

  it("merges snapshot votes into governance facts with partial coverage flag", () => {
    const merged = mergeGovernanceFacts({
      onchain: [],
      snapshotVotes: snapshotFixture.data.votes,
      partialCoverage: true,
    });

    expect(merged).toHaveLength(1);
    expect(merged[0].category).toBe("governance");
    expect(merged[0].raw).toMatchObject({ source: "snapshot", partialCoverage: true });
  });
});
