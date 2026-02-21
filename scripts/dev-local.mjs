#!/usr/bin/env node
/**
 * Start web, API, and worker with root .env loaded (pnpm dev does not load .env by default).
 */
import { spawn } from "node:child_process";
import { loadRootEnv, repoRoot } from "./lib/load-env.mjs";

const env = loadRootEnv();
env.REPO_ROOT = repoRoot;

const child = spawn("pnpm", ["-r", "--parallel", "run", "dev"], {
  cwd: repoRoot,
  env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
