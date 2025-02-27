import type { PrismaClient } from "@prisma/client";
import { revokeStaleBadges } from "./badge.revoker";
import { loadBadgeCatalog } from "./badge-config.loader";
import type { BadgeRule } from "./badge.types";
import type { ScoringResult } from "../scoring/scoring.types";

export class BadgeEvaluator {
  private readonly catalog = loadBadgeCatalog();

  constructor(private readonly prisma: PrismaClient) {}

  evaluate(result: ScoringResult): string[] {
    return this.catalog.badges
      .filter((rule) => this.meetsCriteria(rule, result))
      .map((rule) => rule.code);
  }

  async syncAwards(walletId: string, result: ScoringResult): Promise<void> {
    const earned = new Set(this.evaluate(result));
    const existing = await this.prisma.badgeAward.findMany({ where: { walletId } });

    for (const rule of this.catalog.badges) {
      const award = existing.find((a) => a.badgeCode === rule.code);
      const shouldHave = earned.has(rule.code);

      if (shouldHave && !award) {
        await this.prisma.badgeAward.create({
          data: { walletId, badgeCode: rule.code },
        });
      } else if (shouldHave && award?.revokedAt) {
        await this.prisma.badgeAward.update({
          where: { id: award.id },
          data: { revokedAt: null, earnedAt: new Date() },
        });
      }
    }

    await revokeStaleBadges(this.prisma, walletId, earned);
  }

  private meetsCriteria(rule: BadgeRule, result: ScoringResult): boolean {
    const { inputs, dimensions, reputationIndex } = result;

    if (reputationIndex < rule.min_reputation_index) {
      return false;
    }
    if (rule.min_governance_votes != null && inputs.governanceVotes < rule.min_governance_votes) {
      return false;
    }
    if (
      rule.min_governance_score != null &&
      dimensions.governance < rule.min_governance_score
    ) {
      return false;
    }
    if (rule.min_dao_payments != null && inputs.daoPayments < rule.min_dao_payments) {
      return false;
    }
    if (rule.min_grant_patterns != null && inputs.grantPatterns < rule.min_grant_patterns) {
      return false;
    }
    if (
      rule.min_distinct_protocols != null &&
      inputs.distinctProtocols < rule.min_distinct_protocols
    ) {
      return false;
    }
    if (
      rule.min_payment_score != null &&
      dimensions.payment_reliability < rule.min_payment_score
    ) {
      return false;
    }
    if (
      rule.min_unique_counterparties != null &&
      inputs.uniqueCounterparties < rule.min_unique_counterparties
    ) {
      return false;
    }
    if (rule.min_tenure_months != null && inputs.tenureMonths < rule.min_tenure_months) {
      return false;
    }
    if (rule.min_wallet_age_days != null && inputs.walletAgeDays < rule.min_wallet_age_days) {
      return false;
    }
    if (
      rule.min_contribution_score != null &&
      dimensions.contribution < rule.min_contribution_score
    ) {
      return false;
    }

    if (rule.code === "balanced-builder") {
      return (
        dimensions.governance >= (rule.min_governance_score ?? 50) &&
        dimensions.contribution >= (rule.min_contribution_score ?? 50)
      );
    }

    return true;
  }
}
