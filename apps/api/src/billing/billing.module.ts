import { Module } from "@nestjs/common";
import { IndexerApiModule } from "../indexer/indexer-api.module";
import { UsersModule } from "../users/users.module";
import { BillingController } from "./billing.controller";
import { StripeWebhookController } from "./stripe.webhook.controller";
import { StripeWebhookService } from "./stripe.webhook.service";
import { EntitlementsGuard } from "./entitlements.guard";
import { EntitlementsService } from "./entitlements.service";
import { StripeService } from "./stripe.service";

@Module({
  imports: [IndexerApiModule, UsersModule],
  controllers: [BillingController],
  providers: [EntitlementsService, EntitlementsGuard, StripeService],
  exports: [EntitlementsService, EntitlementsGuard, StripeService],
})
export class BillingModule {}
