import { Module } from "@nestjs/common";
import { IndexerOrchestrator } from "./indexer.orchestrator";
import { IndexerQueue } from "./indexer.queue";

@Module({
  providers: [IndexerQueue, IndexerOrchestrator],
  exports: [IndexerQueue, IndexerOrchestrator],
})
export class IndexerApiModule {}
