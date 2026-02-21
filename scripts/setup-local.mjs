#!/usr/bin/env node
/**
 * First-run local setup: deps, .env, JWT keys, Docker infra, DB migrate + seed.
 * Idempotent — safe to re-run.
 */
import { execSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateKeyPairSync } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { loadRootEnv, repoRoot } from "./lib/load-env.mjs";

const root = repoRoot;
const envPath = join(root, ".env");
const envExamplePath = join(root, ".env.example");

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  const env = loadRootEnv();
  execSync(cmd, { stdio: "inherit", cwd: root, env, ...opts });
}

function tryRun(cmd) {
  try {
    execSync(cmd, { stdio: "pipe", cwd: root });
    return true;
  } catch {
    return false;
  }
}

function requireCommand(name, checkCmd) {
  if (!tryRun(checkCmd)) {
    console.error(`Missing required tool: ${name}. Install it and re-run pnpm setup:local`);
    process.exit(1);
  }
}

async function waitForDockerHealth(containerName, maxAttempts = 30) {
  for (let i = 1; i <= maxAttempts; i++) {
    const health = spawnSync(
      "docker",
      ["inspect", "--format", "{{.State.Health.Status}}", containerName],
      { cwd: root, encoding: "utf8" },
    );
    const status = (health.stdout || "").trim();
    if (status === "healthy") return;
    if (health.status !== 0) {
      console.log(`Waiting for ${containerName} to start (${i}/${maxAttempts})...`);
    } else {
      console.log(
        `Waiting for ${containerName} health=${status || "starting"} (${i}/${maxAttempts})...`,
      );
    }
    await sleep(2000);
  }
  console.error(`Timed out waiting for ${containerName}`);
  process.exit(1);
}

function ensureJwtKeysInEnv() {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const hasPrivate =
    /^JWT_PRIVATE_KEY=.+$/m.test(content) && !/JWT_PRIVATE_KEY=\s*$/m.test(content);
  const hasPublic = /^JWT_PUBLIC_KEY=.+$/m.test(content) && !/JWT_PUBLIC_KEY=\s*$/m.test(content);
  if (hasPrivate && hasPublic) {
    console.log("JWT keys already present in .env");
    return;
  }

  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const priv = `JWT_PRIVATE_KEY="${privateKey.trim().replace(/\n/g, "\\n")}"`;
  const pub = `JWT_PUBLIC_KEY="${publicKey.trim().replace(/\n/g, "\\n")}"`;

  if (!content.includes("JWT_PRIVATE_KEY=")) {
    content += `\n${priv}\n`;
  } else {
    content = content.replace(/^JWT_PRIVATE_KEY=.*$/m, priv);
  }
  if (!content.includes("JWT_PUBLIC_KEY=")) {
    content += `${pub}\n`;
  } else {
    content = content.replace(/^JWT_PUBLIC_KEY=.*$/m, pub);
  }

  writeFileSync(envPath, content.endsWith("\n") ? content : `${content}\n`, "utf8");
  console.log("Generated dev JWT keys in .env");
}

async function main() {
  console.log("=== Onchain Reputation — local setup ===\n");

  requireCommand("Node.js 20+", "node -v");
  requireCommand("pnpm 9+", "pnpm -v");
  requireCommand("Docker", "docker --version");

  if (!existsSync(envPath)) {
    copyFileSync(envExamplePath, envPath);
    console.log("Created .env from .env.example");
  } else {
    console.log(".env already exists");
  }

  ensureJwtKeysInEnv();

  run("docker compose up -d");
  await waitForDockerHealth("onchain-reputation-postgres");
  await waitForDockerHealth("onchain-reputation-redis");

  run("pnpm install");
  run("pnpm --filter @onchain-reputation/api exec prisma generate");
  run("pnpm --filter @onchain-reputation/api db:migrate");
  run("pnpm --filter @onchain-reputation/api db:seed");

  console.log("\n=== Setup complete ===");
  console.log("Next: pnpm dev   (API :3001, Web :3000)");
  console.log("Verify: pnpm verify:local");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
