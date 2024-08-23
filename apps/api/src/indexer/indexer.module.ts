import { Module } from "@nestjs/common";
import { IndexerQueue } from "./indexer.queue";

@Module({
  providers: [IndexerQueue],
  exports: [IndexerQueue],
})
export class IndexerModule {}
