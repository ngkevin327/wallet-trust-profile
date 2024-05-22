export type WorkerEnv = {
  nodeEnv: string;
  databaseUrl: string;
  redisUrl: string;
  rpcUrlEthereum?: string;
  rpcUrlBase?: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadWorkerEnv(): WorkerEnv {
  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    databaseUrl: requireEnv("DATABASE_URL"),
    redisUrl: requireEnv("REDIS_URL"),
    rpcUrlEthereum: process.env.RPC_URL_ETHEREUM,
    rpcUrlBase: process.env.RPC_URL_BASE,
  };
}
