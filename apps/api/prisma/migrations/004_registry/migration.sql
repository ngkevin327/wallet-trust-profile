-- CreateEnum
CREATE TYPE "RiskLabelSeverity" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "protocols" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "contract" VARCHAR(42),
    "category" VARCHAR(64) NOT NULL,
    "metadata" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "protocols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daos" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "treasury" VARCHAR(42),
    "token_address" VARCHAR(42),
    "chain_id" INTEGER NOT NULL,
    "metadata" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_labels" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "RiskLabelSeverity" NOT NULL DEFAULT 'medium',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_labels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "protocols_slug_key" ON "protocols"("slug");

-- CreateIndex
CREATE INDEX "protocols_chain_id_category_idx" ON "protocols"("chain_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "daos_slug_key" ON "daos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "risk_labels_code_key" ON "risk_labels"("code");
