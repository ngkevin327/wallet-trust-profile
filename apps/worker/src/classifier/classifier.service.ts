import { PrismaClient } from "@prisma/client";
import type { NormalizedTransaction } from "../indexer/chain-indexer.interface";

export type ClassifiedFact = {
  chainId: number;
  txHash: string;
  logIndex: number | null;
  blockTime: Date;
  category: string;
  protocolId: string | null;
  raw: Record<string, unknown>;
};

export class ClassifierService {
  private protocolByContract = new Map<string, { id: string; category: string }>();
  private daoByAddress = new Map<string, { id: string; slug: string }>();
  private loaded = false;

  constructor(private readonly prisma: PrismaClient) {}

  async loadRegistry(): Promise<void> {
    if (this.loaded) {
      return;
    }

    const [protocols, daos] = await Promise.all([
      this.prisma.protocol.findMany({ where: { active: true } }),
      this.prisma.dao.findMany({ where: { active: true } }),
    ]);

    for (const p of protocols) {
      if (p.contract) {
        const key = `${p.chainId}:${p.contract.toLowerCase()}`;
        this.protocolByContract.set(key, { id: p.id, category: p.category });
      }
    }

    for (const d of daos) {
      if (d.treasury) {
        this.daoByAddress.set(`${d.chainId}:${d.treasury.toLowerCase()}`, {
          id: d.id,
          slug: d.slug,
        });
      }
      if (d.tokenAddress) {
        this.daoByAddress.set(`${d.chainId}:${d.tokenAddress.toLowerCase()}`, {
          id: d.id,
          slug: d.slug,
        });
      }
    }

    this.loaded = true;
  }

  async classify(tx: NormalizedTransaction, walletAddress: string): Promise<ClassifiedFact> {
    await this.loadRegistry();

    const wallet = walletAddress.toLowerCase();
    let category = "transfer";
    let protocolId: string | null = null;
    const counterparty = tx.from === wallet ? tx.to : tx.from;

    if (tx.isContractCreation) {
      category = "contract_deploy";
    } else if (counterparty) {
      const protocol = this.protocolByContract.get(`${tx.chainId}:${counterparty}`);
      if (protocol) {
        category = protocol.category === "governance" ? "governance" : "protocol_interaction";
        protocolId = protocol.id;
      } else {
        const dao = this.daoByAddress.get(`${tx.chainId}:${counterparty}`);
        if (dao) {
          category = "dao_contribution";
          protocolId = dao.id;
        }
      }
    }

    if (tx.input && tx.input.length > 10 && category === "transfer") {
      category = "protocol_interaction";
    }

    return {
      chainId: tx.chainId,
      txHash: tx.txHash,
      logIndex: tx.logIndex,
      blockTime: tx.blockTime,
      category,
      protocolId,
      raw: {
        from: tx.from,
        to: tx.to,
        value: tx.value,
        blockNumber: tx.blockNumber.toString(),
        isContractCreation: tx.isContractCreation,
      },
    };
  }
}
