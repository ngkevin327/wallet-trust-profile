import Redis from "ioredis";
import { IndexRunStatus, PrismaClient, ProfileStatus } from "@prisma/client";
import type { WorkerEnv } from "../config/env.schema";
import { ClassifierService } from "../classifier/classifier.service";
import { SpamFilter } from "../classifier/spam.filter";
import { SnapshotClient } from "../integrations/snapshot.client";
import { mergeGovernanceFacts } from "../classifier/governance.mapper";
import { EthereumIndexerAdapter } from "./adapters/ethereum.adapter";
import { BaseIndexerAdapter as BaseL2Adapter } from "./adapters/base.adapter";
import type { RpcClient } from "./base-indexer.adapter";
import { FactsRepository } from "./facts.repository";
import { IndexerService } from "./indexer.service";
import { applyAggregates } from "./pipeline.util";
import { DlqHandler } from "../queue/dlq.handler";
import { getRetryDelay, shouldRetry } from "../queue/retry.policy";
import { ReorgHandler } from "./reorg.handler";
import { buildScoringInputs } from "../scoring/inputs.builder";
import { ScoringEngine } from "../scoring/scoring.engine";
import { SnapshotWriter } from "../scoring/snapshot.writer";

const STREAM_KEY = "indexer:jobs";
const GROUP = "indexer-workers";
const CONSUMER = `worker-${process.pid}`;

function createRpcClient(rpcUrl: string): RpcClient {
  return {
    request: async ({ method, params }) => {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: params ?? [] }),
      });
      const json = (await response.json()) as { result?: unknown; error?: { message: string } };
      if (json.error) {
        throw new Error(json.error.message);
      }
      return json.result;
    },
  };
}

export class IndexerConsumer {
  private redis: Redis;
  private prisma: PrismaClient;
  private indexerService: IndexerService;
  private classifier: ClassifierService;
  private spamFilter: SpamFilter;
  private factsRepo: FactsRepository;
  private dlq: DlqHandler;
  private reorg: ReorgHandler;
  private snapshot: SnapshotClient;
  private scoringEngine: ScoringEngine;
  private snapshotWriter: SnapshotWriter;
  private ethAdapter: EthereumIndexerAdapter;
  private baseAdapter: BaseL2Adapter;
  private running = false;

  constructor(
    redisUrl: string,
    env: WorkerEnv,
  ) {
    this.redis = new Redis(redisUrl, { maxRetriesPerRequest: 2 });
    this.prisma = new PrismaClient();
    this.indexerService = new IndexerService(this.prisma);
    this.classifier = new ClassifierService(this.prisma);
    this.spamFilter = new SpamFilter(this.prisma);
    this.factsRepo = new FactsRepository(this.prisma);
    this.dlq = new DlqHandler(this.redis);
    this.reorg = new ReorgHandler(this.prisma);
    this.snapshot = new SnapshotClient();
    this.scoringEngine = new ScoringEngine();
    this.snapshotWriter = new SnapshotWriter(this.prisma);

    const ethRpc =
      env.rpcUrlEthereum ??
      (env.alchemyApiKey ? `https://eth-mainnet.g.alchemy.com/v2/${env.alchemyApiKey}` : "");
    const baseRpc =
      env.rpcUrlBase ??
      (env.alchemyApiKey ? `https://base-mainnet.g.alchemy.com/v2/${env.alchemyApiKey}` : ethRpc);

    this.ethAdapter = new EthereumIndexerAdapter(createRpcClient(ethRpc));
    this.baseAdapter = new BaseL2Adapter(createRpcClient(baseRpc));
  }

