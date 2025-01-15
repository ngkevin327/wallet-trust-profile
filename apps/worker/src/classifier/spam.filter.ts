import { PrismaClient } from "@prisma/client";
import type { ClassifiedFact } from "./classifier.service";

export class SpamFilter {
  private denylist = new Set<string>();
  private loaded = false;

  constructor(private readonly prisma: PrismaClient) {}

  async load(): Promise<void> {
    if (this.loaded) {
      return;
    }
    const entries = await this.prisma.tokenDenylist.findMany({ where: { active: true } });
    for (const e of entries) {
      this.denylist.add(`${e.chainId}:${e.contract.toLowerCase()}`);
    }
    this.loaded = true;
  }

  async filter(facts: ClassifiedFact[]): Promise<{ kept: ClassifiedFact[]; filtered: number }> {
    await this.load();
    const kept: ClassifiedFact[] = [];
    let filtered = 0;

    for (const fact of facts) {
      const tokenContract = (fact.raw as { tokenContract?: string }).tokenContract;
      if (tokenContract && this.denylist.has(`${fact.chainId}:${tokenContract.toLowerCase()}`)) {
        filtered++;
        continue;
      }
      kept.push(fact);
    }

    return { kept, filtered };
  }
}
