import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StripeService } from "./stripe.service";

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async handleEvent(event: {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  }): Promise<void> {
    const existing = await this.prisma.stripeWebhookEvent.findUnique({
      where: { id: event.id },
    });
    if (existing) {
      this.logger.debug(`Skipping duplicate webhook ${event.id}`);
      return;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          metadata?: { userId?: string };
          customer?: string;
          subscription?: string;
        };
        const userId = session.metadata?.userId;
        if (userId && session.customer) {
          await this.stripe.upsertPremiumSubscription(
            userId,
            String(session.customer),
            session.subscription ? String(session.subscription) : undefined,
          );
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as {
          metadata?: { userId?: string };
          customer?: string;
          status?: string;
          current_period_end?: number;
        };
        const userId = sub.metadata?.userId;
        if (!userId || !sub.customer) {
          break;
        }
        if (sub.status === "active" || sub.status === "trialing") {
          await this.stripe.upsertPremiumSubscription(
            userId,
            String(sub.customer),
            undefined,
            sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : undefined,
          );
        } else if (sub.status === "canceled" || sub.status === "unpaid") {
          await this.stripe.markSubscriptionCanceled(userId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as { metadata?: { userId?: string } };
        if (sub.metadata?.userId) {
          await this.stripe.markSubscriptionCanceled(sub.metadata.userId);
        }
        break;
      }
      default:
        this.logger.debug(`Unhandled Stripe event type ${event.type}`);
    }

    await this.prisma.stripeWebhookEvent.create({
      data: { id: event.id, type: event.type },
    });
  }
}
