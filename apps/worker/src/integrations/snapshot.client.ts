export type SnapshotVote = {
  id: string;
  voter: string;
  space: { id: string };
  proposal: { id: string };
  choice: unknown;
  created: number;
};

export class SnapshotClient {
  private readonly hubUrl: string;
  private readonly enabled: boolean;

  constructor() {
    this.hubUrl = process.env.SNAPSHOT_HUB_URL ?? "https://hub.snapshot.org";
    this.enabled = process.env.SNAPSHOT_ENABLED === "true";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async fetchVotesByVoter(voter: string, spaces?: string[]): Promise<SnapshotVote[]> {
    if (!this.enabled) {
      return [];
    }

    const query = `
      query Votes($voter: String!, $spaces: [String!]) {
        votes(
          first: 1000
          where: { voter: $voter, space_in: $spaces }
          orderBy: "created"
          orderDirection: desc
        ) {
          id
          voter
          space { id }
          proposal { id }
          choice
          created
        }
      }
    `;

    const response = await fetch(this.hubUrl + "/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { voter: voter.toLowerCase(), spaces: spaces ?? null },
      }),
    });

    if (!response.ok) {
      throw new Error(`Snapshot API error: ${response.status}`);
    }

    const json = (await response.json()) as { data?: { votes?: SnapshotVote[] } };
    return json.data?.votes ?? [];
  }
}
