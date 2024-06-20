-- CreateEnum
CREATE TYPE "IndexRunStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateTable
CREATE TABLE "index_runs" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "status" "IndexRunStatus" NOT NULL DEFAULT 'pending',
    "from_block" BIGINT,
    "to_block" BIGINT,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "error" TEXT,

    CONSTRAINT "index_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_facts" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "index_run_id" UUID,
    "chain_id" INTEGER NOT NULL,
    "tx_hash" VARCHAR(66) NOT NULL,
    "log_index" INTEGER,
    "block_time" TIMESTAMPTZ NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "protocol_id" UUID,
    "raw" JSONB NOT NULL,

    CONSTRAINT "transaction_facts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "index_runs_wallet_id_status_idx" ON "index_runs"("wallet_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_facts_chain_id_tx_hash_log_index_key" ON "transaction_facts"("chain_id", "tx_hash", "log_index");

-- CreateIndex
CREATE INDEX "transaction_facts_wallet_id_block_time_idx" ON "transaction_facts"("wallet_id", "block_time" DESC);

-- AddForeignKey
ALTER TABLE "index_runs" ADD CONSTRAINT "index_runs_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_facts" ADD CONSTRAINT "transaction_facts_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_facts" ADD CONSTRAINT "transaction_facts_index_run_id_fkey" FOREIGN KEY ("index_run_id") REFERENCES "index_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
