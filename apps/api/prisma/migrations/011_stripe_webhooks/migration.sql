CREATE TABLE "stripe_webhook_events" (
    "id" VARCHAR(255) NOT NULL,
    "type" VARCHAR(128) NOT NULL,
    "processed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);
