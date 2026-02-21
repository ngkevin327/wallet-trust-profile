import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { IndexerApiModule } from "../indexer/indexer-api.module";
import { UsersModule } from "../users/users.module";
import { BillingController } from "./billing.controller";
import { StripeWebhookController } from "./stripe.webhook.controller";
import { StripeWebhookService } from "./stripe.webhook.service";
import { EntitlementsGuard } from "./entitlements.guard";
import { EntitlementsService } from "./entitlements.service";
import { StripeService } from "./stripe.service";

@Module({
  imports: [forwardRef(() => AuthModule), IndexerApiModule, UsersModule],
  controllers: [BillingController, StripeWebhookController],
  providers: [EntitlementsService, EntitlementsGuard, StripeService, StripeWebhookService],
  exports: [EntitlementsService, EntitlementsGuard, StripeService],
})
export class BillingModule {}
