import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { loadApiEnv } from "../config/env.schema";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

type CheckoutResult = { url: string; sessionId: string };

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly env = loadApiEnv();

  constructor(private readonly prisma: PrismaService) {}

  isConfigured(): boolean {
    return Boolean(this.env.stripeSecretKey && this.env.stripePremiumPriceId);
  }

  async createCheckoutSession(params: {
    userId: string;
    email?: string | null;
  }): Promise<CheckoutResult> {
    if (!this.isConfigured()) {
      const sessionId = `mock_cs_${params.userId}`;
      await this.upsertPremiumSubscription(params.userId, `mock_cus_${params.userId}`);
      return {
        sessionId,
        url: `${this.env.stripeSuccessUrl}&mock_session=${sessionId}`,
      };
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(this.env.stripeSecretKey!, { apiVersion: "2025-02-24.acacia" });

    let subscription = await this.prisma.subscription.findUnique({
      where: { userId: params.userId },
    });

    let customerId = subscription?.stripeCustomerId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: params.email ?? undefined,
        metadata: { userId: params.userId },
      });
      customerId = customer.id;
      subscription = await this.prisma.subscription.upsert({
        where: { userId: params.userId },
        create: {
          userId: params.userId,
          stripeCustomerId: customerId,
          plan: SubscriptionPlan.free,
          status: SubscriptionStatus.active,
        },
        update: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: this.env.stripePremiumPriceId!, quantity: 1 }],
      success_url: this.env.stripeSuccessUrl!,
      cancel_url: this.env.stripeCancelUrl!,
      metadata: { userId: params.userId },
    });

    if (!session.url) {
      throw new ServiceUnavailableException("Stripe checkout session missing URL");
    }

    return { url: session.url, sessionId: session.id };
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    if (!this.isConfigured()) {
      return { url: `${this.env.stripeSuccessUrl}&portal=1` };
    }

    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription?.stripeCustomerId) {
      throw new ServiceUnavailableException("No Stripe customer for user");
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(this.env.stripeSecretKey!, { apiVersion: "2025-02-24.acacia" });
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: this.env.stripeSuccessUrl!,
    });

    return { url: session.url };
  }

  async upsertPremiumSubscription(
    userId: string,
    stripeCustomerId: string,
    stripeSubscriptionId?: string,
    currentPeriodEnd?: Date,
  ) {
    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        plan: SubscriptionPlan.premium,
        status: SubscriptionStatus.active,
        currentPeriodEnd,
      },
      update: {
        stripeCustomerId,
        stripeSubscriptionId,
        plan: SubscriptionPlan.premium,
        status: SubscriptionStatus.active,
        currentPeriodEnd,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: "premium" },
    });
  }

  async markSubscriptionCanceled(userId: string) {
    await this.prisma.subscription.updateMany({
      where: { userId },
      data: {
        plan: SubscriptionPlan.free,
        status: SubscriptionStatus.canceled,
      },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: "free" },
    });
  }
}
