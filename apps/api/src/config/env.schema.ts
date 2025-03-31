export type ApiEnv = {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtIssuer: string;
  jwtAudience: string;
  cacheTtlSeconds: number;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadApiEnv(): ApiEnv {
  const portRaw = process.env.PORT ?? "3001";
  const port = Number(portRaw);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${portRaw}`);
  }

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port,
    databaseUrl: requireEnv("DATABASE_URL"),
    redisUrl: requireEnv("REDIS_URL"),
    jwtIssuer: requireEnv("JWT_ISSUER"),
    jwtAudience: requireEnv("JWT_AUDIENCE"),
    cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 600),
  };
}
