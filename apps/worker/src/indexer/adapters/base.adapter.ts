import { EthereumIndexerAdapter } from "./ethereum.adapter";
import type { RpcClient } from "../base-indexer.adapter";

export class BaseIndexerAdapter extends EthereumIndexerAdapter {
  readonly chainId = 8453;

  constructor(rpc: RpcClient) {
    super(rpc);
  }
}
