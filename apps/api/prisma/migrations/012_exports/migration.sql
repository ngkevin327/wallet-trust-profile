CREATE TYPE "ExportFormat" AS ENUM ('json', 'pdf');
CREATE TYPE "ExportStatus" AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE "exports" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "status" "ExportStatus" NOT NULL DEFAULT 'pending',
    "artifact_key" VARCHAR(512),
    "verification_url" VARCHAR(512),
    "signature" VARCHAR(128),
    "payload_snapshot" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "exports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "exports_user_id_created_at_idx" ON "exports"("user_id", "created_at" DESC);
