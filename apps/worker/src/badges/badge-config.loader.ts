import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";
import { resolveRepoRoot } from "../lib/repo-root";
import type { BadgeCatalog } from "./badge.types";

export function loadBadgeCatalog(version = "v1"): BadgeCatalog {
  const path = join(resolveRepoRoot(), "config", "badges", `${version}.yaml`);
  const catalog = yaml.load(readFileSync(path, "utf8")) as BadgeCatalog;
  if (!catalog.badges?.length) {
    throw new Error("Badge catalog is empty");
  }
  if (catalog.badges.length < 10) {
    throw new Error(`Badge catalog requires at least 10 badges, got ${catalog.badges.length}`);
  }
  return catalog;
}
