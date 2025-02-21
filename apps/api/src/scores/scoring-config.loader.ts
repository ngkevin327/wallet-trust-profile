import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

type ScoringConfig = {
  version: string;
  dimensions: Record<string, { weight: number }>;
};

export function loadScoringConfig(version = "v1"): ScoringConfig {
  const path = join(process.cwd(), "config", "scoring", `${version}.yaml`);
  return yaml.load(readFileSync(path, "utf8")) as ScoringConfig;
}
