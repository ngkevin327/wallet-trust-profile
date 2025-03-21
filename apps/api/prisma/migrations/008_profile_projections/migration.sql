CREATE TABLE "profile_projections" (
    "profile_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "scoring_version" VARCHAR(32) NOT NULL,
    "last_updated_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "profile_projections_pkey" PRIMARY KEY ("profile_id")
);

ALTER TABLE "profile_projections" ADD CONSTRAINT "profile_projections_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
