import { createHash } from "node:crypto";
import type { ScoringInputs } from "./scoring.types";

export function hashScoringInputs(inputs: ScoringInputs): string {
  const ordered = Object.keys(inputs)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = inputs[key as keyof ScoringInputs];
        return acc;
      },
      {} as Record<string, unknown>,
    );
  return createHash("sha256").update(JSON.stringify(ordered)).digest("hex");
}
