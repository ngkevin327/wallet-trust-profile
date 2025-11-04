import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  type EntitlementFeature,
  planIncludesFeature,
  type SubscriptionPlanId,
  UPGRADE_PATH,
} from "@onchain-reputation/shared";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentRequiredException } from "./payment-required.exception";

export type EffectivePlan = SubscriptionPlanId;

@Injectable()
export class EntitlementsService {
  private readonly refreshLimitPerDay = Number(process.env.PREMIUM_REFRESH_LIMIT_PER_DAY ?? 5);

  constructor(private readonly prisma: PrismaService) {}

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

    const dayKey = new Date().toISOString().slice(0, 10);
    const key = `refresh:${userId}:${dayKey}`;
    const count = await this.prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count FROM index_runs ir
       JOIN wallets w ON w.id = ir.wallet_id
       WHERE w.user_id = $1::uuid AND ir.started_at >= $2::timestamptz`,
      userId,
      `${dayKey}T00:00:00.000Z`,
    ).catch(() => [{ count: 0n }]);

    const used = Number(count[0]?.count ?? 0);
    if (used >= this.refreshLimitPerDay) {
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
