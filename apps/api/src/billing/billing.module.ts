import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { BillingController } from "./billing.controller";
import { EntitlementsGuard } from "./entitlements.guard";
import { EntitlementsService } from "./entitlements.service";
import { StripeService } from "./stripe.service";

@Module({
  imports: [UsersModule],
  controllers: [BillingController],
  providers: [EntitlementsService, EntitlementsGuard, StripeService],
  exports: [EntitlementsService, EntitlementsGuard, StripeService],
})
export class BillingModule {}
