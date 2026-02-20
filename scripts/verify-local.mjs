#!/usr/bin/env node
/**
 * Smoke verification for local MVP dev: infra, API health, demo public profile.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

const checks = [];
let failed = 0;

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
  console.log(`PASS  ${name} — ${detail}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.error(`FAIL  ${name} — ${detail}`);
  failed++;
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
}

function dockerRunning(name) {
  const r = spawnSync("docker", ["inspect", "-f", "{{.State.Running}}", name], {
    cwd: root,
    encoding: "utf8",
  });
  return r.status === 0 && r.stdout.trim() === "true";
}

console.log("=== Local verification ===\n");

if (!existsSync(join(root, ".env"))) {
  fail("env file", ".env missing — run pnpm setup:local");
} else {
  pass("env file", ".env present");
}

if (dockerRunning("onchain-reputation-postgres")) {
  pass("postgres", "container running");
} else {
  fail("postgres", "container not running — docker compose up -d");
}

if (dockerRunning("onchain-reputation-redis")) {
  pass("redis", "container running");
} else {
  fail("redis", "container not running — docker compose up -d");
}

const apiBase = process.env.API_BASE_URL ?? "http://localhost:3001";

for (const path of ["/health", "/ready"]) {
  try {
    const { ok, status, body } = await fetchJson(`${apiBase}${path}`);
    if (ok && (body.status === "ok" || body.status === "ready")) {
      pass(`API ${path}`, `HTTP ${status}`);
    } else {
      fail(`API ${path}`, `HTTP ${status} — start API with pnpm dev`);
    }
  } catch (e) {
    fail(`API ${path}`, `unreachable (${e.message}) — run pnpm dev`);
  }
}

try {
  const { ok, status, body } = await fetchJson(`${apiBase}/v1/profiles/demo-builder`);
  if (ok && body?.slug === "demo-builder") {
    pass(
      "public profile API",
      `slug=${body.slug}, reputationIndex=${body.reputationIndex ?? "n/a"}`,
    );
  } else {
    fail("public profile API", `HTTP ${status} — ensure API_MOCK_MODE=true and db:seed ran`);
  }
} catch (e) {
  fail("public profile API", e.message);
}

const webBase = process.env.WEB_BASE_URL ?? "http://localhost:3000";
try {
  const res = await fetch(`${webBase}/u/demo-builder`);
  if (res.ok) {
    const html = await res.text();
    if (/demo builder/i.test(html)) {
      pass("public profile web", `GET /u/demo-builder HTTP ${res.status}`);
    } else {
      fail("public profile web", "page loaded but demo content not found");
    }
  } else {
    fail("public profile web", `HTTP ${res.status} — start web with pnpm dev`);
  }
} catch (e) {
  fail("public profile web", `unreachable (${e.message})`);
}

const reportPath = join(root, "documentation", "launch", "local-verification-last.json");
const report = {
  at: new Date().toISOString(),
  apiBase,
  webBase,
  checks,
  passed: checks.filter((c) => c.ok).length,
  failed,
};
try {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written: ${reportPath}`);
} catch {
  /* optional */
}

console.log(`\n=== ${failed === 0 ? "All checks passed" : `${failed} check(s) failed`} ===`);
process.exit(failed > 0 ? 1 : 0);
