import type { ClassifiedFact } from "../classifier/classifier.service";

const HIGH_VOLUME_THRESHOLD = 500;

export type ActivitySummary = {
  activitySummarized: boolean;
  totalTransactions: number;
  topProtocols: { category: string; count: number }[];
};

export class AggregatesService {
  summarizeIfNeeded(facts: ClassifiedFact[]): {
    facts: ClassifiedFact[];
    summary: ActivitySummary | null;
  } {
    if (facts.length <= HIGH_VOLUME_THRESHOLD) {
      return {
        facts,
        summary: {
          activitySummarized: false,
          totalTransactions: facts.length,
          topProtocols: [],
        },
      };
    }

    const byCategory = new Map<string, number>();
    for (const fact of facts) {
      byCategory.set(fact.category, (byCategory.get(fact.category) ?? 0) + 1);
    }

    const topProtocols = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));

    return {
      facts: facts.slice(0, HIGH_VOLUME_THRESHOLD),
      summary: {
        activitySummarized: true,
        totalTransactions: facts.length,
        topProtocols,
      },
    };
  }
}
