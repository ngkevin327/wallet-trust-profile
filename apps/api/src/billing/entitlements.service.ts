import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  type EntitlementFeature,
  planIncludesFeature,
  type SubscriptionPlanId,
  UPGRADE_PATH,
} from "@onchain-reputation/shared";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { PREMIUM_REFRESH_DAILY_LIMIT, IndexerOrchestrator } from "../indexer/indexer.orchestrator";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentRequiredException } from "./payment-required.exception";

export type EffectivePlan = SubscriptionPlanId;

@Injectable()
export class EntitlementsService {
  private readonly refreshLimitPerDay = Number(process.env.PREMIUM_REFRESH_LIMIT_PER_DAY ?? 5);

  constructor(
    private readonly prisma: PrismaService,
    private readonly indexer: IndexerOrchestrator,
  ) {}

  async getEffectivePlan(userId: string): Promise<EffectivePlan> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (subscription) {
      if (
        subscription.plan === SubscriptionPlan.premium &&
        (subscription.status === SubscriptionStatus.active ||
          subscription.status === SubscriptionStatus.trialing)
      ) {
        return "premium";
      }
      if (
        subscription.status === SubscriptionStatus.past_due ||
        subscription.status === SubscriptionStatus.canceled
      ) {
        return "free";
      }
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.subscriptionTier === "premium") {
      return "premium";
    }

    return "free";
  }

  async hasEntitlement(userId: string, feature: EntitlementFeature): Promise<boolean> {
    const plan = await this.getEffectivePlan(userId);
    return planIncludesFeature(plan, feature);
  }

  async assertEntitlement(userId: string, feature: EntitlementFeature): Promise<void> {
    if (!(await this.hasEntitlement(userId, feature))) {
      throw new PaymentRequiredException(feature);
    }
  }

  async assertRefreshAllowed(userId: string): Promise<void> {
    const plan = await this.getEffectivePlan(userId);
    if (plan !== "premium") {
      throw new PaymentRequiredException("refresh");
    }

    const used = await this.indexer.countRunsTodayForUser(userId);

    if (used >= PREMIUM_REFRESH_DAILY_LIMIT) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          code: "RATE_LIMITED",
          message: "Daily refresh limit exceeded",
          retryAfterSeconds: 86400,
          upgradeUrl: UPGRADE_PATH,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