  async start(): Promise<void> {
    this.running = true;
    try {
      await this.redis.xgroup("CREATE", STREAM_KEY, GROUP, "0", "MKSTREAM");
    } catch {
      // group exists
    }

    console.log("[worker] indexer consumer started");

    while (this.running) {
      const results = await this.redis.xreadgroup(
        "GROUP",
        GROUP,
        CONSUMER,
        "COUNT",
        1,
        "BLOCK",
        5000,
        "STREAMS",
        STREAM_KEY,
        ">",
      );

      if (!results) {
        continue;
      }

      for (const [, messages] of results) {
        for (const [id, fields] of messages) {
          try {
            await this.processJob(fields);
            await this.redis.xack(STREAM_KEY, GROUP, id);
          } catch (error) {
            const attempt = Number(this.parseFields(fields).attempt ?? 1);
            if (shouldRetry(attempt)) {
              const delay = getRetryDelay(attempt);
              await new Promise((r) => setTimeout(r, delay));
              const payload = this.parseFields(fields);
              await this.redis.xadd(
                STREAM_KEY,
                "*",
                ...Object.entries({ ...payload, attempt: String(attempt + 1) }).flat(),
              );
            } else {
              await this.dlq.moveToDlq(
                fields,
                error instanceof Error ? error.message : String(error),
              );
            }
            await this.redis.xack(STREAM_KEY, GROUP, id);
          }
        }
      }
    }
  }

  stop(): void {
    this.running = false;
  }

  private parseFields(fields: string[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      const key = fields[i];
      const value = fields[i + 1];
      if (key !== undefined && value !== undefined) {
        map[key] = value;
      }
    }
    return map;
  }

  private async processJob(fields: string[]) {
    const data = this.parseFields(fields);
    const walletId = data.walletId;
    const userId = data.userId;
    const chainId = Number(data.chainId ?? 1);

    if (!walletId || !userId) {
      return;
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) {
      return;
    }

    const indexRun = data.indexRunId
      ? await this.prisma.indexRun.findUnique({ where: { id: data.indexRunId } })
      : await this.prisma.indexRun.create({
          data: { walletId, status: IndexRunStatus.pending },
        });

    if (!indexRun) {
      return;
    }

    const adapter = chainId === 8453 ? this.baseAdapter : this.ethAdapter;

    try {
      const { fromBlock, toBlock } = await this.indexerService.resolveBlockRange(
        walletId,
        adapter,
      );

      await this.prisma.indexRun.update({
        where: { id: indexRun.id },
        data: {
          status: IndexRunStatus.running,
          fromBlock,
          toBlock,
          startedAt: new Date(),
        },
      });

      await this.reorg.reconcile(walletId, chainId, fromBlock);

      const txs = await adapter.fetchTransactions(wallet.address, fromBlock, toBlock);
      let facts = await Promise.all(
        txs.map((tx) => this.classifier.classify(tx, wallet.address)),
      );

      if (this.snapshot.isEnabled()) {
        const votes = await this.snapshot.fetchVotesByVoter(wallet.address);
        facts = mergeGovernanceFacts({
          onchain: facts,
          snapshotVotes: votes,
          partialCoverage: true,
        });
      }

      const { kept, filtered } = await this.spamFilter.filter(facts);
      if (filtered > 0) {
        console.log(JSON.stringify({ event: "spam_filtered", walletId, filtered }));
      }

      const { facts: toStore } = applyAggregates(kept);
      await this.factsRepo.upsertBatch(walletId, indexRun.id, toStore);
      await this.indexerService.updateLastIndexedBlock(walletId, chainId, toBlock);

      const scoringInputs = buildScoringInputs(wallet.address, toStore, wallet.linkedAt);
      const scoringResult = this.scoringEngine.score(scoringInputs);
      await this.snapshotWriter.persist(walletId, indexRun.id, scoringResult);

      await this.prisma.indexRun.update({
        where: { id: indexRun.id },
        data: {
          status: IndexRunStatus.completed,
          completedAt: new Date(),
        },
      });

      await this.prisma.profile.update({
        where: { userId },
        data: { status: ProfileStatus.active },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await this.prisma.indexRun.update({
        where: { id: indexRun.id },
        data: {
          status: IndexRunStatus.failed,
          error: message,
          completedAt: new Date(),
        },
      });
      await this.prisma.profile.update({
        where: { userId },
        data: { status: ProfileStatus.failed },
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    this.redis.disconnect();
  }
}
