import { BadRequestException, Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";
import { auditAdminMutation } from "./admin-audit";
import { AdminAuthGuard, type AdminRequest } from "./admin-auth.guard";

type UploadBody = { yaml: string };

function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

function getProductionScoringVersion(): string {
  const dir = join(process.cwd(), "config", "scoring");
  const files = readdirSync(dir).filter((f) => f.endsWith(".yaml"));
  const versions = files
    .map((f) => f.replace(".yaml", ""))
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v));
  return versions.sort(compareSemver).at(-1) ?? "0.0.0";
}

function validateScoringYaml(config: Record<string, unknown>): string {
  const version = config.version;
  if (typeof version !== "string") {
    throw new BadRequestException("Scoring config missing version");
  }
  const dimensions = config.dimensions as Record<string, { weight?: number }> | undefined;
  if (!dimensions) {
    throw new BadRequestException("Scoring config missing dimensions");
  }
  let sum = 0;
  for (const dim of Object.values(dimensions)) {
    if (!dim?.weight || dim.weight <= 0 || dim.weight > 1) {
      throw new BadRequestException("Invalid dimension weight");
    }
    sum += dim.weight;
  }
  if (Math.abs(sum - 1) > 0.01) {
    throw new BadRequestException(`Dimension weights must sum to 1.0, got ${sum}`);
  }
  return version;
}

@Controller("admin/scoring-config")
@ApiTags("admin")
@UseGuards(AdminAuthGuard)
@ApiHeader({ name: "X-Admin-Api-Key", required: true })
export class ScoringAdminController {
  @Post()
  @ApiOperation({ summary: "Upload scoring config YAML version" })
  upload(@Req() req: AdminRequest, @Body() body: UploadBody) {
    if (!body.yaml?.trim()) {
      throw new BadRequestException("yaml body required");
    }

    const parsed = yaml.load(body.yaml) as Record<string, unknown>;
    const version = validateScoringYaml(parsed);
    const current = getProductionScoringVersion();
    if (compareSemver(version, current) <= 0) {
      throw new BadRequestException(
        `Version must be greater than current production ${current}`,
      );
    }

    const dir = join(process.cwd(), "config", "scoring");
    mkdirSync(dir, { recursive: true });
    const path = join(dir, `${version}.yaml`);
    writeFileSync(path, body.yaml, "utf8");

    auditAdminMutation(req.adminActorId!, "upload", "scoring_config", { version });

    if (process.env.REDIS_URL) {
      void import("ioredis").then(({ default: Redis }) => {
        const redis = new Redis(process.env.REDIS_URL!);
        return redis.publish("scoring:config:reload", version).finally(() => redis.quit());
      });
    }

    return { version, path: `config/scoring/${version}.yaml`, reloadSignal: "scoring:config:reload" };
  }

  @Post("preview")
  @ApiOperation({ summary: "Validate scoring YAML without persisting" })
  preview(@Body() body: UploadBody) {
    const parsed = yaml.load(body.yaml) as Record<string, unknown>;
    const version = validateScoringYaml(parsed);
    return { valid: true, version, productionVersion: getProductionScoringVersion() };
  }
}
