import type { ClassifiedFact } from "../classifier/classifier.service";
import { AggregatesService } from "./aggregates.service";

const aggregates = new AggregatesService();

export function applyAggregates(facts: ClassifiedFact[]) {
  return aggregates.summarizeIfNeeded(facts);
}
