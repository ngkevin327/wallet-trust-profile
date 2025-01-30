process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://reputation:reputation@localhost:5432/reputation";
process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
process.env.SNAPSHOT_ENABLED = "false";
