-- CreateTable
CREATE TABLE "wallet_chain_index" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "last_indexed_block" BIGINT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "wallet_chain_index_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_chain_index_wallet_id_chain_id_key" ON "wallet_chain_index"("wallet_id", "chain_id");

-- AddForeignKey
ALTER TABLE "wallet_chain_index" ADD CONSTRAINT "wallet_chain_index_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
