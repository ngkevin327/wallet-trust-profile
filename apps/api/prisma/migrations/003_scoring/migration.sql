-- CreateTable
CREATE TABLE "score_snapshots" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "index_run_id" UUID NOT NULL,
    "scoring_version" VARCHAR(32) NOT NULL,
    "reputation_index" INTEGER NOT NULL,
    "dimensions" JSONB NOT NULL,
    "inputs_hash" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_awards" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "badge_code" VARCHAR(64) NOT NULL,
    "earned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ,

    CONSTRAINT "badge_awards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "score_snapshots_wallet_id_created_at_idx" ON "score_snapshots"("wallet_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "badge_awards_wallet_id_badge_code_key" ON "badge_awards"("wallet_id", "badge_code");

-- AddForeignKey
ALTER TABLE "score_snapshots" ADD CONSTRAINT "score_snapshots_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_snapshots" ADD CONSTRAINT "score_snapshots_index_run_id_fkey" FOREIGN KEY ("index_run_id") REFERENCES "index_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_awards" ADD CONSTRAINT "badge_awards_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
