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

export function loadScoringConfig(version = "v1"): ScoringConfig {
  const path = join(process.cwd(), "config", "scoring", `${version}.yaml`);
  const config = yaml.load(readFileSync(path, "utf8")) as ScoringConfig;

  validateScoringConfig(config);
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
