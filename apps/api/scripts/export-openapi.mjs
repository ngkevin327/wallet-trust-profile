/**
 * Exports the committed contract spec path for CI and agency review.
 * Live Swagger JSON is available at GET /v1/docs-json when the API is running.
 */
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const source = join(root, "openapi/v1.yaml");
const target = join(root, "openapi/v1.yaml");

if (!existsSync(source)) {
  console.error("openapi/v1.yaml not found");
  process.exit(1);
}

copyFileSync(source, target);
console.log("OpenAPI contract available at openapi/v1.yaml");
