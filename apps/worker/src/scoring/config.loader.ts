import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";
import type { ScoringConfig } from "./scoring.types";

const REQUIRED_DIMENSIONS = [
  "governance",
  "contribution",
  "payment_reliability",
  "protocol_participation",
] as const;

let activeVersion = process.env.SCORING_CONFIG_VERSION ?? "v1";
let cachedConfig: ScoringConfig | null = null;

export function getActiveScoringVersion(): string {
  return activeVersion;
}

export function setActiveScoringVersion(version: string): void {
  activeVersion = version;
  cachedConfig = null;
}

/** Clear in-memory cache so the next score run loads fresh YAML from disk. */
export function reloadScoringConfig(): ScoringConfig {
  cachedConfig = null;
  return loadScoringConfig();
}

export function loadScoringConfig(version?: string): ScoringConfig {
  const fileVersion = version ?? activeVersion;
  if (cachedConfig && !version) {
    return cachedConfig;
  }

  const path = join(process.cwd(), "config", "scoring", `${fileVersion}.yaml`);
  const config = yaml.load(readFileSync(path, "utf8")) as ScoringConfig;

  validateScoringConfig(config);
  if (!version) {
    cachedConfig = config;
  }
  return config;
}

function validateScoringConfig(config: ScoringConfig): void {
  if (!config.version) {
    throw new Error("Scoring config missing version");
  }

  let weightSum = 0;
  for (const key of REQUIRED_DIMENSIONS) {
    const dim = config.dimensions[key];
    if (!dim) {
      throw new Error(`Scoring config missing dimension: ${key}`);
    }
    if (dim.weight <= 0 || dim.weight > 1) {
      throw new Error(`Invalid weight for ${key}: ${dim.weight}`);
    }
    weightSum += dim.weight;
  }

  if (Math.abs(weightSum - 1) > 0.01) {
    throw new Error(`Dimension weights must sum to 1.0, got ${weightSum}`);
  }
}
