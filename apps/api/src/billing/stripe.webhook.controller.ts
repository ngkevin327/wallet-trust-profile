import { Controller, Headers, HttpCode, Logger, Post, RawBodyRequest, Req } from "@nestjs/common";
import { ApiExcludeController, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { loadApiEnv } from "../config/env.schema";
import { StripeWebhookService } from "./stripe.webhook.service";

@ApiTags("billing")
@ApiExcludeController(false)
@Controller("billing/webhooks/stripe")
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private readonly env = loadApiEnv();

  constructor(private readonly webhooks: StripeWebhookService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: "Stripe webhook receiver" })
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature?: string,
  ) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));

    let event: { id: string; type: string; data: { object: Record<string, unknown> } };

    if (this.env.stripeWebhookSecret && signature) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(this.env.stripeSecretKey ?? "sk_test", {
        apiVersion: "2025-02-24.acacia",
      });
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.env.stripeWebhookSecret,
      ) as unknown as typeof event;
    } else {
      event = req.body as typeof event;
      this.logger.warn("Stripe webhook signature verification skipped (dev/mock)");
    }

    try {
      await this.webhooks.handleEvent(event);
    } catch (err) {
      this.logger.error(`Webhook processing failed: ${String(err)}`);
      throw err;
    }

    return { received: true };
  }
}
