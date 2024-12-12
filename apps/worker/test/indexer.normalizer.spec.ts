import { EthereumIndexerAdapter } from "../src/indexer/adapters/ethereum.adapter";
import ethTransferFixture from "./fixtures/eth-transfer.json";

describe("EthereumIndexerAdapter normalization", () => {
  const mockRpc = {
    request: jest.fn(async (args: { method: string }) => {
      if (args.method === "eth_blockNumber") {
        return "0x12a05f2";
      }
      if (args.method === "alchemy_getAssetTransfers") {
        return ethTransferFixture;
      }
      return null;
    }),
  };

  it("normalizes external ETH transfers from fixture", async () => {
    const adapter = new EthereumIndexerAdapter(mockRpc);
    const txs = await adapter.fetchTransactions(
      "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
      19500000n,
      19501000n,
    );

    expect(txs.length).toBeGreaterThanOrEqual(1);
    const tx = txs[0];
    expect(tx.chainId).toBe(1);
    expect(tx.txHash).toMatch(/^0x/);
    expect(tx.from).toBe("0x742d35cc6634c0532925a3b844bc9e7595f0beb0");
    expect(tx.blockTime).toBeInstanceOf(Date);
  });

  it("deduplicates identical transfer keys", async () => {
    const adapter = new EthereumIndexerAdapter(mockRpc);
    const txs = await adapter.fetchTransactions(
      "0x742d35cc6634c0532925a3b844bc9e7595f0beb0",
      1n,
      100n,
    );
    const keys = txs.map((t) => `${t.txHash}:${t.logIndex}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
