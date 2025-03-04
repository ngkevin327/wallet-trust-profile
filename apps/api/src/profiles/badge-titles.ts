import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

let titles: Map<string, string> | null = null;

export function getBadgeTitle(code: string): string {
  if (!titles) {
    const path = join(process.cwd(), "config", "badges", "v1.yaml");
    const catalog = yaml.load(readFileSync(path, "utf8")) as {
      badges: { code: string; title: string }[];
    };
    titles = new Map(catalog.badges.map((b) => [b.code, b.title]));
  }
  return titles.get(code) ?? code;
}
