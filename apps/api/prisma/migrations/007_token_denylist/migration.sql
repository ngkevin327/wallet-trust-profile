-- CreateTable
CREATE TABLE "token_denylist" (
    "id" UUID NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "contract" VARCHAR(42) NOT NULL,
    "symbol" VARCHAR(32),
    "reason" VARCHAR(128) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_denylist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_denylist_chain_id_contract_key" ON "token_denylist"("chain_id", "contract");
